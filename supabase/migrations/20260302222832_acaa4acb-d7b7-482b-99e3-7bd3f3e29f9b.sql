
-- Add destaque flag to noticias
ALTER TABLE public.noticias ADD COLUMN IF NOT EXISTS destaque boolean NOT NULL DEFAULT false;

-- Add visibility toggles for new modules to radio_config
ALTER TABLE public.radio_config ADD COLUMN IF NOT EXISTS visibilidade_destaque boolean NOT NULL DEFAULT true;
ALTER TABLE public.radio_config ADD COLUMN IF NOT EXISTS visibilidade_proximo_programa boolean NOT NULL DEFAULT true;
ALTER TABLE public.radio_config ADD COLUMN IF NOT EXISTS visibilidade_participacao boolean NOT NULL DEFAULT true;
ALTER TABLE public.radio_config ADD COLUMN IF NOT EXISTS visibilidade_premium boolean NOT NULL DEFAULT true;
