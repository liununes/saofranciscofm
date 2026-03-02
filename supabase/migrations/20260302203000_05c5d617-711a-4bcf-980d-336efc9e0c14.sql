
ALTER TABLE public.radio_config 
ADD COLUMN visibilidade_mapa boolean NOT NULL DEFAULT true,
ADD COLUMN visibilidade_telefone boolean NOT NULL DEFAULT true,
ADD COLUMN telefone_posicao text NOT NULL DEFAULT 'player';
