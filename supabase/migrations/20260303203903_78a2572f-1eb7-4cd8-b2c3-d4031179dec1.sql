
ALTER TABLE public.publicidade_noticias ADD COLUMN IF NOT EXISTS data_inicio date DEFAULT NULL;
ALTER TABLE public.publicidade_noticias ADD COLUMN IF NOT EXISTS data_fim date DEFAULT NULL;
