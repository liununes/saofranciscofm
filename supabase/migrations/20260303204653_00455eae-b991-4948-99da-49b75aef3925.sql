-- Garantir política de escrita correta para publicidade_noticias
DROP POLICY IF EXISTS "Authenticated can manage publicidade" ON public.publicidade_noticias;
CREATE POLICY "Authenticated can manage publicidade"
ON public.publicidade_noticias
FOR ALL
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Tabela de promoções gerenciáveis
CREATE TABLE IF NOT EXISTS public.promocoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL DEFAULT '',
  texto TEXT NOT NULL DEFAULT '',
  descricao TEXT,
  imagem_url TEXT,
  link TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  data_inicio DATE,
  data_validade DATE,
  prorrogada_ate DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.promocoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view promocoes" ON public.promocoes;
CREATE POLICY "Public can view promocoes"
ON public.promocoes
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated can manage promocoes" ON public.promocoes;
CREATE POLICY "Authenticated can manage promocoes"
ON public.promocoes
FOR ALL
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_promocoes_updated_at ON public.promocoes;
CREATE TRIGGER update_promocoes_updated_at
BEFORE UPDATE ON public.promocoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();