-- Remover políticas existentes que podem causar conflito
DROP POLICY IF EXISTS "Service role pode inserir logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Admins podem criar logs de auditoria" ON public.admin_audit_logs;

-- Criar política que permite inserção tanto de admins quanto do service role
CREATE POLICY "Permitir inserção de logs"
  ON public.admin_audit_logs
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (
    -- Permitir se for service role (usado pelos edge functions)
    current_setting('role') = 'service_role'
    OR 
    -- Ou se for admin autenticado
    public.has_role(auth.uid(), 'admin')
  );