-- Coleta automática de notícias por RSS.
-- A tabela principal permanece compatível com o site; os novos campos são opcionais.
ALTER TABLE public.noticias
  ADD COLUMN IF NOT EXISTS fonte TEXT,
  ADD COLUMN IF NOT EXISTS origem_rss BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rss_guid TEXT,
  ADD COLUMN IF NOT EXISTS abrangencia TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS noticias_rss_guid_unique
  ON public.noticias (rss_guid)
  WHERE rss_guid IS NOT NULL;
