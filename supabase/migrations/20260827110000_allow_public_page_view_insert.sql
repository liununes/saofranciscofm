-- Corrige o 403 do contador público de visitas no banco legado.
-- A leitura continua restrita a usuários autenticados; somente a inserção
-- mínima de uma visita é pública.

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'page_views'
      AND policyname = 'Allow public insert page views'
  ) THEN
    CREATE POLICY "Allow public insert page views"
      ON public.page_views
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END
$$;
