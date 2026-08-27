-- Restore secure admin CRUD after the RLS hardening migration.
-- Admins keep full access; delegated users use the permission assigned in
-- public.user_permissions and the UI menu with the same permission.

CREATE OR REPLACE FUNCTION public.has_permission(p_user_id UUID, p_permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(p_user_id, 'admin'::app_role)
    OR EXISTS (
      SELECT 1
      FROM public.user_permissions
      WHERE user_id = p_user_id
        AND permission = p_permission
    )
$$;

-- radio_config is shared by several sections. The panel sends the complete
-- configuration in one update, so either general or streaming permission is
-- required for this table.
DROP POLICY IF EXISTS "Admins can update radio config" ON public.radio_config;
DROP POLICY IF EXISTS "Authenticated can update radio config" ON public.radio_config;
DROP POLICY IF EXISTS "Authenticated can insert radio config" ON public.radio_config;
DROP POLICY IF EXISTS "Content editors can manage radio config" ON public.radio_config;
CREATE POLICY "Content editors can manage radio config"
ON public.radio_config
FOR ALL
TO authenticated
USING (
  public.has_permission(auth.uid(), 'editar_geral')
  OR public.has_permission(auth.uid(), 'editar_streaming')
)
WITH CHECK (
  public.has_permission(auth.uid(), 'editar_geral')
  OR public.has_permission(auth.uid(), 'editar_streaming')
);

DROP POLICY IF EXISTS "Admins can manage locutores" ON public.locutores;
DROP POLICY IF EXISTS "Authenticated can manage locutores" ON public.locutores;
DROP POLICY IF EXISTS "Content editors can manage locutores" ON public.locutores;
CREATE POLICY "Content editors can manage locutores"
ON public.locutores FOR ALL TO authenticated
USING (public.has_permission(auth.uid(), 'editar_locutores'))
WITH CHECK (public.has_permission(auth.uid(), 'editar_locutores'));

DROP POLICY IF EXISTS "Admins can manage programas" ON public.programas;
DROP POLICY IF EXISTS "Authenticated can manage programas" ON public.programas;
DROP POLICY IF EXISTS "Content editors can manage programas" ON public.programas;
CREATE POLICY "Content editors can manage programas"
ON public.programas FOR ALL TO authenticated
USING (public.has_permission(auth.uid(), 'editar_programacao'))
WITH CHECK (public.has_permission(auth.uid(), 'editar_programacao'));

DROP POLICY IF EXISTS "Admins can manage noticias" ON public.noticias;
DROP POLICY IF EXISTS "Authenticated can manage noticias" ON public.noticias;
DROP POLICY IF EXISTS "Content editors can manage noticias" ON public.noticias;
CREATE POLICY "Content editors can manage noticias"
ON public.noticias FOR ALL TO authenticated
USING (public.has_permission(auth.uid(), 'editar_noticias'))
WITH CHECK (public.has_permission(auth.uid(), 'editar_noticias'));

DROP POLICY IF EXISTS "Admins can manage patrocinadores" ON public.patrocinadores;
DROP POLICY IF EXISTS "Authenticated can manage patrocinadores" ON public.patrocinadores;
DROP POLICY IF EXISTS "Content editors can manage patrocinadores" ON public.patrocinadores;
CREATE POLICY "Content editors can manage patrocinadores"
ON public.patrocinadores FOR ALL TO authenticated
USING (public.has_permission(auth.uid(), 'editar_patrocinadores'))
WITH CHECK (public.has_permission(auth.uid(), 'editar_patrocinadores'));

DROP POLICY IF EXISTS "Admins can manage musicas" ON public.musicas_recentes;
DROP POLICY IF EXISTS "Authenticated can manage musicas" ON public.musicas_recentes;
DROP POLICY IF EXISTS "Content editors can manage musicas" ON public.musicas_recentes;
CREATE POLICY "Content editors can manage musicas"
ON public.musicas_recentes FOR ALL TO authenticated
USING (public.has_permission(auth.uid(), 'editar_musicas'))
WITH CHECK (public.has_permission(auth.uid(), 'editar_musicas'));

DROP POLICY IF EXISTS "Admins can manage slides" ON public.slide_imagens;
DROP POLICY IF EXISTS "Authenticated can manage slides" ON public.slide_imagens;
DROP POLICY IF EXISTS "Content editors can manage slides" ON public.slide_imagens;
CREATE POLICY "Content editors can manage slides"
ON public.slide_imagens FOR ALL TO authenticated
USING (public.has_permission(auth.uid(), 'editar_slides'))
WITH CHECK (public.has_permission(auth.uid(), 'editar_slides'));

DROP POLICY IF EXISTS "Admins can manage paginas" ON public.paginas;
DROP POLICY IF EXISTS "Authenticated can manage paginas" ON public.paginas;
DROP POLICY IF EXISTS "Content editors can manage paginas" ON public.paginas;
CREATE POLICY "Content editors can manage paginas"
ON public.paginas FOR ALL TO authenticated
USING (public.has_permission(auth.uid(), 'editar_paginas'))
WITH CHECK (public.has_permission(auth.uid(), 'editar_paginas'));

DROP POLICY IF EXISTS "Admins can manage social_links" ON public.social_links;
DROP POLICY IF EXISTS "Authenticated can manage social_links" ON public.social_links;
DROP POLICY IF EXISTS "Content editors can manage social_links" ON public.social_links;
CREATE POLICY "Content editors can manage social_links"
ON public.social_links FOR ALL TO authenticated
USING (public.has_permission(auth.uid(), 'editar_geral'))
WITH CHECK (public.has_permission(auth.uid(), 'editar_geral'));

DROP POLICY IF EXISTS "Admins can manage promocoes" ON public.promocoes;
DROP POLICY IF EXISTS "Authenticated can manage promocoes" ON public.promocoes;
DROP POLICY IF EXISTS "Content editors can manage promocoes" ON public.promocoes;
CREATE POLICY "Content editors can manage promocoes"
ON public.promocoes FOR ALL TO authenticated
USING (public.has_permission(auth.uid(), 'editar_noticias'))
WITH CHECK (public.has_permission(auth.uid(), 'editar_noticias'));

DROP POLICY IF EXISTS "Admins can manage publicidade" ON public.publicidade_noticias;
DROP POLICY IF EXISTS "Authenticated can manage publicidade" ON public.publicidade_noticias;
DROP POLICY IF EXISTS "Content editors can manage publicidade" ON public.publicidade_noticias;
CREATE POLICY "Content editors can manage publicidade"
ON public.publicidade_noticias FOR ALL TO authenticated
USING (public.has_permission(auth.uid(), 'editar_noticias'))
WITH CHECK (public.has_permission(auth.uid(), 'editar_noticias'));

-- User management is restricted to admins or users with the dedicated
-- permission. This also lets the existing management screen load profiles.
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;
CREATE POLICY "Managers can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_permission(auth.uid(), 'gerenciar_usuarios'));

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Managers can manage roles" ON public.user_roles;
CREATE POLICY "Managers can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_permission(auth.uid(), 'gerenciar_usuarios'))
WITH CHECK (public.has_permission(auth.uid(), 'gerenciar_usuarios'));

DROP POLICY IF EXISTS "Admins can manage permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Managers can manage permissions" ON public.user_permissions;
CREATE POLICY "Managers can manage permissions"
ON public.user_permissions FOR ALL TO authenticated
USING (public.has_permission(auth.uid(), 'gerenciar_usuarios'))
WITH CHECK (public.has_permission(auth.uid(), 'gerenciar_usuarios'));

-- The application already identifies this account as the master account.
-- Keep that identity consistent with the database authorization model.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE lower(email) = 'liununes06@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Ensure a future sign-up of the configured master account receives the role.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  )
  ON CONFLICT (user_id) DO NOTHING;

  IF lower(COALESCE(NEW.email, '')) = 'liununes06@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
