-- Add promotion linkage field on news items so a promotion can be attached and rendered inline
ALTER TABLE public.noticias
ADD COLUMN IF NOT EXISTS promocao_id uuid;

-- Add FK for data integrity (nullable because linkage is optional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'noticias_promocao_id_fkey'
  ) THEN
    ALTER TABLE public.noticias
    ADD CONSTRAINT noticias_promocao_id_fkey
    FOREIGN KEY (promocao_id)
    REFERENCES public.promocoes(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Helpful index for lookups
CREATE INDEX IF NOT EXISTS idx_noticias_promocao_id ON public.noticias(promocao_id);