import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  refreshData: () => Promise<void>;
  onlineCount: number;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export const RadioProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<RadioConfig>(defaultConfig);
  const [isLive, setIsLive] = useState(false);
  const [currentPrograma, setCurrentPrograma] = useState<Programa | null>(null);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [onlineCount, setOnlineCount] = useState(1);

  const fetchData = async () => {
    const [rcRes, musicasRes, noticiasRes, patRes, slidesRes, progsRes, socialRes, promoRes, visitasRes] = await Promise.all([
      supabase.from('radio_config').select('*').limit(1).single(),
      supabase.from('musicas_recentes').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('noticias').select('*').order('created_at', { ascending: false }),
      supabase.from('patrocinadores').select('*'),
      supabase.from('slide_imagens').select('*').order('ordem', { ascending: true }),
      supabase.from('programas').select('*, locutores(*)').eq('ativo', true),
      supabase.from('social_links').select('*').order('ordem', { ascending: true }),
      supabase.from('promocoes').select('*').order('created_at', { ascending: false }),
      supabase.from('page_views').select('*', { count: 'exact', head: true }),
    ]);

    const rc = rcRes.data;
    const musicas = musicasRes.data;
    const noticias = noticiasRes.data;
    const patrocinadores = patRes.data;
    const slides = slidesRes.data;
    const progs = progsRes.data;
    const socialLinks = socialRes.data;
    const promocoes = promoRes.data;

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
    setProgramas(mappedProgramas);

    setConfig(prev => ({
      ...prev,
      nome_radio: rc?.nome_radio || prev.nome_radio,
      logo_principal: rc?.logo_principal || '',
      logo_extra: rc?.logo_extra || '',
      logo_extra_posicao: (rc?.logo_extra_posicao as any) || 'right',
      streaming_url: rc?.streaming_url || prev.streaming_url,
      player_posicao: (rc?.player_posicao as any) || 'center',
      logo_posicao: (rc?.logo_posicao as any) || 'left',
      logo_tamanho: rc?.logo_tamanho || 80,
      patrocinador_alinhamento: (rc?.patrocinador_alinhamento as any) || 'center',
      tema: (rc?.tema as any) || 'claro',
      musica_atual: rc?.musica_atual || '',
      whatsapp_numero: rc?.whatsapp_numero || prev.whatsapp_numero,
      whatsapp_mensagem: rc?.whatsapp_mensagem || prev.whatsapp_mensagem,
      cor_primaria: rc?.cor_primaria || prev.cor_primaria,
      cor_secundaria: rc?.cor_secundaria || prev.cor_secundaria,
      cor_texto: rc?.cor_texto || prev.cor_texto,
      cor_fundo: rc?.cor_fundo || prev.cor_fundo,
      imagem_fundo: rc?.imagem_fundo || '',
      imagem_fundo_modo: rc?.imagem_fundo_modo || 'cover',
      telefone_contato: rc?.telefone_contato || '3511-2000',
      telefone_link: rc?.telefone_link || '',
      visibilidade_logo: rc?.visibilidade_logo ?? true,
      visibilidade_noticias: rc?.visibilidade_noticias ?? true,
      visibilidade_musicas: rc?.visibilidade_musicas ?? true,
      visibilidade_player: rc?.visibilidade_player ?? true,
      visibilidade_patrocinadores: rc?.visibilidade_patrocinadores ?? true,
      visibilidade_slides: rc?.visibilidade_slides ?? true,
      visibilidade_mapa: rc?.visibilidade_mapa ?? true,
      visibilidade_telefone: rc?.visibilidade_telefone ?? true,
      visibilidade_destaque: rc?.visibilidade_destaque ?? true,
      visibilidade_proximo_programa: rc?.visibilidade_proximo_programa ?? true,
      visibilidade_participacao: rc?.visibilidade_participacao ?? true,
      visibilidade_premium: rc?.visibilidade_premium ?? true,
      noticias_posicao: ((rc as any)?.noticias_posicao as any) || 'centro',
      telefone_posicao: (rc?.telefone_posicao as any) || 'player',
      ads_topo_codigo: rc?.ads_topo_codigo || '',
      ads_topo_ativo: rc?.ads_topo_ativo ?? false,
      ads_meio_codigo: rc?.ads_meio_codigo || '',
      ads_meio_ativo: rc?.ads_meio_ativo ?? false,
      ads_rodape_codigo: rc?.ads_rodape_codigo || '',
      ads_rodape_ativo: rc?.ads_rodape_ativo ?? false,
      total_visitas: visitasRes?.count || 0,
      musicas_recentes: (musicas || []).map(m => ({ id: m.id, titulo: m.titulo, artista: m.artista, hora_execucao: m.hora_execucao })),
      noticias: (noticias || []).map(n => ({ id: n.id, titulo: n.titulo, resumo: n.resumo || '', link_completo: n.link_completo || '', imagem: n.imagem_url || '', created_at: n.created_at, updated_at: n.updated_at, destaque: (n as any).destaque || false })),
      patrocinadores: (patrocinadores || []).map(p => ({
        id: p.id,
        nome: p.nome,
        imagem: p.imagem_url || '',
        link: p.link || '',
        tipo: (p.tipo === 'premium' ? 'premium' : 'normal') as 'normal' | 'premium',
        posicao: p.posicao || 'rodape',
      })),
      slide_imagens: (slides || []).map(s => ({ id: s.id, imagem: s.imagem_url, ordem: s.ordem })),
      social_links: (socialLinks || []).map(s => ({ id: s.id, nome: s.nome, url: s.url, icone: s.icone, ordem: s.ordem, ativo: s.ativo })),
      promocoes: (promocoes || []).map((p: any) => ({
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
    }));
  };

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

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    checkCurrentProgram();
    const interval = setInterval(checkCurrentProgram, 30000);
    return () => clearInterval(interval);
  }, [programas]);

  const updateConfig = (updates: Partial<RadioConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  // Listeners Real-time Presence
  useEffect(() => {
    const channel = supabase.channel('online-listeners', {
      config: {
        presence: {
          key: 'user',
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setOnlineCount(count > 0 ? count : 1);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <RadioContext.Provider value={{ config, updateConfig, isLive, currentPrograma, refreshData: fetchData, onlineCount }}>
      {children}
    </RadioContext.Provider>
  );
};

export const useRadio = () => {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error('useRadio must be used within RadioProvider');
  return ctx;
};
