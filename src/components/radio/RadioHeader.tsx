import { useRadio } from '@/contexts/RadioContext';
import { Settings, Menu, X, Instagram, Facebook, Youtube, Smartphone, Apple, Link as LinkIcon, Globe } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import PhoneContact from '@/components/radio/PhoneContact';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  smartphone: Smartphone,
  apple: Apple,
  link: LinkIcon,
  globe: Globe,
};

const RadioHeader = () => {
  const { config } = useRadio();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const headerSponsors = config.patrocinadores.filter(p => p.posicao === 'barra_centro_em_cima');
  const activeSocialLinks = config.social_links.filter(s => s.ativo && s.url);

  const navLinks = [
    { to: '/', label: 'Início' },
    { to: '/sobre', label: 'Sobre' },
    { to: '/#noticias', label: 'Notícias' },
    { to: '/programacao', label: 'Programação' },
    { to: '/#contato', label: 'Contato' },
  ];

  const handleNavClick = (e: React.MouseEvent, link: { to: string }) => {
    if (link.to.includes('#')) {
      const hash = link.to.split('#')[1];
      if (location.pathname === '/') {
        e.preventDefault();
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMenuOpen(false);
  };

  return (
    <header className="gradient-primary sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          {config.visibilidade_logo && config.logo_principal && (
            <img src={config.logo_principal} alt={config.nome_radio} style={{ height: Math.min(config.logo_tamanho || 40, 50) }} className="object-contain" />
          )}
          <span className="font-display font-bold text-lg text-primary-foreground">{config.nome_radio}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={e => handleNavClick(e, link)} className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium">
              {link.label}
            </Link>
          ))}
        </nav>

        {headerSponsors.length > 0 && (
          <div className="hidden lg:flex items-center gap-4">
            {headerSponsors.map(p => (
              <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer">
                {p.imagem ? (
                  <img src={p.imagem} alt={p.nome} className={`object-contain opacity-80 hover:opacity-100 transition-opacity ${p.tipo === 'premium' ? 'h-12 max-w-[140px]' : 'h-10 max-w-[100px]'}`} />
                ) : (
                  <span className="text-xs text-primary-foreground/60 bg-primary-foreground/10 px-2 py-1 rounded">{p.nome}</span>
                )}
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Phone in header */}
          <PhoneContact position="header" variant="header" className="hidden md:flex" />
          {/* Social icons */}
          {activeSocialLinks.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5">
              {activeSocialLinks.map(s => {
                const IconComp = ICON_MAP[s.icone] || Globe;
                return (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-primary-foreground/20 transition-colors text-primary-foreground" title={s.nome}>
                    <IconComp className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          )}

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-primary-foreground/10 px-4 py-3 space-y-2">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={e => handleNavClick(e, link)} className="block text-sm text-primary-foreground/80 hover:text-primary-foreground py-1">
              {link.label}
            </Link>
          ))}
          {activeSocialLinks.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-primary-foreground/10">
              {activeSocialLinks.map(s => {
                const IconComp = ICON_MAP[s.icone] || Globe;
                return (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-primary-foreground/20 text-primary-foreground" title={s.nome}>
                    <IconComp className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          )}
        </nav>
      )}
    </header>
  );
};

export default RadioHeader;
