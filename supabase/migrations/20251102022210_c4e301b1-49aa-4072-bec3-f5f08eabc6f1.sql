-- Atualiza a função deletar_equipe_completa para permitir que admins deletem qualquer equipe
CREATE OR REPLACE FUNCTION public.deletar_equipe_completa(equipe_id integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se o usuário é admin (não precisa verificar se pertence à equipe)
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem deletar equipes completas';
  END IF;

  -- Deletar dados na ordem correta (devido às dependências)
  DELETE FROM public.pagamentos_tripeiros WHERE id_equipe = equipe_id;
  DELETE FROM public.pagamentos_atendentes WHERE id_equipe = equipe_id;
  DELETE FROM public.pagamentos WHERE id_equipe = equipe_id;
  DELETE FROM public.despesas WHERE id_equipe = equipe_id;
  DELETE FROM public.contas_bancarias WHERE id_equipe = equipe_id;
  DELETE FROM public.pessoas WHERE id_equipe = equipe_id;
  
  -- Deletar a equipe
  DELETE FROM public.equipes WHERE id = equipe_id;
  
  RAISE NOTICE 'Equipe % e todos os seus dados foram deletados', equipe_id;
END;
$function$;