-- Drop duplicate/redundant permissive policies

-- banners
DROP POLICY IF EXISTS "rls_banners_select" ON public.banners;

-- categories
DROP POLICY IF EXISTS "rls_categories_select" ON public.categories;

-- config_versions
DROP POLICY IF EXISTS "rls_cfgvers_select" ON public.config_versions;

-- contacts
DROP POLICY IF EXISTS "rls_contacts_select" ON public.contacts;
DROP POLICY IF EXISTS "rls_contacts_insert" ON public.contacts;

-- devices
DROP POLICY IF EXISTS "rls_devices_select" ON public.devices;
DROP POLICY IF EXISTS "rls_devices_insert" ON public.devices;

-- fotos
DROP POLICY IF EXISTS "rls_fotos_select" ON public.fotos;

-- locutores (drop old _all and _select, replaced by "Admins can manage locutores")
DROP POLICY IF EXISTS "rls_locutores_select" ON public.locutores;
DROP POLICY IF EXISTS "rls_locutores_all" ON public.locutores;

-- musicas_recentes (drop old _all and _select, replaced by "Admins can manage musicas")
DROP POLICY IF EXISTS "rls_musicas_select" ON public.musicas_recentes;
DROP POLICY IF EXISTS "rls_musicas_all" ON public.musicas_recentes;

-- news
DROP POLICY IF EXISTS "rls_news_select" ON public.news;

-- noticias (drop old _all and _select, replaced by "Admins can manage noticias")
DROP POLICY IF EXISTS "rls_noticias_select" ON public.noticias;
DROP POLICY IF EXISTS "rls_noticias_all" ON public.noticias;

-- paginas (drop old _all and _select, replaced by "Admins can manage paginas")
DROP POLICY IF EXISTS "rls_paginas_select" ON public.paginas;
DROP POLICY IF EXISTS "rls_paginas_all" ON public.paginas;

-- page_views (drop old _select, replaced by "Admins can select page views")
DROP POLICY IF EXISTS "rls_pageviews_select" ON public.page_views;

-- patrocinadores (drop old _all and _select, replaced by "Admins can manage patrocinadores")
DROP POLICY IF EXISTS "rls_patrocinadores_select" ON public.patrocinadores;
DROP POLICY IF EXISTS "rls_patrocinadores_all" ON public.patrocinadores;

-- pedidos
DROP POLICY IF EXISTS "rls_pedidos_select" ON public.pedidos;
DROP POLICY IF EXISTS "rls_pedidos_insert" ON public.pedidos;

-- presenters
DROP POLICY IF EXISTS "rls_presenters_select" ON public.presenters;

-- profiles
DROP POLICY IF EXISTS "rls_profiles_select" ON public.profiles;

-- programas (drop old _all and _select, replaced by "Admins can manage programas")
DROP POLICY IF EXISTS "rls_programas_select" ON public.programas;
DROP POLICY IF EXISTS "rls_programas_all" ON public.programas;

-- programs
DROP POLICY IF EXISTS "rls_programs_select" ON public.programs;

-- promocoes (drop old _all and _select, replaced by "Admins can manage promocoes")
DROP POLICY IF EXISTS "rls_promocoes_select" ON public.promocoes;
DROP POLICY IF EXISTS "rls_promocoes_all" ON public.promocoes;

-- publicidade_noticias (drop old _all and _select, replaced by "Admins can manage publicidade")
DROP POLICY IF EXISTS "rls_pubnoticias_select" ON public.publicidade_noticias;
DROP POLICY IF EXISTS "rls_pubnoticias_all" ON public.publicidade_noticias;

-- push_notifications
DROP POLICY IF EXISTS "rls_push_select" ON public.push_notifications;

-- radio_config
DROP POLICY IF EXISTS "rls_radioconfig_select" ON public.radio_config;

-- radio_users
DROP POLICY IF EXISTS "rls_radiousers_select" ON public.radio_users;

-- radios (drop duplicates)
DROP POLICY IF EXISTS "Todos podem ver radios" ON public.radios;
DROP POLICY IF EXISTS "rls_radios_select" ON public.radios;

-- redes_sociais
DROP POLICY IF EXISTS "rls_redes_select" ON public.redes_sociais;

-- site_config
DROP POLICY IF EXISTS "rls_siteconfig_select" ON public.site_config;

-- site_content
DROP POLICY IF EXISTS "rls_sitecontent_select" ON public.site_content;

-- slide_imagens (drop old _all and _select, replaced by "Admins can manage slides")
DROP POLICY IF EXISTS "rls_slideimagens_select" ON public.slide_imagens;
DROP POLICY IF EXISTS "rls_slideimagens_all" ON public.slide_imagens;

-- slides
DROP POLICY IF EXISTS "rls_slides_select" ON public.slides;

-- social_links (drop old _all and _select, replaced by "Admins can manage social_links")
DROP POLICY IF EXISTS "rls_sociallinks_select" ON public.social_links;
DROP POLICY IF EXISTS "rls_sociallinks_all" ON public.social_links;

-- streams
DROP POLICY IF EXISTS "rls_streams_select" ON public.streams;

-- radio_config (drop _all, replaced by "Admins can update radio config")
DROP POLICY IF EXISTS "rls_radioconfig_all" ON public.radio_config;
