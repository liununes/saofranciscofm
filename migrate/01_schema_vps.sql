-- ============================================================
-- SCHEMA COMPLETO PARA O VPS SUPABASE (v2 - Corrigido)
-- Execute este SQL no SQL Editor do Studio do seu VPS
-- SELECIONE TUDO E RODE DE UMA VEZ
-- ============================================================

-- 1. ENUM (se não existir)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. FUNÇÕES PRIMEIRO (antes de qualquer policy que as referencie)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. TABELAS (ordem: sem dependências primeiro)

-- profiles
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- user_roles
DROP TABLE IF EXISTS public.user_roles CASCADE;
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- user_permissions
DROP TABLE IF EXISTS public.user_permissions CASCADE;
CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  UNIQUE(user_id, permission)
);
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.user_permissions;
CREATE POLICY "Users can view own permissions" ON public.user_permissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage permissions" ON public.user_permissions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- locutores
DROP TABLE IF EXISTS public.locutores CASCADE;
CREATE TABLE public.locutores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  imagem_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.locutores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view locutores" ON public.locutores;
DROP POLICY IF EXISTS "Admins can manage locutores" ON public.locutores;
CREATE POLICY "Public can view locutores" ON public.locutores FOR SELECT USING (true);
CREATE POLICY "Admins can manage locutores" ON public.locutores FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- patrocinadores
DROP TABLE IF EXISTS public.patrocinadores CASCADE;
CREATE TABLE public.patrocinadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  imagem_url TEXT,
  link TEXT,
  tipo text NOT NULL DEFAULT 'normal',
  posicao text NOT NULL DEFAULT 'rodape',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT patrocinadores_tipo_check CHECK (tipo IN ('normal', 'premium')),
  CONSTRAINT patrocinadores_posicao_check CHECK (posicao IN ('topo', 'barra_centro_em_cima', 'centro', 'esquerda', 'direita', 'rodape'))
);
ALTER TABLE public.patrocinadores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view patrocinadores" ON public.patrocinadores;
DROP POLICY IF EXISTS "Admins can manage patrocinadores" ON public.patrocinadores;
CREATE POLICY "Public can view patrocinadores" ON public.patrocinadores FOR SELECT USING (true);
CREATE POLICY "Admins can manage patrocinadores" ON public.patrocinadores FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- publicidade_noticias (antes de noticias por FK)
DROP TABLE IF EXISTS public.publicidade_noticias CASCADE;
CREATE TABLE public.publicidade_noticias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL DEFAULT '',
  texto text DEFAULT '',
  imagem_url text DEFAULT NULL,
  link text DEFAULT '',
  ativo boolean NOT NULL DEFAULT true,
  data_inicio date DEFAULT NULL,
  data_fim date DEFAULT NULL,
  codigo text UNIQUE DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.publicidade_noticias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active publicidade" ON public.publicidade_noticias;
DROP POLICY IF EXISTS "Admins can manage publicidade" ON public.publicidade_noticias;
CREATE POLICY "Public can view active publicidade" ON public.publicidade_noticias FOR SELECT USING (true);
CREATE POLICY "Admins can manage publicidade" ON public.publicidade_noticias FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- promocoes (antes de noticias por FK)
DROP TABLE IF EXISTS public.promocoes CASCADE;
CREATE TABLE public.promocoes (
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
DROP POLICY IF EXISTS "Admins can manage promocoes" ON public.promocoes;
CREATE POLICY "Public can view promocoes" ON public.promocoes FOR SELECT USING (true);
CREATE POLICY "Admins can manage promocoes" ON public.promocoes FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_promocoes_updated_at BEFORE UPDATE ON public.promocoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- musicas_recentes
DROP TABLE IF EXISTS public.musicas_recentes CASCADE;
CREATE TABLE public.musicas_recentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  artista TEXT NOT NULL,
  hora_execucao TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.musicas_recentes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view musicas" ON public.musicas_recentes;
DROP POLICY IF EXISTS "Admins can manage musicas" ON public.musicas_recentes;
CREATE POLICY "Public can view musicas" ON public.musicas_recentes FOR SELECT USING (true);
CREATE POLICY "Admins can manage musicas" ON public.musicas_recentes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- slide_imagens
DROP TABLE IF EXISTS public.slide_imagens CASCADE;
CREATE TABLE public.slide_imagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imagem_url TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.slide_imagens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view slides" ON public.slide_imagens;
DROP POLICY IF EXISTS "Admins can manage slides" ON public.slide_imagens;
CREATE POLICY "Public can view slides" ON public.slide_imagens FOR SELECT USING (true);
CREATE POLICY "Admins can manage slides" ON public.slide_imagens FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- social_links
DROP TABLE IF EXISTS public.social_links CASCADE;
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
DROP POLICY IF EXISTS "Public can view active social links" ON public.social_links;
DROP POLICY IF EXISTS "Admins can manage social_links" ON public.social_links;
CREATE POLICY "Public can view active social links" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "Admins can manage social_links" ON public.social_links FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- paginas
DROP TABLE IF EXISTS public.paginas CASCADE;
CREATE TABLE public.paginas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  titulo text NOT NULL DEFAULT '',
  conteudo text NOT NULL DEFAULT '',
  imagem_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.paginas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view paginas" ON public.paginas;
DROP POLICY IF EXISTS "Admins can manage paginas" ON public.paginas;
CREATE POLICY "Public can view paginas" ON public.paginas FOR SELECT USING (true);
CREATE POLICY "Admins can manage paginas" ON public.paginas FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_paginas_updated_at BEFORE UPDATE ON public.paginas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- noticias (depois de patrocinadores, publicidade, promocoes)
DROP TABLE IF EXISTS public.noticias CASCADE;
CREATE TABLE public.noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  resumo TEXT,
  link_completo TEXT,
  imagem_url TEXT,
  conteudo text,
  destaque boolean NOT NULL DEFAULT false,
  patrocinador_id uuid REFERENCES public.patrocinadores(id) ON DELETE SET NULL DEFAULT NULL,
  patrocinador_ativo boolean NOT NULL DEFAULT false,
  publicidade_id uuid REFERENCES public.publicidade_noticias(id) ON DELETE SET NULL DEFAULT NULL,
  publicidade_ativa boolean NOT NULL DEFAULT false,
  promocao_id uuid REFERENCES public.promocoes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view noticias" ON public.noticias;
DROP POLICY IF EXISTS "Admins can manage noticias" ON public.noticias;
CREATE POLICY "Public can view noticias" ON public.noticias FOR SELECT USING (true);
CREATE POLICY "Admins can manage noticias" ON public.noticias FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_noticias_updated_at BEFORE UPDATE ON public.noticias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_noticias_promocao_id ON public.noticias(promocao_id);

-- programas (depois de locutores)
DROP TABLE IF EXISTS public.programas CASCADE;
CREATE TABLE public.programas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  locutor_id UUID REFERENCES public.locutores(id) ON DELETE SET NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  dias_semana INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.programas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view programas" ON public.programas;
DROP POLICY IF EXISTS "Admins can manage programas" ON public.programas;
CREATE POLICY "Public can view programas" ON public.programas FOR SELECT USING (true);
CREATE POLICY "Admins can manage programas" ON public.programas FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- radio_config
DROP TABLE IF EXISTS public.radio_config CASCADE;
CREATE TABLE public.radio_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_radio TEXT NOT NULL DEFAULT 'Rádio Personalizada FM',
  logo_principal TEXT,
  logo_extra TEXT,
  logo_extra_posicao text NOT NULL DEFAULT 'right',
  streaming_url TEXT NOT NULL DEFAULT 'https://stm28.srvaudio.com.br:10884/',
  player_posicao TEXT NOT NULL DEFAULT 'center',
  logo_posicao text NOT NULL DEFAULT 'left',
  logo_tamanho integer NOT NULL DEFAULT 80,
  patrocinador_alinhamento text NOT NULL DEFAULT 'center',
  tema text NOT NULL DEFAULT 'claro',
  musica_atual TEXT,
  whatsapp_numero TEXT NOT NULL DEFAULT '553335112000',
  whatsapp_mensagem TEXT NOT NULL DEFAULT 'Olá! Quero fazer um pedido musical! 🎵',
  cor_primaria TEXT NOT NULL DEFAULT '#005BBB',
  cor_secundaria TEXT NOT NULL DEFAULT '#FFA500',
  cor_texto text NOT NULL DEFAULT '#1a1a2e',
  cor_fundo text NOT NULL DEFAULT '#f5f7fa',
  imagem_fundo text,
  imagem_fundo_modo text NOT NULL DEFAULT 'cover',
  telefone_contato text NOT NULL DEFAULT '3511-2000',
  telefone_link text NOT NULL DEFAULT '',
  visibilidade_logo boolean NOT NULL DEFAULT true,
  visibilidade_noticias boolean NOT NULL DEFAULT true,
  visibilidade_musicas boolean NOT NULL DEFAULT true,
  visibilidade_player boolean NOT NULL DEFAULT true,
  visibilidade_patrocinadores boolean NOT NULL DEFAULT true,
  visibilidade_slides boolean NOT NULL DEFAULT true,
  visibilidade_mapa boolean NOT NULL DEFAULT true,
  visibilidade_telefone boolean NOT NULL DEFAULT true,
  visibilidade_destaque boolean NOT NULL DEFAULT true,
  visibilidade_proximo_programa boolean NOT NULL DEFAULT true,
  visibilidade_participacao boolean NOT NULL DEFAULT true,
  visibilidade_premium boolean NOT NULL DEFAULT true,
  noticias_posicao text NOT NULL DEFAULT 'centro',
  telefone_posicao text NOT NULL DEFAULT 'player',
  ads_topo_codigo text NOT NULL DEFAULT '',
  ads_topo_ativo boolean NOT NULL DEFAULT false,
  ads_meio_codigo text NOT NULL DEFAULT '',
  ads_meio_ativo boolean NOT NULL DEFAULT false,
  ads_rodape_codigo text NOT NULL DEFAULT '',
  ads_rodape_ativo boolean NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.radio_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view radio config" ON public.radio_config;
DROP POLICY IF EXISTS "Authenticated can insert radio config" ON public.radio_config;
DROP POLICY IF EXISTS "Admins can update radio config" ON public.radio_config;
CREATE POLICY "Public can view radio config" ON public.radio_config FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert radio config" ON public.radio_config FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update radio config" ON public.radio_config FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_radio_config_updated_at BEFORE UPDATE ON public.radio_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- page_views
DROP TABLE IF EXISTS public.page_views CASCADE;
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  user_agent text,
  city text,
  region text,
  country text,
  ip text,
  session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
DROP POLICY IF EXISTS "Admins can select page views" ON public.page_views;
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can select page views" ON public.page_views FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('radio-assets', 'radio-assets', true)
ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Public can view radio assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload radio assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update radio assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete radio assets" ON storage.objects;
CREATE POLICY "Public can view radio assets" ON storage.objects FOR SELECT USING (bucket_id = 'radio-assets');
CREATE POLICY "Authenticated users can upload radio assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'radio-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update radio assets" ON storage.objects FOR UPDATE USING (bucket_id = 'radio-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete radio assets" ON storage.objects FOR DELETE USING (bucket_id = 'radio-assets' AND auth.role() = 'authenticated');

-- Trigger auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
