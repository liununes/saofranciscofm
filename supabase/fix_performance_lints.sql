-- =============================================
-- CORREÇÃO FINAL DE PERFORMANCE
-- =============================================

-- ADICIONAR O ÚNICO INDEX QUE FALTA
CREATE INDEX IF NOT EXISTS idx_noticias_promocao_id ON public.noticias(promocao_id);

-- REMOVER TODOS OS INDEXES CRIADOS ANTERIORMENTE (NÃO UTILIZADOS)
DROP INDEX IF EXISTS public.idx_banners_radio_id;
DROP INDEX IF EXISTS public.idx_categories_radio_id;
DROP INDEX IF EXISTS public.idx_client_photos_client_id;
DROP INDEX IF EXISTS public.idx_config_versions_radio_id;
DROP INDEX IF EXISTS public.idx_contacts_radio_id;
DROP INDEX IF EXISTS public.idx_meal_items_food_id;
DROP INDEX IF EXISTS public.idx_meal_items_meal_id;
DROP INDEX IF EXISTS public.idx_meals_plan_id;
DROP INDEX IF EXISTS public.idx_news_category_id;
DROP INDEX IF EXISTS public.idx_news_radio_id;
DROP INDEX IF EXISTS public.idx_noticias_patrocinador_id;
DROP INDEX IF EXISTS public.idx_noticias_publicidade_id;
DROP INDEX IF EXISTS public.idx_presenters_radio_id;
DROP INDEX IF EXISTS public.idx_programas_locutor_id;
DROP INDEX IF EXISTS public.idx_programs_presenter_id;
DROP INDEX IF EXISTS public.idx_programs_radio_id;
DROP INDEX IF EXISTS public.idx_push_notifications_radio_id;
DROP INDEX IF EXISTS public.idx_streams_radio_id;
DROP INDEX IF EXISTS public.idx_workout_exercises_workout_id;
DROP INDEX IF EXISTS public.idx_radio_clients_plan_id;
DROP INDEX IF EXISTS public.idx_push_notifications_scheduled;
DROP INDEX IF EXISTS public.idx_site_accesses_dt;
DROP INDEX IF EXISTS public.idx_clients_email_password;
