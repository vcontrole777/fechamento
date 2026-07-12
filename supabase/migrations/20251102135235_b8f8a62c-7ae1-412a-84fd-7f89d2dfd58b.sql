-- Atualizar a função para remover referência à tabela inexistente
CREATE OR REPLACE FUNCTION public.deletar_equipe_completa_admin(equipe_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Esta função assume que a verificação de admin já foi feita
  -- no edge function antes de chamar
  
  -- Deletar dados na ordem correta (devido às dependências)
  DELETE FROM public.pagamentos_tripeiros WHERE id_equipe = equipe_id;
  DELETE FROM public.pagamentos_atendentes WHERE id_equipe = equipe_id;
  DELETE FROM public.pagamentos WHERE id_equipe = equipe_id;
  DELETE FROM public.despesas WHERE id_equipe = equipe_id;
  DELETE FROM public.pessoas WHERE id_equipe = equipe_id;
  
  -- Deletar a equipe
  DELETE FROM public.equipes WHERE id = equipe_id;
  
  RAISE NOTICE 'Equipe % e todos os seus dados foram deletados via admin', equipe_id;
END;
$$;

-- Também atualizar a função original para manter consistência
CREATE OR REPLACE FUNCTION public.deletar_equipe_completa(equipe_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  DELETE FROM public.pessoas WHERE id_equipe = equipe_id;
  
  -- Deletar a equipe
  DELETE FROM public.equipes WHERE id = equipe_id;
  
  RAISE NOTICE 'Equipe % e todos os seus dados foram deletados', equipe_id;
END;
$$;

-- Também atualizar a função limpar_dados_equipe
CREATE OR REPLACE FUNCTION public.limpar_dados_equipe(equipe_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  DELETE FROM public.pessoas WHERE id_equipe = equipe_id;
  
  -- Log da operação
  RAISE NOTICE 'Dados da equipe % limpos com sucesso', equipe_id;
END;
$$;