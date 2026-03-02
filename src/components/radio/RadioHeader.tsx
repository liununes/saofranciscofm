import { useRadio } from '@/contexts/RadioContext';
import { Radio, Settings, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import radioLogo from '@/assets/radio-logo.png';

const RadioHeader = () => {
  const { config } = useRadio();
  const [menuOpen, setMenuOpen] = useState(false);

  const headerSponsors = config.patrocinadores.filter(p => p.posicao === 'barra_centro_em_cima');

  const navLinks = [
    { to: '/', label: 'Início' },
    { to: '/sobre', label: 'Sobre' },
    { to: '/#noticias', label: 'Notícias' },
    { to: '/#programacao', label: 'Programação' },
    { to: '/#contato', label: 'Contato' },
  ];

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

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium"
              onClick={(e) => {
                if (link.to.includes('#')) {
                  const hash = link.to.split('#')[1];
                  const el = document.getElementById(hash);
                  if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
                }
              }}>
              {link.label}
            </Link>
          ))}
        </nav>

        {headerSponsors.length > 0 && (
          <div className="hidden md:flex items-center gap-4">
            {headerSponsors.map(p => (
              <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer">
                {p.imagem ? (
                  <img src={p.imagem} alt={p.nome} className={`object-contain opacity-80 hover:opacity-100 transition-opacity ${p.tipo === 'premium' ? 'h-10 max-w-[120px]' : 'h-8 max-w-[80px]'}`} />
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
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden border-t border-primary-foreground/10 px-4 py-3 space-y-2">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={(e) => {
              setMenuOpen(false);
              if (link.to.includes('#')) {
                const hash = link.to.split('#')[1];
                const el = document.getElementById(hash);
                if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
              }
            }} className="block text-sm text-primary-foreground/80 hover:text-primary-foreground py-1">
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default RadioHeader;
