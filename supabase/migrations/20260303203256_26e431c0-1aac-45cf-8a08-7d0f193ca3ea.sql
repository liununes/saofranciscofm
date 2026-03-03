
CREATE TABLE public.publicidade_noticias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL DEFAULT '',
  texto text DEFAULT '',
  imagem_url text DEFAULT NULL,
  link text DEFAULT '',
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.publicidade_noticias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active publicidade" ON public.publicidade_noticias FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage publicidade" ON public.publicidade_noticias FOR ALL USING (auth.role() = 'authenticated');

-- Add reference from noticias to publicidade_noticias
ALTER TABLE public.noticias ADD COLUMN IF NOT EXISTS publicidade_id uuid REFERENCES public.publicidade_noticias(id) ON DELETE SET NULL DEFAULT NULL;
ALTER TABLE public.noticias ADD COLUMN IF NOT EXISTS publicidade_ativa boolean NOT NULL DEFAULT false;
