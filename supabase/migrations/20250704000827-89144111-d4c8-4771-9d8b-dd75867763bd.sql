-- Criar enum para tipos de usuário
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- Adicionar coluna role na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN role public.user_role NOT NULL DEFAULT 'user';

-- Criar função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Atualizar políticas RLS para permitir acesso admin
-- Políticas para equipes
DROP POLICY IF EXISTS "Usuários podem visualizar suas próprias equipes" ON public.equipes;
CREATE POLICY "Usuários podem visualizar equipes (admin ou própria equipe)"
ON public.equipes
FOR SELECT
USING (
  public.is_admin() OR 
  id = get_user_equipe_id()
);

-- Políticas para pessoas
DROP POLICY IF EXISTS "Usuários podem visualizar pessoas da sua equipe" ON public.pessoas;
CREATE POLICY "Usuários podem visualizar pessoas (admin ou própria equipe)"
ON public.pessoas
FOR SELECT
USING (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

DROP POLICY IF EXISTS "Usuários podem atualizar pessoas da sua equipe" ON public.pessoas;
CREATE POLICY "Usuários podem atualizar pessoas (admin ou própria equipe)"
ON public.pessoas
FOR UPDATE
USING (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

DROP POLICY IF EXISTS "Usuários podem criar pessoas na sua equipe" ON public.pessoas;
CREATE POLICY "Usuários podem criar pessoas (admin ou própria equipe)"
ON public.pessoas
FOR INSERT
WITH CHECK (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

DROP POLICY IF EXISTS "Usuários podem deletar pessoas da sua equipe" ON public.pessoas;
CREATE POLICY "Usuários podem deletar pessoas (admin ou própria equipe)"
ON public.pessoas
FOR DELETE
USING (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

-- Políticas para pagamentos
DROP POLICY IF EXISTS "Usuários podem visualizar pagamentos da sua equipe" ON public.pagamentos;
CREATE POLICY "Usuários podem visualizar pagamentos (admin ou própria equipe)"
ON public.pagamentos
FOR SELECT
USING (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

DROP POLICY IF EXISTS "Usuários podem atualizar pagamentos da sua equipe" ON public.pagamentos;
CREATE POLICY "Usuários podem atualizar pagamentos (admin ou própria equipe)"
ON public.pagamentos
FOR UPDATE
USING (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

DROP POLICY IF EXISTS "Usuários podem criar pagamentos na sua equipe" ON public.pagamentos;
CREATE POLICY "Usuários podem criar pagamentos (admin ou própria equipe)"
ON public.pagamentos
FOR INSERT
WITH CHECK (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

DROP POLICY IF EXISTS "Usuários podem deletar pagamentos da sua equipe" ON public.pagamentos;
CREATE POLICY "Usuários podem deletar pagamentos (admin ou própria equipe)"
ON public.pagamentos
FOR DELETE
USING (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

-- Políticas para despesas
DROP POLICY IF EXISTS "Usuários podem visualizar despesas da sua equipe" ON public.despesas;
CREATE POLICY "Usuários podem visualizar despesas (admin ou própria equipe)"
ON public.despesas
FOR SELECT
USING (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

DROP POLICY IF EXISTS "Usuários podem atualizar despesas da sua equipe" ON public.despesas;
CREATE POLICY "Usuários podem atualizar despesas (admin ou própria equipe)"
ON public.despesas
FOR UPDATE
USING (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

DROP POLICY IF EXISTS "Usuários podem criar despesas na sua equipe" ON public.despesas;
CREATE POLICY "Usuários podem criar despesas (admin ou própria equipe)"
ON public.despesas
FOR INSERT
WITH CHECK (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

DROP POLICY IF EXISTS "Usuários podem deletar despesas da sua equipe" ON public.despesas;
CREATE POLICY "Usuários podem deletar despesas (admin ou própria equipe)"
ON public.despesas
FOR DELETE
USING (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

-- Políticas para recebimentos
CREATE POLICY "Usuários podem visualizar recebimentos (admin ou própria equipe)"
ON public.recebimentos
FOR SELECT
USING (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

CREATE POLICY "Usuários podem atualizar recebimentos (admin ou própria equipe)"
ON public.recebimentos
FOR UPDATE
USING (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

CREATE POLICY "Usuários podem criar recebimentos (admin ou própria equipe)"
ON public.recebimentos
FOR INSERT
WITH CHECK (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

CREATE POLICY "Usuários podem deletar recebimentos (admin ou própria equipe)"
ON public.recebimentos
FOR DELETE
USING (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

-- Políticas para contas bancárias
CREATE POLICY "Usuários podem visualizar contas bancárias (admin ou própria equipe)"
ON public.contas_bancarias
FOR SELECT
USING (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

CREATE POLICY "Usuários podem atualizar contas bancárias (admin ou própria equipe)"
ON public.contas_bancarias
FOR UPDATE
USING (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

CREATE POLICY "Usuários podem criar contas bancárias (admin ou própria equipe)"
ON public.contas_bancarias
FOR INSERT
WITH CHECK (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

CREATE POLICY "Usuários podem deletar contas bancárias (admin ou própria equipe)"
ON public.contas_bancarias
FOR DELETE
USING (
  public.is_admin() OR 
  id_equipe = get_user_equipe_id()
);

-- Habilitar RLS nas tabelas que ainda não têm
ALTER TABLE public.recebimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_bancarias ENABLE ROW LEVEL SECURITY;