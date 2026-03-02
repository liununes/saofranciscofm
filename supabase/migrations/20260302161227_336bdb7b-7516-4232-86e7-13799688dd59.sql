
-- Add tipo and posicao columns to patrocinadores
ALTER TABLE public.patrocinadores 
ADD COLUMN tipo text NOT NULL DEFAULT 'normal',
ADD COLUMN posicao text NOT NULL DEFAULT 'rodape';

-- Add constraint for valid values
ALTER TABLE public.patrocinadores 
ADD CONSTRAINT patrocinadores_tipo_check CHECK (tipo IN ('normal', 'premium')),
ADD CONSTRAINT patrocinadores_posicao_check CHECK (posicao IN ('topo', 'barra_centro_em_cima', 'centro', 'esquerda', 'direita', 'rodape'));
