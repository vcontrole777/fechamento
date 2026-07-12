
-- Criar função para limpar todos os dados de uma equipe
CREATE OR REPLACE FUNCTION public.limpar_dados_equipe(equipe_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário pertence à equipe ou é admin
  IF NOT (is_admin() OR get_user_equipe_id() = equipe_id) THEN
    RAISE EXCEPTION 'Você não tem permissão para limpar os dados desta equipe';
  END IF;

  -- Limpar dados na ordem correta (devido às dependências)
  DELETE FROM public.pagamentos WHERE id_equipe = equipe_id;
  DELETE FROM public.recebimentos WHERE id_equipe = equipe_id;
  DELETE FROM public.despesas WHERE id_equipe = equipe_id;
  DELETE FROM public.contas_bancarias WHERE id_equipe = equipe_id;
  DELETE FROM public.pessoas WHERE id_equipe = equipe_id;
  
  -- Log da operação
  RAISE NOTICE 'Dados da equipe % limpos com sucesso', equipe_id;
END;
$$;

-- Dar permissão para usuários autenticados executarem a função
GRANT EXECUTE ON FUNCTION public.limpar_dados_equipe(integer) TO authenticated;
