
-- Enable storage for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('radio-assets', 'radio-assets', true);

-- Storage policies
CREATE POLICY "Public can view radio assets" ON storage.objects FOR SELECT USING (bucket_id = 'radio-assets');
CREATE POLICY "Authenticated users can upload radio assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'radio-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update radio assets" ON storage.objects FOR UPDATE USING (bucket_id = 'radio-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete radio assets" ON storage.objects FOR DELETE USING (bucket_id = 'radio-assets' AND auth.role() = 'authenticated');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Permissions table
CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  UNIQUE(user_id, permission)
);
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own permissions" ON public.user_permissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage permissions" ON public.user_permissions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Announcers (Locutores)
CREATE TABLE public.locutores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  imagem_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.locutores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view locutores" ON public.locutores FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage locutores" ON public.locutores FOR ALL USING (auth.role() = 'authenticated');

-- Programs (Programas)
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
CREATE POLICY "Public can view programas" ON public.programas FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage programas" ON public.programas FOR ALL USING (auth.role() = 'authenticated');

-- News (Notícias)
CREATE TABLE public.noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  resumo TEXT,
  link_completo TEXT,
  imagem_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view noticias" ON public.noticias FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage noticias" ON public.noticias FOR ALL USING (auth.role() = 'authenticated');

-- Sponsors (Patrocinadores)
CREATE TABLE public.patrocinadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  imagem_url TEXT,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patrocinadores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view patrocinadores" ON public.patrocinadores FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage patrocinadores" ON public.patrocinadores FOR ALL USING (auth.role() = 'authenticated');

-- Recent songs
CREATE TABLE public.musicas_recentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  artista TEXT NOT NULL,
  hora_execucao TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.musicas_recentes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view musicas" ON public.musicas_recentes FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage musicas" ON public.musicas_recentes FOR ALL USING (auth.role() = 'authenticated');

-- Slide images
CREATE TABLE public.slide_imagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imagem_url TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.slide_imagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view slides" ON public.slide_imagens FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage slides" ON public.slide_imagens FOR ALL USING (auth.role() = 'authenticated');

-- Radio config (single-row settings)
CREATE TABLE public.radio_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_radio TEXT NOT NULL DEFAULT 'Rádio Personalizada FM',
  logo_principal TEXT,
  logo_extra TEXT,
  streaming_url TEXT NOT NULL DEFAULT 'https://stm28.srvaudio.com.br:10884/',
  player_posicao TEXT NOT NULL DEFAULT 'center',
  musica_atual TEXT,
  whatsapp_numero TEXT NOT NULL DEFAULT '553335112000',
  whatsapp_mensagem TEXT NOT NULL DEFAULT 'Olá! Quero fazer um pedido musical! 🎵',
  cor_primaria TEXT NOT NULL DEFAULT '#005BBB',
  cor_secundaria TEXT NOT NULL DEFAULT '#FFA500',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.radio_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view radio config" ON public.radio_config FOR SELECT USING (true);
CREATE POLICY "Authenticated can update radio config" ON public.radio_config FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert default config
INSERT INTO public.radio_config (nome_radio, streaming_url) VALUES ('Rádio Personalizada FM', 'https://stm28.srvaudio.com.br:10884/');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_noticias_updated_at BEFORE UPDATE ON public.noticias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_radio_config_updated_at BEFORE UPDATE ON public.radio_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
