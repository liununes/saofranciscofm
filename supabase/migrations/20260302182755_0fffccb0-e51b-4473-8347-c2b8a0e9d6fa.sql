
-- Add new admin controls to radio_config
ALTER TABLE public.radio_config 
  ADD COLUMN IF NOT EXISTS logo_posicao text NOT NULL DEFAULT 'left',
  ADD COLUMN IF NOT EXISTS logo_tamanho integer NOT NULL DEFAULT 80,
  ADD COLUMN IF NOT EXISTS patrocinador_alinhamento text NOT NULL DEFAULT 'center',
  ADD COLUMN IF NOT EXISTS tema text NOT NULL DEFAULT 'claro';
