
-- Social links table for header icons (Instagram, Facebook, YouTube, apps, etc.)
CREATE TABLE public.social_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  url text NOT NULL DEFAULT '',
  icone text NOT NULL DEFAULT 'link',
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active social links"
  ON public.social_links FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage social links"
  ON public.social_links FOR ALL
  USING (auth.role() = 'authenticated'::text)
  WITH CHECK (auth.role() = 'authenticated'::text);

-- Seed default social links
INSERT INTO public.social_links (nome, url, icone, ordem, ativo) VALUES
  ('Instagram', '', 'instagram', 1, false),
  ('Facebook', '', 'facebook', 2, false),
  ('YouTube', '', 'youtube', 3, false),
  ('Google Play', '', 'smartphone', 4, false),
  ('App Store', '', 'apple', 5, false);
