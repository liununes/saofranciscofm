import { useRadio } from '@/contexts/RadioContext';
import { Radio } from 'lucide-react';

const RadioFooter = () => {
  const { config } = useRadio();

  return (
    <footer className="gradient-primary py-8 mt-8">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Radio className="w-5 h-5 text-secondary" />
          <span className="font-display font-bold text-primary-foreground">{config.nome_radio}</span>
        </div>
        <p className="text-primary-foreground/60 text-sm">
          © {new Date().getFullYear()} {config.nome_radio}. Todos os direitos reservados.
        </p>

        {config.patrocinadores.length > 0 && (
          <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
            {config.patrocinadores.map(p => (
              <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/50 hover:text-primary-foreground/80 text-xs transition-colors">
                {p.nome}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
};

export default RadioFooter;
