
-- Reinforce RLS policies for all tables to strictly require admin role for write operations

-- Radio Config
DROP POLICY IF EXISTS "Authenticated can update radio config" ON public.radio_config;
CREATE POLICY "Admins can update radio config" ON public.radio_config 
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Locutores
DROP POLICY IF EXISTS "Authenticated can manage locutores" ON public.locutores;
CREATE POLICY "Admins can manage locutores" ON public.locutores 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Programas
DROP POLICY IF EXISTS "Authenticated can manage programas" ON public.programas;
CREATE POLICY "Admins can manage programas" ON public.programas 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Noticias
DROP POLICY IF EXISTS "Authenticated can manage noticias" ON public.noticias;
CREATE POLICY "Admins can manage noticias" ON public.noticias 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Patrocinadores
DROP POLICY IF EXISTS "Authenticated can manage patrocinadores" ON public.patrocinadores;
CREATE POLICY "Admins can manage patrocinadores" ON public.patrocinadores 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Musicas Recentes
DROP POLICY IF EXISTS "Authenticated can manage musicas" ON public.musicas_recentes;
CREATE POLICY "Admins can manage musicas" ON public.musicas_recentes 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Slide Imagens
DROP POLICY IF EXISTS "Authenticated can manage slides" ON public.slide_imagens;
CREATE POLICY "Admins can manage slides" ON public.slide_imagens 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Promocoes
DROP POLICY IF EXISTS "Authenticated can manage promocoes" ON public.promocoes;
CREATE POLICY "Admins can manage promocoes" ON public.promocoes 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Publicidade Noticias
DROP POLICY IF EXISTS "Authenticated can manage publicidade" ON public.publicidade_noticias;
CREATE POLICY "Admins can manage publicidade" ON public.publicidade_noticias 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Social Links
DROP POLICY IF EXISTS "Authenticated can manage social_links" ON public.social_links;
CREATE POLICY "Admins can manage social_links" ON public.social_links 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Paginas
DROP POLICY IF EXISTS "Authenticated can manage paginas" ON public.paginas;
CREATE POLICY "Admins can manage paginas" ON public.paginas 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Page Views (Privacy)
DROP POLICY IF EXISTS "Allow authenticated select" ON public.page_views;
CREATE POLICY "Admins can select page views" ON public.page_views 
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
