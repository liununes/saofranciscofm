-- Passo 1: Função has_role
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;

CREATE FUNCTION public.has_role(p_user_id UUID, p_role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id AND role = p_role
  )
$$;

-- Passo 2: Dar admin ao usuário (bloco anônimo)
DO $$
DECLARE uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'liununes06@gmail.com' LIMIT 1;
  IF uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin') ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Passo 3: Radio config
INSERT INTO public.radio_config (nome_radio, streaming_url)
VALUES ('São Francisco FM', 'https://stm28.srvaudio.com.br:10884/')
ON CONFLICT DO NOTHING;