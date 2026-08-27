-- Bootstrap do acesso administrativo da São Francisco FM.
-- Execute no SQL Editor do projeto Supabase correto depois de criar/confirmar
-- a conta com este e-mail no Authentication > Users.

DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  SELECT id
    INTO admin_user_id
  FROM auth.users
  WHERE lower(email) = lower('liununes06@gmail.com')
  LIMIT 1;

  IF admin_user_id IS NULL THEN
    RAISE NOTICE 'Usuário liununes06@gmail.com ainda não existe em auth.users; crie a conta e execute esta migração novamente.';
    RETURN;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (admin_user_id, 'liununes06@gmail.com', 'Administrador São Francisco FM')
  ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email,
        display_name = COALESCE(NULLIF(public.profiles.display_name, ''), EXCLUDED.display_name),
        updated_at = now();
END
$$;
