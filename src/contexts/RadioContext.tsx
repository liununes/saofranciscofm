import React, { createContext, useCallback, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Musica {
  id: string;
  titulo: string;
  artista: string;
  hora_execucao: string;
}

export interface Noticia {
  id: string;
  titulo: string;
  resumo: string;
  link_completo: string;
  imagem?: string;
  created_at?: string;
  updated_at?: string;
  destaque?: boolean;
}

export interface Patrocinador {
  id: string;
  nome: string;
  imagem: string;
  link: string;
  tipo: 'normal' | 'premium';
  posicao: string;
}

export interface SlideImagem {
  id: string;
  imagem: string;
  ordem: number;
}

export interface SocialLink {
  id: string;
  nome: string;
  url: string;
  icone: string;
  ordem: number;
  ativo: boolean;
}

export interface Promocao {
  id: string;
  nome: string;
  texto: string;
  descricao?: string;
  imagem_url?: string;
  link?: string;
  ativo: boolean;
  data_inicio?: string;
  data_validade?: string;
  prorrogada_ate?: string;
}

export interface Locutor {
  id: string;
  nome: string;
  imagem_url?: string;
}

export interface Programa {
  id: string;
  nome: string;
  locutor_id?: string;
  locutor?: Locutor;
  horario_inicio: string;
  horario_fim: string;
  dias_semana: number[];
  ativo: boolean;
}

export interface RadioConfig {
  nome_radio: string;
  logo_principal: string;
  logo_extra: string;
  logo_extra_posicao: 'left' | 'right' | 'above';
  streaming_url: string;
  streaming_url_backup?: string;
  streaming_backup_enabled: boolean;
  streaming_failover_mode: 'manual' | 'automatic';
  streaming_active_source: 'primary' | 'backup';
  player_posicao: 'left' | 'center' | 'right';
  logo_posicao: 'left' | 'right' | 'above';
  logo_tamanho: number;
  patrocinador_alinhamento: 'left' | 'center' | 'right';
  tema: 'claro' | 'escuro' | 'moderno';
  musica_atual: string;
  whatsapp_numero: string;
  whatsapp_mensagem: string;
  cor_primaria: string;
  cor_secundaria: string;
  cor_texto: string;
  cor_fundo: string;
  imagem_fundo: string;
  imagem_fundo_modo: string;
  locutor_ao_vivo: string;
  programa_ao_vivo: string;
  horario_inicio: string;
  horario_fim: string;
  locutor_imagem?: string;
  telefone_contato: string;
  telefone_link: string;
  visibilidade_logo: boolean;
  visibilidade_noticias: boolean;
  visibilidade_musicas: boolean;
  visibilidade_player: boolean;
  visibilidade_patrocinadores: boolean;
  visibilidade_slides: boolean;
  visibilidade_mapa: boolean;
  visibilidade_telefone: boolean;
  visibilidade_destaque: boolean;
  visibilidade_proximo_programa: boolean;
  visibilidade_participacao: boolean;
  visibilidade_premium: boolean;
  noticias_posicao: 'centro' | 'esquerda' | 'direita';
  telefone_posicao: 'player' | 'topo' | 'centro' | 'header' | 'meio-esquerda' | 'meio-direita' | 'rodape';
  ads_topo_codigo: string;
  ads_topo_ativo: boolean;
  ads_meio_codigo: string;
  ads_meio_ativo: boolean;
  ads_rodape_codigo: string;
  ads_rodape_ativo: boolean;
  total_visitas?: number;
  musicas_recentes: Musica[];
  noticias: Noticia[];
  patrocinadores: Patrocinador[];
  slide_imagens: SlideImagem[];
  social_links: SocialLink[];
  promocoes: Promocao[];
}

const defaultConfig: RadioConfig = {
  nome_radio: 'Rádio Personalizada FM',
  logo_principal: '',
  logo_extra: '',
  logo_extra_posicao: 'right',
  streaming_url: 'https://stm28.srvaudio.com.br:10884/',
  streaming_url_backup: 'http://streaming.liurecord.com.br:8015/',
  streaming_backup_enabled: false,
  streaming_failover_mode: 'manual',
  streaming_active_source: 'primary',
  player_posicao: 'center',
  logo_posicao: 'left',
  logo_tamanho: 80,
  patrocinador_alinhamento: 'center',
  tema: 'claro',
  musica_atual: '',
  whatsapp_numero: '553335112000',
  whatsapp_mensagem: 'Olá! Quero fazer um pedido musical! 🎵',
  cor_primaria: '#005BBB',
  cor_secundaria: '#FFA500',
  cor_texto: '#1a1a2e',
  cor_fundo: '#f5f7fa',
  imagem_fundo: '',
  imagem_fundo_modo: 'cover',
  locutor_ao_vivo: '',
  programa_ao_vivo: '',
  horario_inicio: '',
  horario_fim: '',
  locutor_imagem: '',
  telefone_contato: '3511-2000',
  telefone_link: '',
  visibilidade_logo: true,
  visibilidade_noticias: true,
  visibilidade_musicas: true,
  visibilidade_player: true,
  visibilidade_patrocinadores: true,
  visibilidade_slides: true,
  visibilidade_mapa: true,
  visibilidade_telefone: true,
  visibilidade_destaque: true,
  visibilidade_proximo_programa: true,
  visibilidade_participacao: true,
  visibilidade_premium: true,
  noticias_posicao: 'centro',
  telefone_posicao: 'player',
  ads_topo_codigo: '',
  ads_topo_ativo: false,
  ads_meio_codigo: '',
  ads_meio_ativo: false,
  ads_rodape_codigo: '',
  ads_rodape_ativo: false,
  musicas_recentes: [],
  noticias: [],
  patrocinadores: [],
  slide_imagens: [],
  social_links: [],
  promocoes: [],
};

interface RadioContextType {
  config: RadioConfig;
  updateConfig: (updates: Partial<RadioConfig>) => void;
  isLive: boolean;
  currentPrograma: Programa | null;
  programas: Programa[];
  refreshData: () => Promise<void>;
  onlineCount: number;
  presenceData: any[];
  isListening: boolean;
  setIsListening: (val: boolean) => void;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export const RadioProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<RadioConfig>(defaultConfig);
  const [isLive, setIsLive] = useState(false);
  const [currentPrograma, setCurrentPrograma] = useState<Programa | null>(null);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [onlineCount, setOnlineCount] = useState(1);
  const [presenceData, setPresenceData] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [locationInfo, setLocationInfo] = useState({ city: 'Desconhecido', region: '' });

  const fetchData = useCallback(async () => {
    try {
      const [rcRes, musicasRes, noticiasRes, patRes, slidesRes, progsRes, socialRes, promoRes] = await Promise.allSettled([
        supabase.from('radio_config').select('*').limit(1).single(),
        supabase.from('musicas_recentes').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('noticias').select('*').order('created_at', { ascending: false }),
        supabase.from('patrocinadores').select('*'),
        supabase.from('slide_imagens').select('*').order('ordem', { ascending: true }),
        supabase.from('programas').select('*, locutores(*)').eq('ativo', true),
        supabase.from('social_links').select('*').order('ordem', { ascending: true }),
        supabase.from('promocoes').select('*').order('created_at', { ascending: false }),
      ]);

      const rc = rcRes.status === 'fulfilled' && !rcRes.value.error ? rcRes.value.data : null;
      const musicas = musicasRes.status === 'fulfilled' && !musicasRes.value.error ? musicasRes.value.data : null;
      const noticias = noticiasRes.status === 'fulfilled' && !noticiasRes.value.error ? noticiasRes.value.data : null;
      const patrocinadores = patRes.status === 'fulfilled' && !patRes.value.error ? patRes.value.data : null;
      const slides = slidesRes.status === 'fulfilled' && !slidesRes.value.error ? slidesRes.value.data : null;
      const progs = progsRes.status === 'fulfilled' && !progsRes.value.error ? progsRes.value.data : null;
      const socialLinks = socialRes.status === 'fulfilled' && !socialRes.value.error ? socialRes.value.data : null;
      const promocoes = promoRes.status === 'fulfilled' && !promoRes.value.error ? promoRes.value.data : null;

    const mappedProgramas: Programa[] = (progs || []).map((p: any) => ({
      id: p.id,
      nome: p.nome,
      locutor_id: p.locutor_id,
      locutor: p.locutores ? { id: p.locutores.id, nome: p.locutores.nome, imagem_url: p.locutores.imagem_url } : undefined,
      horario_inicio: p.horario_inicio,
      horario_fim: p.horario_fim,
      dias_semana: p.dias_semana,
      ativo: p.ativo,
    }));
    if (progs !== null) setProgramas(mappedProgramas);

    setConfig(prev => {
      const fromDatabase = <T,>(value: T | null | undefined, fallback: T) => rc === null ? fallback : (value ?? fallback);
      return {
        ...prev,
        nome_radio: fromDatabase(rc?.nome_radio, prev.nome_radio),
        logo_principal: fromDatabase(rc?.logo_principal, ''),
        logo_extra: fromDatabase(rc?.logo_extra, ''),
        logo_extra_posicao: fromDatabase(rc?.logo_extra_posicao as any, 'right'),
        streaming_url: rc?.streaming_url || prev.streaming_url,
        streaming_url_backup: fromDatabase(rc?.streaming_url_backup, prev.streaming_url_backup || ''),
        streaming_backup_enabled: fromDatabase(rc?.streaming_backup_enabled, prev.streaming_backup_enabled),
        streaming_failover_mode: fromDatabase(rc?.streaming_failover_mode as any, prev.streaming_failover_mode),
        streaming_active_source: fromDatabase(rc?.streaming_active_source as any, prev.streaming_active_source),
        player_posicao: fromDatabase(rc?.player_posicao as any, 'center'),
        logo_posicao: fromDatabase(rc?.logo_posicao as any, 'left'),
        logo_tamanho: fromDatabase(rc?.logo_tamanho, 80),
        patrocinador_alinhamento: fromDatabase(rc?.patrocinador_alinhamento as any, 'center'),
        tema: fromDatabase(rc?.tema as any, 'claro'),
        musica_atual: fromDatabase(rc?.musica_atual, ''),
        whatsapp_numero: fromDatabase(rc?.whatsapp_numero, prev.whatsapp_numero),
        whatsapp_mensagem: fromDatabase(rc?.whatsapp_mensagem, prev.whatsapp_mensagem),
        cor_primaria: fromDatabase(rc?.cor_primaria, prev.cor_primaria),
        cor_secundaria: fromDatabase(rc?.cor_secundaria, prev.cor_secundaria),
        cor_texto: fromDatabase(rc?.cor_texto, prev.cor_texto),
        cor_fundo: fromDatabase(rc?.cor_fundo, prev.cor_fundo),
        imagem_fundo: fromDatabase(rc?.imagem_fundo, ''),
        imagem_fundo_modo: fromDatabase(rc?.imagem_fundo_modo, 'cover'),
        telefone_contato: fromDatabase(rc?.telefone_contato, prev.telefone_contato),
        telefone_link: fromDatabase(rc?.telefone_link, ''),
        visibilidade_logo: fromDatabase(rc?.visibilidade_logo, prev.visibilidade_logo),
        visibilidade_noticias: fromDatabase(rc?.visibilidade_noticias, prev.visibilidade_noticias),
        visibilidade_musicas: fromDatabase(rc?.visibilidade_musicas, prev.visibilidade_musicas),
        visibilidade_player: fromDatabase(rc?.visibilidade_player, prev.visibilidade_player),
        visibilidade_patrocinadores: fromDatabase(rc?.visibilidade_patrocinadores, prev.visibilidade_patrocinadores),
        visibilidade_slides: fromDatabase(rc?.visibilidade_slides, prev.visibilidade_slides),
        visibilidade_mapa: fromDatabase(rc?.visibilidade_mapa, prev.visibilidade_mapa),
        visibilidade_telefone: fromDatabase(rc?.visibilidade_telefone, prev.visibilidade_telefone),
        visibilidade_destaque: fromDatabase(rc?.visibilidade_destaque, prev.visibilidade_destaque),
        visibilidade_proximo_programa: fromDatabase(rc?.visibilidade_proximo_programa, prev.visibilidade_proximo_programa),
        visibilidade_participacao: fromDatabase(rc?.visibilidade_participacao, prev.visibilidade_participacao),
        visibilidade_premium: fromDatabase(rc?.visibilidade_premium, prev.visibilidade_premium),
        noticias_posicao: fromDatabase((rc as any)?.noticias_posicao, 'centro'),
        telefone_posicao: fromDatabase(rc?.telefone_posicao as any, 'player'),
        ads_topo_codigo: fromDatabase(rc?.ads_topo_codigo, ''),
        ads_topo_ativo: fromDatabase(rc?.ads_topo_ativo, false),
        ads_meio_codigo: fromDatabase(rc?.ads_meio_codigo, ''),
        ads_meio_ativo: fromDatabase(rc?.ads_meio_ativo, false),
        ads_rodape_codigo: fromDatabase(rc?.ads_rodape_codigo, ''),
        ads_rodape_ativo: fromDatabase(rc?.ads_rodape_ativo, false),
        total_visitas: fromDatabase(prev.total_visitas, 0),
        musicas_recentes: musicas === null ? prev.musicas_recentes : (musicas || []).map(m => ({ id: m.id, titulo: m.titulo, artista: m.artista, hora_execucao: m.hora_execucao })),
        noticias: noticias === null ? prev.noticias : (noticias || []).map(n => ({ id: n.id, titulo: n.titulo, resumo: n.resumo || '', link_completo: n.link_completo || '', imagem: n.imagem_url || '', created_at: n.created_at, updated_at: n.updated_at, destaque: (n as any).destaque || false })),
        patrocinadores: patrocinadores === null ? prev.patrocinadores : (patrocinadores || []).map(p => ({
          id: p.id,
          nome: p.nome,
          imagem: p.imagem_url || '',
          link: p.link || '',
          tipo: (p.tipo === 'premium' ? 'premium' : 'normal') as 'normal' | 'premium',
          posicao: p.posicao || 'rodape',
        })),
        slide_imagens: slides === null ? prev.slide_imagens : (slides || []).map(s => ({ id: s.id, imagem: s.imagem_url, ordem: s.ordem })),
        social_links: socialLinks === null ? prev.social_links : (socialLinks || []).map(s => ({ id: s.id, nome: s.nome, url: s.url, icone: s.icone, ordem: s.ordem, ativo: s.ativo })),
        promocoes: promocoes === null ? prev.promocoes : (promocoes || []).map((p: any) => ({
          id: p.id,
          nome: p.nome || '',
          texto: p.texto || '',
          descricao: p.descricao || '',
          imagem_url: p.imagem_url || '',
          link: p.link || '',
          ativo: p.ativo ?? true,
          data_inicio: p.data_inicio || '',
          data_validade: p.data_validade || '',
          prorrogada_ate: p.prorrogada_ate || '',
        })),
      };
    });
    } catch (err) {
      console.error('fetchData error:', err);
    }
  }, []);

  const checkCurrentProgram = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

    const active = programas.find(p => {
      if (!p.dias_semana.includes(dayOfWeek)) return false;
      return currentTime >= p.horario_inicio && currentTime < p.horario_fim;
    });

    if (active) {
      setCurrentPrograma(active);
      setIsLive(true);
      setConfig(prev => ({
        ...prev,
        programa_ao_vivo: active.nome,
        locutor_ao_vivo: active.locutor?.nome || '',
        locutor_imagem: active.locutor?.imagem_url || '',
        horario_inicio: active.horario_inicio.substring(0, 5),
        horario_fim: active.horario_fim.substring(0, 5),
      }));
    } else {
      setCurrentPrograma(null);
      setIsLive(false);
      setConfig(prev => ({
        ...prev,
        programa_ao_vivo: '',
        locutor_ao_vivo: '',
        locutor_imagem: '',
        horario_inicio: '',
        horario_fim: '',
      }));
    }
  };

  useEffect(() => {
    let inFlight = false;

    const refreshPublicData = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        await fetchData();
      } finally {
        inFlight = false;
      }
    };

    void refreshPublicData();
    const interval = window.setInterval(() => void refreshPublicData(), 30000);
    const handleFocus = () => void refreshPublicData();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void refreshPublicData();
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'sao-francisco-fm:data-updated') void refreshPublicData();
    };
    const handleDataUpdated = () => void refreshPublicData();

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('sao-francisco-fm:data-updated', handleDataUpdated);

    const locationTimer = window.setTimeout(() => {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          if (data.city) setLocationInfo({ city: data.city, region: data.region });
        })
        .catch(() => { });
    }, 2000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(locationTimer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sao-francisco-fm:data-updated', handleDataUpdated);
    };
  }, [fetchData]);

  useEffect(() => {
    checkCurrentProgram();
    const interval = setInterval(checkCurrentProgram, 30000);
    return () => clearInterval(interval);
  }, [programas]);

  const updateConfig = (updates: Partial<RadioConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  // Helper to detect device and browser
  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let device = "PC / Outro";
    if (/android/i.test(ua)) device = "Android";
    else if (/iphone|ipad|ipod/i.test(ua)) device = "iPhone";
    else if (/macintosh/i.test(ua)) device = "Mac";
    else if (/windows/i.test(ua)) device = "Windows";

    let browser = "Navegador";
    if (/chrome|crios|crmo/i.test(ua)) browser = "Chrome";
    else if (/safari/i.test(ua) && !/chrome|crios|crmo/i.test(ua)) browser = "Safari";
    else if (/firefox|iceweasel|fxios/i.test(ua)) browser = "Firefox";
    else if (/edg/i.test(ua)) browser = "Edge";
    else if (/opera|opr/i.test(ua)) browser = "Opera";

    return { device, browser };
  };

  // Realtime presence disabled - self-hosted Supabase doesn't support WebSocket
  useEffect(() => {
    setOnlineCount(1);
    setPresenceData([]);
  }, []);

  return (
    <RadioContext.Provider value={{
      config,
      updateConfig,
      isLive,
      currentPrograma,
      programas,
      refreshData: fetchData,
      onlineCount,
      presenceData,
      isListening,
      setIsListening,
    }}>
      {children}
    </RadioContext.Provider>
  );
};

export const useRadio = () => {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error('useRadio must be used within RadioProvider');
  return ctx;
};
