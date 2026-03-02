import { useRadio } from '@/contexts/RadioContext';
import { Music, Clock } from 'lucide-react';

const RecentSongs = () => {
  const { config } = useRadio();

  if (config.musicas_recentes.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl shadow-card p-6">
      <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2 mb-5">
        <Music className="w-5 h-5 text-secondary" />
        Últimas Músicas
      </h2>
      <div className="space-y-3">
        {config.musicas_recentes.map((m, i) => (
          <div
            key={m.id}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
              i === 0 ? 'bg-primary/5 border border-primary/10' : 'hover:bg-muted'
            }`}
          >
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground text-xs font-bold">{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{m.titulo}</p>
              <p className="text-xs text-muted-foreground truncate">{m.artista}</p>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-xs flex-shrink-0">
              <Clock className="w-3 h-3" />
              {m.hora_execucao}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentSongs;
