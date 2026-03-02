
-- Add phone, visibility toggles, and Google Ads fields to radio_config
ALTER TABLE public.radio_config
  ADD COLUMN IF NOT EXISTS telefone_contato text NOT NULL DEFAULT '3511-2000',
  ADD COLUMN IF NOT EXISTS visibilidade_logo boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS visibilidade_noticias boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS visibilidade_musicas boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS visibilidade_player boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS visibilidade_patrocinadores boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS visibilidade_slides boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS ads_topo_codigo text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS ads_topo_ativo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ads_meio_codigo text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS ads_meio_ativo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ads_rodape_codigo text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS ads_rodape_ativo boolean NOT NULL DEFAULT false;
