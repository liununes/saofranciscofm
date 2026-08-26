-- CORREÇÃO ÚNICA: Recria todas as políticas com (select) wrapper
-- Execute este SQL completo no SQL Editor do Supabase

-- === body_measurements ===
DROP POLICY IF EXISTS "Admins can manage body_measurements" ON public.body_measurements;
CREATE POLICY "Admins can manage body_measurements" ON public.body_measurements
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === client_photos ===
DROP POLICY IF EXISTS "Admins can manage client_photos" ON public.client_photos;
CREATE POLICY "Admins can manage client_photos" ON public.client_photos
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === clients ===
DROP POLICY IF EXISTS "Admins can manage clients" ON public.clients;
CREATE POLICY "Admins can manage clients" ON public.clients
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === daily_logs ===
DROP POLICY IF EXISTS "Admins can manage daily_logs" ON public.daily_logs;
CREATE POLICY "Admins can manage daily_logs" ON public.daily_logs
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === foods ===
DROP POLICY IF EXISTS "Admins can manage foods" ON public.foods;
CREATE POLICY "Admins can manage foods" ON public.foods
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === meal_items ===
DROP POLICY IF EXISTS "Admins can manage meal_items" ON public.meal_items;
CREATE POLICY "Admins can manage meal_items" ON public.meal_items
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === meal_plans ===
DROP POLICY IF EXISTS "Admins can manage meal_plans" ON public.meal_plans;
CREATE POLICY "Admins can manage meal_plans" ON public.meal_plans
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === meals ===
DROP POLICY IF EXISTS "Admins can manage meals" ON public.meals;
CREATE POLICY "Admins can manage meals" ON public.meals
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === mp_requests ===
DROP POLICY IF EXISTS "Admins can manage mp_requests" ON public.mp_requests;
CREATE POLICY "Admins can manage mp_requests" ON public.mp_requests
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === mp_requests_v2 ===
DROP POLICY IF EXISTS "Admins can manage mp_requests_v2" ON public.mp_requests_v2;
CREATE POLICY "Admins can manage mp_requests_v2" ON public.mp_requests_v2
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === radio_clients ===
DROP POLICY IF EXISTS "Admins can manage radio_clients" ON public.radio_clients;
CREATE POLICY "Admins can manage radio_clients" ON public.radio_clients
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === radio_plans ===
DROP POLICY IF EXISTS "Admins can manage radio_plans" ON public.radio_plans;
CREATE POLICY "Admins can manage radio_plans" ON public.radio_plans
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === water_goals ===
DROP POLICY IF EXISTS "Admins can manage water_goals" ON public.water_goals;
CREATE POLICY "Admins can manage water_goals" ON public.water_goals
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === workout_exercises ===
DROP POLICY IF EXISTS "Admins can manage workout_exercises" ON public.workout_exercises;
CREATE POLICY "Admins can manage workout_exercises" ON public.workout_exercises
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === workouts ===
DROP POLICY IF EXISTS "Admins can manage workouts" ON public.workouts;
CREATE POLICY "Admins can manage workouts" ON public.workouts
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === radio_config ===
DROP POLICY IF EXISTS "Admins can update radio config" ON public.radio_config;
CREATE POLICY "Admins can update radio config" ON public.radio_config
FOR UPDATE USING ((select public.has_role(auth.uid(), 'admin')));

-- === locutores ===
DROP POLICY IF EXISTS "Admins can manage locutores" ON public.locutores;
DROP POLICY IF EXISTS "rls_locutores_all" ON public.locutores;
DROP POLICY IF EXISTS "rls_locutores_select" ON public.locutores;
CREATE POLICY "Admins can manage locutores" ON public.locutores
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === programas ===
DROP POLICY IF EXISTS "Admins can manage programas" ON public.programas;
DROP POLICY IF EXISTS "rls_programas_all" ON public.programas;
DROP POLICY IF EXISTS "rls_programas_select" ON public.programas;
CREATE POLICY "Admins can manage programas" ON public.programas
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === noticias ===
DROP POLICY IF EXISTS "Admins can manage noticias" ON public.noticias;
DROP POLICY IF EXISTS "rls_noticias_all" ON public.noticias;
DROP POLICY IF EXISTS "rls_noticias_select" ON public.noticias;
CREATE POLICY "Admins can manage noticias" ON public.noticias
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === patrocinadores ===
DROP POLICY IF EXISTS "Admins can manage patrocinadores" ON public.patrocinadores;
DROP POLICY IF EXISTS "rls_patrocinadores_all" ON public.patrocinadores;
DROP POLICY IF EXISTS "rls_patrocinadores_select" ON public.patrocinadores;
CREATE POLICY "Admins can manage patrocinadores" ON public.patrocinadores
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === musicas_recentes ===
DROP POLICY IF EXISTS "Admins can manage musicas" ON public.musicas_recentes;
DROP POLICY IF EXISTS "rls_musicas_all" ON public.musicas_recentes;
DROP POLICY IF EXISTS "rls_musicas_select" ON public.musicas_recentes;
CREATE POLICY "Admins can manage musicas" ON public.musicas_recentes
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === slide_imagens ===
DROP POLICY IF EXISTS "Admins can manage slides" ON public.slide_imagens;
DROP POLICY IF EXISTS "rls_slideimagens_all" ON public.slide_imagens;
DROP POLICY IF EXISTS "rls_slideimagens_select" ON public.slide_imagens;
CREATE POLICY "Admins can manage slides" ON public.slide_imagens
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === promocoes ===
DROP POLICY IF EXISTS "Admins can manage promocoes" ON public.promocoes;
DROP POLICY IF EXISTS "rls_promocoes_all" ON public.promocoes;
DROP POLICY IF EXISTS "rls_promocoes_select" ON public.promocoes;
CREATE POLICY "Admins can manage promocoes" ON public.promocoes
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === publicidade_noticias ===
DROP POLICY IF EXISTS "Admins can manage publicidade" ON public.publicidade_noticias;
DROP POLICY IF EXISTS "rls_pubnoticias_all" ON public.publicidade_noticias;
DROP POLICY IF EXISTS "rls_pubnoticias_select" ON public.publicidade_noticias;
CREATE POLICY "Admins can manage publicidade" ON public.publicidade_noticias
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === social_links ===
DROP POLICY IF EXISTS "Admins can manage social_links" ON public.social_links;
DROP POLICY IF EXISTS "rls_sociallinks_all" ON public.social_links;
DROP POLICY IF EXISTS "rls_sociallinks_select" ON public.social_links;
CREATE POLICY "Admins can manage social_links" ON public.social_links
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === paginas ===
DROP POLICY IF EXISTS "Admins can manage paginas" ON public.paginas;
DROP POLICY IF EXISTS "rls_paginas_all" ON public.paginas;
DROP POLICY IF EXISTS "rls_paginas_select" ON public.paginas;
CREATE POLICY "Admins can manage paginas" ON public.paginas
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- === page_views ===
DROP POLICY IF EXISTS "Admins can select page views" ON public.page_views;
DROP POLICY IF EXISTS "rls_pageviews_select" ON public.page_views;
CREATE POLICY "Admins can select page views" ON public.page_views
FOR SELECT USING ((select public.has_role(auth.uid(), 'admin')));
