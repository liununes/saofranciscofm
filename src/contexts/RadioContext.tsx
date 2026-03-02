import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

export interface SlideImagem {
  id: string;
  imagem: string;
  ordem: number;
}

export interface RadioConfig {
  nome_radio: string;
  logo_principal: string;
  logo_extra: string;
  streaming_url: string;
  player_posicao: 'left' | 'center' | 'right';
  locutor_ao_vivo: string;
  programa_ao_vivo: string;
  horario_inicio: string;
  horario_fim: string;
  musica_atual: string;
  whatsapp_numero: string;
  whatsapp_mensagem: string;
  cor_primaria: string;
  cor_secundaria: string;
  musicas_recentes: Musica[];
  noticias: Noticia[];
  patrocinadores: Patrocinador[];
  slide_imagens: SlideImagem[];
}

const defaultConfig: RadioConfig = {
  nome_radio: 'Rádio Personalizada FM',
  logo_principal: '',
  logo_extra: '',
  streaming_url: 'https://stream.zeno.fm/example',
  player_posicao: 'center',
  locutor_ao_vivo: 'DJ Marco Aurélio',
  programa_ao_vivo: 'Manhã Total',
  horario_inicio: '06:00',
  horario_fim: '10:00',
  musica_atual: 'Jorge & Mateus - Enquanto Houver Razões',
  whatsapp_numero: '553335112000',
  whatsapp_mensagem: 'Olá! Quero fazer um pedido musical! 🎵',
  cor_primaria: '#005BBB',
  cor_secundaria: '#FFA500',
  musicas_recentes: [
    { id: '1', titulo: 'Enquanto Houver Razões', artista: 'Jorge & Mateus', hora_execucao: '08:45' },
    { id: '2', titulo: 'Atrasadinha', artista: 'Felipe Araújo', hora_execucao: '08:40' },
    { id: '3', titulo: 'Milu', artista: 'Gusttavo Lima', hora_execucao: '08:35' },
    { id: '4', titulo: 'Coração Cachorro', artista: 'Ávine e Matheus Fernandes', hora_execucao: '08:30' },
    { id: '5', titulo: 'Deixa Eu Te Amar', artista: 'Sorriso Maroto', hora_execucao: '08:25' },
  ],
  noticias: [
    { id: '1', titulo: 'Festival de Música chega à cidade neste fim de semana', resumo: 'O maior festival de música da região acontece neste sábado e domingo com mais de 20 atrações.', link_completo: '#' },
    { id: '2', titulo: 'Prefeitura anuncia obras de revitalização do centro', resumo: 'Projeto prevê melhorias na iluminação, calçadas e paisagismo das principais ruas.', link_completo: '#' },
    { id: '3', titulo: 'Campeonato regional de futebol define semifinalistas', resumo: 'Quatro equipes garantiram vaga na semifinal após rodada emocionante.', link_completo: '#' },
  ],
  patrocinadores: [
    { id: '1', nome: 'Patrocinador 1', imagem: '', link: '#' },
    { id: '2', nome: 'Patrocinador 2', imagem: '', link: '#' },
  ],
  slide_imagens: [],
};

interface RadioContextType {
  config: RadioConfig;
  updateConfig: (updates: Partial<RadioConfig>) => void;
  isLive: boolean;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export const RadioProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<RadioConfig>(() => {
    try {
      const saved = localStorage.getItem('radioConfig');
      return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
    } catch {
      return defaultConfig;
    }
  });

  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    localStorage.setItem('radioConfig', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    const checkLive = () => {
      const now = new Date();
      const [startH, startM] = config.horario_inicio.split(':').map(Number);
      const [endH, endM] = config.horario_fim.split(':').map(Number);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      setIsLive(currentMinutes >= startMinutes && currentMinutes <= endMinutes);
    };
    checkLive();
    const interval = setInterval(checkLive, 30000);
    return () => clearInterval(interval);
  }, [config.horario_inicio, config.horario_fim]);

  const updateConfig = (updates: Partial<RadioConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <RadioContext.Provider value={{ config, updateConfig, isLive }}>
      {children}
    </RadioContext.Provider>
  );
};

export const useRadio = () => {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error('useRadio must be used within RadioProvider');
  return ctx;
};
