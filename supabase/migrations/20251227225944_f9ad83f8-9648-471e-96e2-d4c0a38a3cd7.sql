-- Função para limpar todos os dados do banco (apenas admin)
CREATE OR REPLACE FUNCTION public.limpar_todos_dados()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se o usuário é admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem limpar todos os dados';
  END IF;

  -- Limpar dados na ordem correta (devido às dependências)
  DELETE FROM public.pagamentos_tripeiros;
  DELETE FROM public.pagamentos_atendentes;
  DELETE FROM public.pagamentos;
  DELETE FROM public.despesas;
  DELETE FROM public.pessoas;
  DELETE FROM public.notes_and_reminders;
  
  -- Log da operação
  INSERT INTO public.admin_audit_logs (admin_id, action, details)
  VALUES (auth.uid(), 'clear_all_data', '{"action": "Limpeza completa de todos os dados do sistema"}'::jsonb);
  
  RAISE NOTICE 'Todos os dados foram limpos com sucesso';
END;
$function$;