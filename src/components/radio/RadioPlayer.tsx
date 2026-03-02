import { useState, useRef } from 'react';
import { useRadio } from '@/contexts/RadioContext';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const RadioPlayer = () => {
  const { config, isLive, currentPrograma } = useRadio();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.src = config.streaming_url;
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolume = (val: number[]) => {
    const v = val[0];
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v / 100;
    if (v === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const positionClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[config.player_posicao];

  return (
    <section className="gradient-hero py-6">
      <audio ref={audioRef} preload="none" />
      <div className={`container mx-auto px-4 flex ${positionClass}`}>
        <div className="flex items-center gap-4 sm:gap-6 bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-primary-foreground/10 w-full max-w-2xl">
          {/* Locutor image */}
          {isLive && config.locutor_imagem && (
            <img src={config.locutor_imagem} alt={config.locutor_ao_vivo} className="w-12 h-12 rounded-full object-cover border-2 border-secondary flex-shrink-0 hidden sm:block" />
          )}

          {/* Play Button */}
          <button
            onClick={togglePlay}
            className="flex-shrink-0 w-14 h-14 rounded-full gradient-secondary flex items-center justify-center hover:scale-105 transition-transform shadow-elevated"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-secondary-foreground" />
            ) : (
              <Play className="w-6 h-6 text-secondary-foreground ml-0.5" />
            )}
          </button>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
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
                <p className="text-primary-foreground font-display font-semibold text-sm truncate">
                  {config.programa_ao_vivo}
                </p>
                <p className="text-primary-foreground/70 text-xs truncate">
                  {config.locutor_ao_vivo} • {config.horario_inicio} - {config.horario_fim}
                </p>
              </>
            ) : (
              <p className="text-primary-foreground font-display font-semibold text-sm truncate">
                {config.nome_radio}
              </p>
            )}
            {config.musica_atual && (
              <p className="text-secondary text-xs font-medium truncate mt-0.5">
                ♪ {config.musica_atual}
              </p>
            )}
          </div>

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <button onClick={toggleMute} className="text-primary-foreground/70 hover:text-primary-foreground">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolume}
              max={100}
              step={1}
              className="w-20"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default RadioPlayer;
