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
  streaming_url: string;
  player_posicao: 'left' | 'center' | 'right';
  musica_atual: string;
  whatsapp_numero: string;
  whatsapp_mensagem: string;
  cor_primaria: string;
  cor_secundaria: string;
  locutor_ao_vivo: string;
  programa_ao_vivo: string;
  horario_inicio: string;
  horario_fim: string;
  locutor_imagem?: string;
  musicas_recentes: Musica[];
  noticias: Noticia[];
  patrocinadores: Patrocinador[];
  slide_imagens: SlideImagem[];
}

const defaultConfig: RadioConfig = {
  nome_radio: 'Rádio Personalizada FM',
  logo_principal: '',
  logo_extra: '',
  streaming_url: 'https://stm28.srvaudio.com.br:10884/',
  player_posicao: 'center',
  musica_atual: '',
  whatsapp_numero: '553335112000',
  whatsapp_mensagem: 'Olá! Quero fazer um pedido musical! 🎵',
  cor_primaria: '#005BBB',
  cor_secundaria: '#FFA500',
  locutor_ao_vivo: '',
  programa_ao_vivo: '',
  horario_inicio: '',
  horario_fim: '',
  locutor_imagem: '',
  musicas_recentes: [],
  noticias: [],
  patrocinadores: [],
  slide_imagens: [],
};

interface RadioContextType {
  config: RadioConfig;
  updateConfig: (updates: Partial<RadioConfig>) => void;
  isLive: boolean;
  currentPrograma: Programa | null;
  refreshData: () => Promise<void>;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export const RadioProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<RadioConfig>(defaultConfig);
  const [isLive, setIsLive] = useState(false);
  const [currentPrograma, setCurrentPrograma] = useState<Programa | null>(null);
  const [programas, setProgramas] = useState<Programa[]>([]);

  const fetchData = async () => {
    const [rcRes, musicasRes, noticiasRes, patRes, slidesRes, progsRes] = await Promise.all([
      supabase.from('radio_config').select('*').limit(1).single(),
      supabase.from('musicas_recentes').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('noticias').select('*').order('created_at', { ascending: false }),
      supabase.from('patrocinadores').select('*'),
      supabase.from('slide_imagens').select('*').order('ordem', { ascending: true }),
      supabase.from('programas').select('*, locutores(*)').eq('ativo', true),
    ]);

    const rc = rcRes.data;
    const musicas = musicasRes.data;
    const noticias = noticiasRes.data;
    const patrocinadores = patRes.data;
    const slides = slidesRes.data;
    const progs = progsRes.data;

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
      streaming_url: rc?.streaming_url || prev.streaming_url,
      player_posicao: (rc?.player_posicao as any) || 'center',
      musica_atual: rc?.musica_atual || '',
      whatsapp_numero: rc?.whatsapp_numero || prev.whatsapp_numero,
      whatsapp_mensagem: rc?.whatsapp_mensagem || prev.whatsapp_mensagem,
      cor_primaria: rc?.cor_primaria || prev.cor_primaria,
      cor_secundaria: rc?.cor_secundaria || prev.cor_secundaria,
      musicas_recentes: (musicas || []).map(m => ({ id: m.id, titulo: m.titulo, artista: m.artista, hora_execucao: m.hora_execucao })),
      noticias: (noticias || []).map(n => ({ id: n.id, titulo: n.titulo, resumo: n.resumo || '', link_completo: n.link_completo || '', imagem: n.imagem_url || '' })),
      patrocinadores: (patrocinadores || []).map(p => ({
        id: p.id,
        nome: p.nome,
        imagem: p.imagem_url || '',
        link: p.link || '',
        tipo: (p as any).tipo || 'normal',
        posicao: (p as any).posicao || 'rodape',
      })),
      slide_imagens: (slides || []).map(s => ({ id: s.id, imagem: s.imagem_url, ordem: s.ordem })),
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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    checkCurrentProgram();
    const interval = setInterval(checkCurrentProgram, 30000);
    return () => clearInterval(interval);
  }, [programas]);

  const updateConfig = (updates: Partial<RadioConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <RadioContext.Provider value={{ config, updateConfig, isLive, currentPrograma, refreshData: fetchData }}>
      {children}
    </RadioContext.Provider>
  );
};

export const useRadio = () => {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error('useRadio must be used within RadioProvider');
  return ctx;
};
