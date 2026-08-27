-- =====================================================
-- SQL DEFINITIVO - Painel Rádio São Francisco FM
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. Criar enum app_role se não existe
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Dropar e recriar função has_role
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

-- =====================================================
-- TABELAS (CREATE IF NOT EXISTS)
-- =====================================================

-- user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- user_permissions
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  UNIQUE(user_id, permission)
);

-- radio_config
CREATE TABLE IF NOT EXISTS public.radio_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_radio TEXT NOT NULL DEFAULT 'Rádio Personalizada FM',
  logo_principal TEXT,
  logo_extra TEXT,
  logo_extra_posicao TEXT NOT NULL DEFAULT 'right',
  streaming_url TEXT NOT NULL DEFAULT 'https://stm28.srvaudio.com.br:10884/',
  player_posicao TEXT NOT NULL DEFAULT 'center',
  logo_posicao TEXT NOT NULL DEFAULT 'left',
  logo_tamanho INTEGER NOT NULL DEFAULT 80,
  patrocinador_alinhamento TEXT NOT NULL DEFAULT 'center',
  tema TEXT NOT NULL DEFAULT 'claro',
  musica_atual TEXT,
  whatsapp_numero TEXT NOT NULL DEFAULT '553335112000',
  whatsapp_mensagem TEXT NOT NULL DEFAULT 'Olá! Quero fazer um pedido musical!',
  cor_primaria TEXT NOT NULL DEFAULT '#005BBB',
  cor_secundaria TEXT NOT NULL DEFAULT '#FFA500',
  cor_texto TEXT NOT NULL DEFAULT '#1a1a2e',
  cor_fundo TEXT NOT NULL DEFAULT '#f5f7fa',
  imagem_fundo TEXT,
  imagem_fundo_modo TEXT NOT NULL DEFAULT 'cover',
  telefone_contato TEXT NOT NULL DEFAULT '3511-2000',
  telefone_link TEXT NOT NULL DEFAULT '',
  visibilidade_logo BOOLEAN NOT NULL DEFAULT true,
  visibilidade_noticias BOOLEAN NOT NULL DEFAULT true,
  visibilidade_musicas BOOLEAN NOT NULL DEFAULT true,
  visibilidade_player BOOLEAN NOT NULL DEFAULT true,
  visibilidade_patrocinadores BOOLEAN NOT NULL DEFAULT true,
  visibilidade_slides BOOLEAN NOT NULL DEFAULT true,
  visibilidade_mapa BOOLEAN NOT NULL DEFAULT true,
  visibilidade_telefone BOOLEAN NOT NULL DEFAULT true,
  visibilidade_destaque BOOLEAN NOT NULL DEFAULT true,
  visibilidade_proximo_programa BOOLEAN NOT NULL DEFAULT true,
  visibilidade_participacao BOOLEAN NOT NULL DEFAULT true,
  visibilidade_premium BOOLEAN NOT NULL DEFAULT true,
  noticias_posicao TEXT NOT NULL DEFAULT 'centro',
  telefone_posicao TEXT NOT NULL DEFAULT 'player',
  ads_topo_codigo TEXT NOT NULL DEFAULT '',
  ads_topo_ativo BOOLEAN NOT NULL DEFAULT false,
  ads_meio_codigo TEXT NOT NULL DEFAULT '',
  ads_meio_ativo BOOLEAN NOT NULL DEFAULT false,
  ads_rodape_codigo TEXT NOT NULL DEFAULT '',
  ads_rodape_ativo BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- locutores
CREATE TABLE IF NOT EXISTS public.locutores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  imagem_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- programas
CREATE TABLE IF NOT EXISTS public.programas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  locutor_id UUID REFERENCES public.locutores(id) ON DELETE SET NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  dias_semana INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- musicas_recentes
CREATE TABLE IF NOT EXISTS public.musicas_recentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  artista TEXT NOT NULL,
  hora_execucao TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- noticias
CREATE TABLE IF NOT EXISTS public.noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  resumo TEXT,
  link_completo TEXT,
  imagem_url TEXT,
  conteudo TEXT,
  destaque BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- patrocinadores
CREATE TABLE IF NOT EXISTS public.patrocinadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  imagem_url TEXT,
  link TEXT,
  tipo TEXT NOT NULL DEFAULT 'normal',
  posicao TEXT NOT NULL DEFAULT 'rodape',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- slide_imagens
CREATE TABLE IF NOT EXISTS public.slide_imagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imagem_url TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- paginas
CREATE TABLE IF NOT EXISTS public.paginas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL DEFAULT '',
  conteudo TEXT NOT NULL DEFAULT '',
  imagem_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- social_links
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  icone TEXT NOT NULL DEFAULT 'link',
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- promocoes
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

-- page_views
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  user_agent TEXT,
  session_id TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- RLS - Habilitar todas as tabelas
-- =====================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radio_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musicas_recentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patrocinadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slide_imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paginas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promocoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS (todas com (select) para performance)
-- =====================================================

-- user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING ((select public.has_role((select auth.uid()), 'admin')));

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING ((select public.has_role((select auth.uid()), 'admin')));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- user_permissions
DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_permissions;
CREATE POLICY "Users can view own permissions" ON public.user_permissions
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can manage permissions" ON public.user_permissions;
CREATE POLICY "Admins can manage permissions" ON public.user_permissions
  FOR ALL USING ((select public.has_role((select auth.uid()), 'admin')));

-- radio_config
DROP POLICY IF EXISTS "Public can view radio config" ON public.radio_config;
CREATE POLICY "Public can view radio config" ON public.radio_config
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update radio config" ON public.radio_config;
CREATE POLICY "Admins can update radio config" ON public.radio_config
  FOR ALL USING ((select public.has_role((select auth.uid()), 'admin')));

-- locutores
DROP POLICY IF EXISTS "Public can view locutores" ON public.locutores;
CREATE POLICY "Public can view locutores" ON public.locutores
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage locutores" ON public.locutores;
CREATE POLICY "Admins can manage locutores" ON public.locutores
  FOR ALL USING ((select public.has_role((select auth.uid()), 'admin')));

-- programas
DROP POLICY IF EXISTS "Public can view programas" ON public.programas;
CREATE POLICY "Public can view programas" ON public.programas
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage programas" ON public.programas;
CREATE POLICY "Admins can manage programas" ON public.programas
  FOR ALL USING ((select public.has_role((select auth.uid()), 'admin')));

-- musicas_recentes
DROP POLICY IF EXISTS "Public can view musicas" ON public.musicas_recentes;
CREATE POLICY "Public can view musicas" ON public.musicas_recentes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage musicas" ON public.musicas_recentes;
CREATE POLICY "Admins can manage musicas" ON public.musicas_recentes
  FOR ALL USING ((select public.has_role((select auth.uid()), 'admin')));

-- noticias
DROP POLICY IF EXISTS "Public can view noticias" ON public.noticias;
CREATE POLICY "Public can view noticias" ON public.noticias
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage noticias" ON public.noticias;
CREATE POLICY "Admins can manage noticias" ON public.noticias
  FOR ALL USING ((select public.has_role((select auth.uid()), 'admin')));

-- patrocinadores
DROP POLICY IF EXISTS "Public can view patrocinadores" ON public.patrocinadores;
CREATE POLICY "Public can view patrocinadores" ON public.patrocinadores
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage patrocinadores" ON public.patrocinadores;
CREATE POLICY "Admins can manage patrocinadores" ON public.patrocinadores
  FOR ALL USING ((select public.has_role((select auth.uid()), 'admin')));

-- slide_imagens
DROP POLICY IF EXISTS "Public can view slides" ON public.slide_imagens;
CREATE POLICY "Public can view slides" ON public.slide_imagens
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage slides" ON public.slide_imagens;
CREATE POLICY "Admins can manage slides" ON public.slide_imagens
  FOR ALL USING ((select public.has_role((select auth.uid()), 'admin')));

-- paginas
DROP POLICY IF EXISTS "Public can view paginas" ON public.paginas;
CREATE POLICY "Public can view paginas" ON public.paginas
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage paginas" ON public.paginas;
CREATE POLICY "Admins can manage paginas" ON public.paginas
  FOR ALL USING ((select public.has_role((select auth.uid()), 'admin')));

-- social_links
DROP POLICY IF EXISTS "Public can view social links" ON public.social_links;
CREATE POLICY "Public can view social links" ON public.social_links
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage social links" ON public.social_links;
CREATE POLICY "Admins can manage social links" ON public.social_links
  FOR ALL USING ((select public.has_role((select auth.uid()), 'admin')));

-- promocoes
DROP POLICY IF EXISTS "Public can view promocoes" ON public.promocoes;
CREATE POLICY "Public can view promocoes" ON public.promocoes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage promocoes" ON public.promocoes;
CREATE POLICY "Admins can manage promocoes" ON public.promocoes
  FOR ALL USING ((select public.has_role((select auth.uid()), 'admin')));

-- page_views
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
CREATE POLICY "Anyone can insert page views" ON public.page_views
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view page views" ON public.page_views;
CREATE POLICY "Admins can view page views" ON public.page_views
  FOR SELECT USING ((select public.has_role((select auth.uid()), 'admin')));

-- =====================================================
-- GARANTIR DADOS INICIAIS
-- =====================================================

-- Radio config padrão
INSERT INTO public.radio_config (nome_radio, streaming_url)
VALUES ('São Francisco FM', 'https://stm28.srvaudio.com.br:10884/')
ON CONFLICT DO NOTHING;

-- Admin para liununes06@gmail.com
DO $$
DECLARE uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'liununes06@gmail.com' LIMIT 1;
  IF uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin') ON CONFLICT DO NOTHING;
    RAISE NOTICE 'Admin role adicionado para liununes06@gmail.com';
  ELSE
    RAISE NOTICE 'Usuário liununes06@gmail.com não encontrado - faça login primeiro';
  END IF;
END $$;

-- =====================================================
-- FIM
-- =====================================================
