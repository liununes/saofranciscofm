import { useCallback, useEffect, useRef, useState } from 'react';
import { useRadio } from '@/contexts/RadioContext';
import { Play, Pause, Volume2, VolumeX, Phone } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getPlayableStreamingUrl, getSupabaseErrorMessage } from '@/lib/supabaseUtils';

const RadioPlayer = () => {
  const { config, isLive, setIsListening } = useRadio();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const previousUrlRef = useRef('');

  const stopPlaybackState = useCallback(() => {
    setIsPlaying(false);
    setIsListening(false);
  }, [setIsListening]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlaying = () => {
      setIsPlaying(true);
      setIsListening(true);
      setAutoplayBlocked(false);
    };
    const handlePause = () => stopPlaybackState();
    const handleEnded = () => stopPlaybackState();
    const handleError = () => {
      stopPlaybackState();
      if (audio.src) {
        toast.error('Não foi possível conectar ao streaming. Verifique a URL ou tente novamente.');
      }
    };

    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [setIsListening, stopPlaybackState]);

  useEffect(() => {
    const audio = audioRef.current;
    const streamUrl = config.streaming_url?.trim() || '';
    const playableUrl = streamUrl ? getPlayableStreamingUrl(streamUrl) : '';
    if (!audio) return;

    if (!streamUrl) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      previousUrlRef.current = '';
      stopPlaybackState();
      return;
    }

    if (previousUrlRef.current === playableUrl) return;

    const wasPlaying = !audio.paused && !audio.ended;
    previousUrlRef.current = playableUrl;
    audio.pause();
    audio.src = playableUrl;
    audio.volume = volume / 100;
    audio.load();

    if (wasPlaying) {
      void audio.play().catch((error: unknown) => {
        stopPlaybackState();
        setAutoplayBlocked(true);
        console.error('[RadioPlayer] Falha ao retomar streaming:', error);
      });
    }
  }, [config.streaming_url, stopPlaybackState, volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const startPlayback = async () => {
    const audio = audioRef.current;
    const streamUrl = config.streaming_url?.trim() || '';
    const playableUrl = streamUrl ? getPlayableStreamingUrl(streamUrl) : '';
    if (!audio) return;

    if (!streamUrl) {
      toast.error('O streaming ainda não foi configurado no painel administrativo.');
      return;
    }

    if (previousUrlRef.current !== playableUrl) {
      previousUrlRef.current = playableUrl;
      audio.src = playableUrl;
      audio.load();
    }

    try {
      setAutoplayBlocked(false);
      await audio.play();
    } catch (error: unknown) {
      stopPlaybackState();
      const browserBlocked = error instanceof DOMException && error.name === 'NotAllowedError';
      setAutoplayBlocked(browserBlocked);
      if (!browserBlocked) {
        toast.error(`Não foi possível iniciar o streaming: ${getSupabaseErrorMessage(error, 'o servidor não respondeu')}`);
      }
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      return;
    }

    void startPlayback();
  };

  const handleVolume = (values: number[]) => {
    const nextVolume = values[0] ?? volume;
    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = nextVolume / 100;
      audioRef.current.muted = nextVolume === 0;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  const logoSize = config.logo_tamanho || 80;
  const logoPos = config.logo_posicao || 'left';
  const extraPos = config.logo_extra_posicao || 'right';
  const anyAbove = logoPos === 'above' || (config.logo_extra && extraPos === 'above');

  return (
    <section className="gradient-hero py-8">
      <audio ref={audioRef} preload="none" />
      <div className="container mx-auto px-4">
        {anyAbove && (
          <div className="flex items-center justify-center gap-6 mb-4">
            {config.logo_principal && logoPos === 'above' && (
              <img src={config.logo_principal} alt={config.nome_radio} style={{ height: `${logoSize}px` }} className="object-contain drop-shadow-lg" />
            )}
            {config.logo_extra && extraPos === 'above' && (
              <img src={config.logo_extra} alt="Logo Extra" style={{ height: `${logoSize}px` }} className="object-contain drop-shadow-lg" />
            )}
          </div>
        )}
        <div className="flex flex-row items-center justify-center gap-6 max-w-4xl mx-auto">
          {config.logo_principal && logoPos === 'left' && (
            <img src={config.logo_principal} alt={config.nome_radio} style={{ height: `${logoSize}px` }} className="object-contain flex-shrink-0 drop-shadow-lg" />
          )}
          {config.logo_extra && extraPos === 'left' && (
            <img src={config.logo_extra} alt="Logo Extra" style={{ height: `${logoSize}px` }} className="object-contain flex-shrink-0 drop-shadow-lg" />
          )}

          <div className="flex items-center gap-4 bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-primary-foreground/10 flex-1 w-full max-w-xl">
            {isLive && config.locutor_imagem && (
              <Dialog>
                <DialogTrigger asChild>
                  <img
                    src={config.locutor_imagem}
                    alt={config.locutor_ao_vivo}
                    className="w-12 h-12 rounded-full object-cover border-2 border-secondary flex-shrink-0 hidden sm:block cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-transparent border-none shadow-none">
                  <DialogHeader className="sr-only">
                    <DialogTitle>{config.locutor_ao_vivo}</DialogTitle>
                  </DialogHeader>
                  <div className="relative flex items-center justify-center">
                    <img src={config.locutor_imagem} alt={config.locutor_ao_vivo} className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="bg-black/60 text-white px-4 py-2 rounded-full backdrop-blur-sm font-display font-medium">{config.locutor_ao_vivo}</span>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pausar streaming' : 'Tocar streaming'}
              className="flex-shrink-0 w-14 h-14 rounded-full gradient-secondary flex items-center justify-center hover:scale-105 transition-transform shadow-elevated"
            >
              {isPlaying ? <Pause className="w-6 h-6 text-secondary-foreground" /> : <Play className="w-6 h-6 text-secondary-foreground ml-0.5" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {autoplayBlocked && !isPlaying && (
                  <button type="button" onClick={togglePlay} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider animate-pulse">
                    Ativar som
                  </button>
                )}
                {isLive && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-live text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-live-pulse" />
                    Ao Vivo
                  </span>
                )}
                {isPlaying && (
                  <div className="flex items-end gap-0.5 h-4">
                    <div className="w-1 bg-secondary rounded-full animate-eq-1" />
                    <div className="w-1 bg-secondary rounded-full animate-eq-2" />
                    <div className="w-1 bg-secondary rounded-full animate-eq-3" />
                  </div>
                )}
              </div>
              {isLive ? (
                <>
                  <p className="text-primary-foreground font-display font-semibold text-sm truncate">{config.programa_ao_vivo}</p>
                  <p className="text-primary-foreground/70 text-xs truncate">{config.locutor_ao_vivo} • {config.horario_inicio} - {config.horario_fim}</p>
                </>
              ) : (
                <p className="text-primary-foreground font-display font-semibold text-sm truncate">{config.nome_radio}</p>
              )}
              {config.musica_atual && <p className="text-secondary text-xs font-medium truncate mt-0.5">♪ {config.musica_atual}</p>}
            </div>

            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <button type="button" onClick={toggleMute} aria-label={isMuted ? 'Ativar volume' : 'Silenciar streaming'} className="text-primary-foreground/70 hover:text-primary-foreground">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <Slider value={[isMuted ? 0 : volume]} onValueChange={handleVolume} max={100} step={1} aria-label="Volume" className="w-20" />
            </div>
          </div>

          {config.logo_principal && logoPos === 'right' && (
            <img src={config.logo_principal} alt={config.nome_radio} style={{ height: `${logoSize}px` }} className="object-contain flex-shrink-0 drop-shadow-lg" />
          )}
          {config.logo_extra && extraPos === 'right' && (
            <img src={config.logo_extra} alt="Logo Extra" style={{ height: `${logoSize}px` }} className="object-contain flex-shrink-0 drop-shadow-lg" />
          )}

          {config.visibilidade_telefone && config.telefone_contato && config.telefone_posicao === 'player' && (
            <a href={`tel:${config.telefone_contato.replace(/\D/g, '')}`} className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors flex-shrink-0">
              <Phone className="w-5 h-5 text-secondary" />
              <div className="text-primary-foreground">
                <p className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">Contato</p>
                <p className="font-display font-bold text-lg leading-tight">{config.telefone_contato}</p>
              </div>
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default RadioPlayer;
