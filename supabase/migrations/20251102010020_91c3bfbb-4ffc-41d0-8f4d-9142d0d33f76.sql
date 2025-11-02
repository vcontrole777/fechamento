-- ===================================================
-- FASE 1: Sistema de Roles Seguro
-- ===================================================

-- Criar enum para roles (nome diferente para evitar conflito)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Criar tabela de roles separada
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Política para admins visualizarem roles
CREATE POLICY "Admins podem visualizar todas as roles"
ON public.user_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Política para admins gerenciarem roles
CREATE POLICY "Admins podem gerenciar roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Função security definer para verificar roles (substitui is_admin())
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Migrar dados existentes - converter string para enum corretamente
INSERT INTO public.user_roles (user_id, role)
SELECT id, 
  CASE 
    WHEN role::text = 'admin' THEN 'admin'::app_role
    ELSE 'user'::app_role
  END as role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- ===================================================
-- FASE 2: Sistema de Notificações
-- ===================================================

-- Criar tabela de notificações do sistema
CREATE TABLE public.system_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info', -- info, warning, success, error
    priority INTEGER DEFAULT 1, -- 1=low, 2=normal, 3=high, 4=urgent
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para rastrear notificações lidas por usuário
CREATE TABLE public.user_notification_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    notification_id UUID REFERENCES system_notifications(id) ON DELETE CASCADE NOT NULL,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, notification_id)
);

-- Habilitar RLS
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_reads ENABLE ROW LEVEL SECURITY;

-- RLS: Todos podem ver notificações ativas
CREATE POLICY "Usuários podem ver notificações ativas"
ON public.system_notifications
FOR SELECT
USING (
  active = true 
  AND start_date <= NOW() 
  AND (end_date IS NULL OR end_date >= NOW())
);

-- RLS: Admins podem gerenciar notificações
CREATE POLICY "Admins podem gerenciar notificações"
ON public.system_notifications
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS: Usuários podem ver suas próprias leituras
CREATE POLICY "Usuários podem ver suas leituras"
ON public.user_notification_reads
FOR SELECT
USING (user_id = auth.uid());

-- RLS: Usuários podem marcar suas próprias notificações como lidas
CREATE POLICY "Usuários podem marcar notificações como lidas"
ON public.user_notification_reads
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- ===================================================
-- FASE 3: Logs de Auditoria
-- ===================================================

-- Criar tabela de logs de auditoria para ações administrativas
CREATE TABLE public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    action TEXT NOT NULL,
    target_user_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS: Apenas admins podem visualizar logs
CREATE POLICY "Admins podem visualizar logs de auditoria"
ON public.admin_audit_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS: Apenas admins podem criar logs
CREATE POLICY "Admins podem criar logs de auditoria"
ON public.admin_audit_logs
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Criar índices para melhor performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_system_notifications_active ON public.system_notifications(active, start_date, end_date);
CREATE INDEX idx_user_notification_reads_user_id ON public.user_notification_reads(user_id);
CREATE INDEX idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX idx_admin_audit_logs_target_user_id ON public.admin_audit_logs(target_user_id);

-- Trigger para atualizar updated_at em system_notifications
CREATE TRIGGER update_system_notifications_updated_at
BEFORE UPDATE ON public.system_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();