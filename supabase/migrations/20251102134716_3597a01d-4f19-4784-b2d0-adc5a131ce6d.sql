-- Criar tabela de logs de auditoria para ações administrativas
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target_user_id ON public.admin_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

-- Adicionar comentários
COMMENT ON TABLE public.admin_audit_logs IS 'Registro de auditoria de ações administrativas no sistema';
COMMENT ON COLUMN public.admin_audit_logs.admin_id IS 'ID do administrador que executou a ação';
COMMENT ON COLUMN public.admin_audit_logs.action IS 'Tipo de ação executada (block, unblock, delete, etc)';
COMMENT ON COLUMN public.admin_audit_logs.target_user_id IS 'ID do usuário afetado pela ação';
COMMENT ON COLUMN public.admin_audit_logs.details IS 'Detalhes adicionais da ação em formato JSON';

-- Habilitar RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - apenas admins podem ler os logs
CREATE POLICY "Admins podem ver todos os logs de auditoria"
  ON public.admin_audit_logs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Permitir inserção de logs pelo service role (edge functions)
CREATE POLICY "Service role pode inserir logs"
  ON public.admin_audit_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);