-- Corrigir search_path das funções existentes para segurança

-- 1. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$function$;

-- 2. Atualizar is_admin para usar a nova tabela user_roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$function$;

-- 3. make_user_admin - atualizar para usar user_roles
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  target_user_id UUID;
BEGIN
  -- Buscar ID do usuário
  SELECT id INTO target_user_id
  FROM auth.users 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário com email % não encontrado', user_email;
  END IF;
  
  -- Adicionar role de admin na nova tabela
  INSERT INTO public.user_roles (user_id, role, created_by)
  VALUES (target_user_id, 'admin', auth.uid())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Atualizar também na tabela profiles para compatibilidade
  UPDATE public.profiles 
  SET role = 'admin'
  WHERE id = target_user_id;
END;
$function$;

-- 4. limpar_dados_equipe
CREATE OR REPLACE FUNCTION public.limpar_dados_equipe(equipe_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- 5. get_user_equipe_id
CREATE OR REPLACE FUNCTION public.get_user_equipe_id()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  equipe_id INTEGER;
BEGIN
  SELECT id_equipe INTO equipe_id
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN equipe_id;
END;
$function$;

-- 6. handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, nome, id_equipe)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'nome',
    (new.raw_user_meta_data->>'id_equipe')::integer
  );
  
  -- Adicionar role 'user' por padrão
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN new;
END;
$function$;