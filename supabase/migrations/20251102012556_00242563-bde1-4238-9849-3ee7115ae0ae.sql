-- Corrigir CASCADE em notes_and_reminders para não bloquear deleção de usuário
ALTER TABLE notes_and_reminders 
DROP CONSTRAINT IF EXISTS notes_and_reminders_user_id_fkey;

ALTER TABLE notes_and_reminders
ADD CONSTRAINT notes_and_reminders_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Criar função para deletar equipe e todos seus dados
CREATE OR REPLACE FUNCTION public.deletar_equipe_completa(equipe_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se o usuário é admin (necessário para usar esta função)
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem deletar equipes completas';
  END IF;

  -- Deletar dados na ordem correta (devido às dependências)
  DELETE FROM public.pagamentos WHERE id_equipe = equipe_id;
  DELETE FROM public.recebimentos WHERE id_equipe = equipe_id;
  DELETE FROM public.despesas WHERE id_equipe = equipe_id;
  DELETE FROM public.contas_bancarias WHERE id_equipe = equipe_id;
  DELETE FROM public.pessoas WHERE id_equipe = equipe_id;
  
  -- Deletar a equipe
  DELETE FROM public.equipes WHERE id = equipe_id;
  
  RAISE NOTICE 'Equipe % e todos os seus dados foram deletados', equipe_id;
END;
$$;