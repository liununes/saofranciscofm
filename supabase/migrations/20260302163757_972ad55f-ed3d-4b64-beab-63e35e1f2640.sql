
-- Add conteudo (full article text) to noticias for detail pages
ALTER TABLE public.noticias ADD COLUMN IF NOT EXISTS conteudo text;

-- Add customization columns to radio_config
ALTER TABLE public.radio_config 
ADD COLUMN IF NOT EXISTS cor_texto text NOT NULL DEFAULT '#1a1a2e',
ADD COLUMN IF NOT EXISTS cor_fundo text NOT NULL DEFAULT '#f5f7fa',
ADD COLUMN IF NOT EXISTS imagem_fundo text,
ADD COLUMN IF NOT EXISTS imagem_fundo_modo text NOT NULL DEFAULT 'cover';

-- Create paginas table for editable pages (Sobre, etc.)
CREATE TABLE IF NOT EXISTS public.paginas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  titulo text NOT NULL DEFAULT '',
  conteudo text NOT NULL DEFAULT '',
  imagem_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.paginas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view paginas" ON public.paginas FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage paginas" ON public.paginas FOR ALL USING (auth.role() = 'authenticated');

-- Insert default "sobre" page
INSERT INTO public.paginas (slug, titulo, conteudo) 
VALUES ('sobre', 'Sobre a Rádio', 'Bem-vindo à nossa rádio! Edite esta página no painel administrativo.')
ON CONFLICT (slug) DO NOTHING;

-- Trigger for updated_at
CREATE TRIGGER update_paginas_updated_at
BEFORE UPDATE ON public.paginas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
