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

  -- Limpar dados em ordem para respeitar foreign keys
  DELETE FROM public.pagamentos_tripeiros WHERE TRUE;
  DELETE FROM public.pagamentos_atendentes WHERE TRUE;
  DELETE FROM public.pagamentos WHERE TRUE;
  DELETE FROM public.despesas WHERE TRUE;
  DELETE FROM public.pessoas WHERE TRUE;
  DELETE FROM public.notes_and_reminders WHERE TRUE;

  -- Registrar a ação no log de auditoria
  INSERT INTO public.admin_audit_logs (admin_id, action, details)
  VALUES (auth.uid(), 'clear_all_data', '{"action": "Limpeza completa de todos os dados do sistema"}'::jsonb);

  RAISE NOTICE 'Todos os dados foram limpos com sucesso';
END;
$function$;