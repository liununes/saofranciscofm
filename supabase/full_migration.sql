-- =============================================
-- SÃO FRANCISCO FM - MIGRAÇÃO COMPLETA (IDEMPOTENTE)
-- Pode rodar quantas vezes quiser sem erro
-- Execute no SQL Editor do Supabase
-- =============================================

-- =============================================
-- 1. LIMPAR ESTADO ANTERIOR (se existir)
-- =============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_noticias_updated_at ON public.noticias;
DROP TRIGGER IF EXISTS update_radio_config_updated_at ON public.radio_config;
DROP TRIGGER IF EXISTS update_paginas_updated_at ON public.paginas;
DROP TRIGGER IF EXISTS update_promocoes_updated_at ON public.promocoes;

DROP TABLE IF EXISTS public.page_views CASCADE;
DROP TABLE IF EXISTS public.noticias CASCADE;
DROP TABLE IF EXISTS public.programas CASCADE;
DROP TABLE IF EXISTS public.promocoes CASCADE;
DROP TABLE IF EXISTS public.publicidade_noticias CASCADE;
DROP TABLE IF EXISTS public.social_links CASCADE;
DROP TABLE IF EXISTS public.paginas CASCADE;
DROP TABLE IF EXISTS public.slide_imagens CASCADE;
DROP TABLE IF EXISTS public.musicas_recentes CASCADE;
DROP TABLE IF EXISTS public.radio_config CASCADE;
DROP TABLE IF EXISTS public.patrocinadores CASCADE;
DROP TABLE IF EXISTS public.user_permissions CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(UUID, app_role) CASCADE;

DROP TYPE IF EXISTS public.app_role;

-- =============================================
-- 2. ENUM
-- =============================================

CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- =============================================
-- 3. TABELAS
-- =============================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  UNIQUE(user_id, permission)
);

CREATE TABLE public.locutores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  imagem_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.patrocinadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  imagem_url TEXT,
  link TEXT,
  tipo TEXT NOT NULL DEFAULT 'normal',
  posicao TEXT NOT NULL DEFAULT 'rodape',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT patrocinadores_tipo_check CHECK (tipo IN ('normal', 'premium')),
  CONSTRAINT patrocinadores_posicao_check CHECK (posicao IN ('topo', 'barra_centro_em_cima', 'centro', 'esquerda', 'direita', 'rodape'))
);

CREATE TABLE public.publicidade_noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL DEFAULT '',
  texto TEXT DEFAULT '',
  imagem_url TEXT DEFAULT NULL,
  link TEXT DEFAULT '',
  ativo BOOLEAN NOT NULL DEFAULT true,
  data_inicio DATE DEFAULT NULL,
  data_fim DATE DEFAULT NULL,
  codigo TEXT UNIQUE DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TABLE public.noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  resumo TEXT,
  link_completo TEXT,
  imagem_url TEXT,
  conteudo TEXT,
  destaque BOOLEAN NOT NULL DEFAULT false,
  patrocinador_id UUID REFERENCES public.patrocinadores(id) ON DELETE SET NULL DEFAULT NULL,
  patrocinador_ativo BOOLEAN NOT NULL DEFAULT false,
  publicidade_id UUID REFERENCES public.publicidade_noticias(id) ON DELETE SET NULL DEFAULT NULL,
  publicidade_ativa BOOLEAN NOT NULL DEFAULT false,
  promocao_id UUID REFERENCES public.promocoes(id) ON DELETE SET NULL DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.musicas_recentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  artista TEXT NOT NULL,
  hora_execucao TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.slide_imagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imagem_url TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.radio_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_radio TEXT NOT NULL DEFAULT 'Rádio Personalizada FM',
  logo_principal TEXT,
  logo_extra TEXT,
  streaming_url TEXT NOT NULL DEFAULT 'https://stm28.srvaudio.com.br:10884/',
  player_posicao TEXT NOT NULL DEFAULT 'center',
  musica_atual TEXT,
  whatsapp_numero TEXT NOT NULL DEFAULT '553335112000',
  whatsapp_mensagem TEXT NOT NULL DEFAULT 'Olá! Quero fazer um pedido musical!',
  cor_primaria TEXT NOT NULL DEFAULT '#005BBB',
  cor_secundaria TEXT NOT NULL DEFAULT '#FFA500',
  cor_texto TEXT NOT NULL DEFAULT '#1a1a2e',
  cor_fundo TEXT NOT NULL DEFAULT '#f5f7fa',
  imagem_fundo TEXT,
  imagem_fundo_modo TEXT NOT NULL DEFAULT 'cover',
  logo_posicao TEXT NOT NULL DEFAULT 'left',
  logo_tamanho INTEGER NOT NULL DEFAULT 80,
  patrocinador_alinhamento TEXT NOT NULL DEFAULT 'center',
  tema TEXT NOT NULL DEFAULT 'claro',
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
  telefone_posicao TEXT NOT NULL DEFAULT 'player',
  logo_extra_posicao TEXT NOT NULL DEFAULT 'right',
  visibilidade_destaque BOOLEAN NOT NULL DEFAULT true,
  visibilidade_proximo_programa BOOLEAN NOT NULL DEFAULT true,
  visibilidade_participacao BOOLEAN NOT NULL DEFAULT true,
  visibilidade_premium BOOLEAN NOT NULL DEFAULT true,
  noticias_posicao TEXT NOT NULL DEFAULT 'centro',
  ads_topo_codigo TEXT NOT NULL DEFAULT '',
  ads_topo_ativo BOOLEAN NOT NULL DEFAULT false,
  ads_meio_codigo TEXT NOT NULL DEFAULT '',
  ads_meio_ativo BOOLEAN NOT NULL DEFAULT false,
  ads_rodape_codigo TEXT NOT NULL DEFAULT '',
  ads_rodape_ativo BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.paginas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL DEFAULT '',
  conteudo TEXT NOT NULL DEFAULT '',
  imagem_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  icone TEXT NOT NULL DEFAULT 'link',
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  user_agent TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  ip TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 4. FUNÇÕES
-- =============================================

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

-- =============================================
-- 5. TRIGGERS
-- =============================================

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_noticias_updated_at BEFORE UPDATE ON public.noticias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_radio_config_updated_at BEFORE UPDATE ON public.radio_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_paginas_updated_at BEFORE UPDATE ON public.paginas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_promocoes_updated_at BEFORE UPDATE ON public.promocoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 6. RLS - HABILITAR
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patrocinadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musicas_recentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slide_imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radio_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paginas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publicidade_noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promocoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 7. RLS - POLÍTICAS
-- =============================================

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING ((select public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Users can view own permissions" ON public.user_permissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage permissions" ON public.user_permissions FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Public can view locutores" ON public.locutores FOR SELECT USING (true);
CREATE POLICY "Admins can manage locutores" ON public.locutores FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Public can view programas" ON public.programas FOR SELECT USING (true);
CREATE POLICY "Admins can manage programas" ON public.programas FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Public can view noticias" ON public.noticias FOR SELECT USING (true);
CREATE POLICY "Admins can manage noticias" ON public.noticias FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Public can view patrocinadores" ON public.patrocinadores FOR SELECT USING (true);
CREATE POLICY "Admins can manage patrocinadores" ON public.patrocinadores FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Public can view musicas" ON public.musicas_recentes FOR SELECT USING (true);
CREATE POLICY "Admins can manage musicas" ON public.musicas_recentes FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Public can view slides" ON public.slide_imagens FOR SELECT USING (true);
CREATE POLICY "Admins can manage slides" ON public.slide_imagens FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Public can view radio config" ON public.radio_config FOR SELECT USING (true);
CREATE POLICY "Admins can update radio config" ON public.radio_config FOR UPDATE USING ((select public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Public can view paginas" ON public.paginas FOR SELECT USING (true);
CREATE POLICY "Admins can manage paginas" ON public.paginas FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Public can view active social links" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "Admins can manage social_links" ON public.social_links FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Public can view active publicidade" ON public.publicidade_noticias FOR SELECT USING (true);
CREATE POLICY "Admins can manage publicidade" ON public.publicidade_noticias FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Public can view promocoes" ON public.promocoes FOR SELECT USING (true);
CREATE POLICY "Admins can manage promocoes" ON public.promocoes FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can select page views" ON public.page_views FOR SELECT USING ((select public.has_role(auth.uid(), 'admin')));

-- =============================================
-- 8. STORAGE
-- =============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('radio-assets', 'radio-assets', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view radio assets" ON storage.objects FOR SELECT USING (bucket_id = 'radio-assets');
CREATE POLICY "Authenticated users can upload radio assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'radio-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update radio assets" ON storage.objects FOR UPDATE USING (bucket_id = 'radio-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete radio assets" ON storage.objects FOR DELETE USING (bucket_id = 'radio-assets' AND auth.role() = 'authenticated');

-- =============================================
-- 9. DADOS INICIAIS
-- =============================================

INSERT INTO public.radio_config (nome_radio, streaming_url) VALUES ('Rádio Personalizada FM', 'https://stm28.srvaudio.com.br:10884/') ON CONFLICT DO NOTHING;

INSERT INTO public.paginas (slug, titulo, conteudo)
VALUES ('sobre', 'Sobre a Rádio', 'Bem-vindo à nossa rádio! Edite esta página no painel administrativo.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.social_links (nome, url, icone, ordem, ativo) VALUES
  ('Instagram', '', 'instagram', 1, false),
  ('Facebook', '', 'facebook', 2, false),
  ('YouTube', '', 'youtube', 3, false),
  ('Google Play', '', 'smartphone', 4, false),
  ('App Store', '', 'apple', 5, false)
ON CONFLICT DO NOTHING;
