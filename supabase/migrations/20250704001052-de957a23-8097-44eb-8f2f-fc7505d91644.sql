-- Função para tornar um usuário admin pelo email
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET role = 'admin'
  WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = user_email
  );
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário com email % não encontrado', user_email;
  END IF;
END;
$$;

-- Exemplo de como usar (descomente e altere o email):
-- SELECT public.make_user_admin('seu-email@example.com');

-- Para facilitar, vamos também criar uma atualização direta se você quiser definir o primeiro usuário como admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id 
  FROM public.profiles 
  ORDER BY id 
  LIMIT 1
);