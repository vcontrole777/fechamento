-- Criar uma função alternativa que pode ser chamada pelo service role
-- Esta função não verifica is_admin() pois assume que a chamada já foi autorizada
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
  DELETE FROM public.contas_bancarias WHERE id_equipe = equipe_id;
  DELETE FROM public.pessoas WHERE id_equipe = equipe_id;
  
  -- Deletar a equipe
  DELETE FROM public.equipes WHERE id = equipe_id;
  
  RAISE NOTICE 'Equipe % e todos os seus dados foram deletados via admin', equipe_id;
END;
$$;

-- Adicionar comentário
COMMENT ON FUNCTION public.deletar_equipe_completa_admin(integer) IS 
'Função para deletar equipe completa quando chamada por edge functions com service role. A verificação de permissão deve ser feita antes de chamar esta função.';