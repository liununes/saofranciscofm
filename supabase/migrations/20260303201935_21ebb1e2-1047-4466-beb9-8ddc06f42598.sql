
ALTER TABLE public.radio_config ADD COLUMN IF NOT EXISTS noticias_posicao text NOT NULL DEFAULT 'centro';

ALTER TABLE public.noticias ADD COLUMN IF NOT EXISTS patrocinador_id uuid REFERENCES public.patrocinadores(id) ON DELETE SET NULL DEFAULT NULL;
ALTER TABLE public.noticias ADD COLUMN IF NOT EXISTS patrocinador_ativo boolean NOT NULL DEFAULT false;
