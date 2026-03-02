import { useRadio } from '@/contexts/RadioContext';
import { Radio, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import radioLogo from '@/assets/radio-logo.png';

const RadioHeader = () => {
  const { config } = useRadio();

  return (
    <header className="gradient-primary sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <div className="flex items-center gap-3">
          <img
            src={config.logo_principal || radioLogo}
            alt={config.nome_radio}
            className="h-12 w-12 rounded-full object-cover border-2 border-secondary"
          />
          <div>
            <h1 className="font-display font-bold text-lg text-primary-foreground leading-tight">
              {config.nome_radio}
            </h1>
          </div>
        </div>

        {config.patrocinadores.length > 0 && (
          <div className="hidden md:flex items-center gap-4">
            {config.patrocinadores.slice(0, 3).map(p => (
              <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer">
                {p.imagem ? (
                  <img src={p.imagem} alt={p.nome} className="h-8 max-w-[80px] object-contain opacity-80 hover:opacity-100 transition-opacity" />
                ) : (
                  <span className="text-xs text-primary-foreground/60 bg-primary-foreground/10 px-2 py-1 rounded">{p.nome}</span>
                )}
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          {config.logo_extra && (
            <img src={config.logo_extra} alt="Logo extra" className="h-10 hidden sm:block" />
          )}
          <Link
            to="/admin"
            className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors text-primary-foreground"
            title="Painel Administrativo"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default RadioHeader;
