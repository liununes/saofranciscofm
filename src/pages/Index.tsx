import { useRadio } from '@/contexts/RadioContext';
import RadioHeader from '@/components/radio/RadioHeader';
import RadioPlayer from '@/components/radio/RadioPlayer';
import ImageSlider from '@/components/radio/ImageSlider';
import RecentSongs from '@/components/radio/RecentSongs';
import NewsSection from '@/components/radio/NewsSection';
import WhatsAppButton from '@/components/radio/WhatsAppButton';
import RadioFooter from '@/components/radio/RadioFooter';
import WorldMap from '@/components/radio/WorldMap';
import { useMemo, lazy, Suspense } from 'react';

const SponsorBlock = ({ sponsors, align = 'center', className = '' }: { sponsors: any[]; align?: string; className?: string }) => {
  if (sponsors.length === 0) return null;
  const justifyClass = align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center';
  return (
    <div className={`flex items-center ${justifyClass} gap-6 flex-wrap py-4 ${className}`}>
      {sponsors.map(p => (
        <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
          {p.imagem ? (
            <img src={p.imagem} alt={p.nome} className={`object-contain ${p.tipo === 'premium' ? 'h-16 max-w-[200px]' : 'h-12 max-w-[140px]'}`} />
          ) : (
            <span className="text-sm text-muted-foreground font-medium">{p.nome}</span>
          )}
        </a>
      ))}
    </div>
  );
};

const Index = () => {
  const { config } = useRadio();

  const topoSponsors = config.patrocinadores.filter(p => p.posicao === 'topo');
  const centroSponsors = config.patrocinadores.filter(p => p.posicao === 'centro');
  const esquerdaSponsors = config.patrocinadores.filter(p => p.posicao === 'esquerda');
  const direitaSponsors = config.patrocinadores.filter(p => p.posicao === 'direita');

  const align = config.patrocinador_alinhamento || 'center';

  const bgStyle = useMemo(() => {
    const style: React.CSSProperties = {};
    if (config.cor_fundo) style.backgroundColor = config.cor_fundo;
    if (config.cor_texto) style.color = config.cor_texto;
    if (config.imagem_fundo) {
      style.backgroundImage = `url(${config.imagem_fundo})`;
      style.backgroundRepeat = 'no-repeat';
      if (config.imagem_fundo_modo === 'cover') {
        style.backgroundSize = 'cover';
        style.backgroundPosition = 'center';
      } else if (config.imagem_fundo_modo === 'contain') {
        style.backgroundSize = 'contain';
        style.backgroundPosition = 'center';
      } else if (config.imagem_fundo_modo === 'left') {
        style.backgroundSize = 'cover';
        style.backgroundPosition = 'left';
      } else if (config.imagem_fundo_modo === 'right') {
        style.backgroundSize = 'cover';
        style.backgroundPosition = 'right';
      }
    }
    return style;
  }, [config.cor_fundo, config.cor_texto, config.imagem_fundo, config.imagem_fundo_modo]);

  return (
    <div className="min-h-screen" style={bgStyle}>
      <RadioHeader />

      {/* Topo sponsors */}
      <SponsorBlock sponsors={topoSponsors} align={align} className="bg-muted" />

      <div id="programacao"><RadioPlayer /></div>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Centro sponsors */}
        <SponsorBlock sponsors={centroSponsors} align={align} />

        {/* Slider */}
        <ImageSlider />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8">
          {esquerdaSponsors.length > 0 && (
            <div className="hidden lg:flex flex-col items-center gap-4">
              {esquerdaSponsors.map(p => (
                <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                  {p.imagem ? (
                    <img src={p.imagem} alt={p.nome} className={`object-contain ${p.tipo === 'premium' ? 'w-44' : 'w-32'}`} />
                  ) : (
                    <span className="text-xs text-muted-foreground">{p.nome}</span>
                  )}
                </a>
              ))}
            </div>
          )}

          <div className="space-y-8">
            {/* Notícias + Músicas + Mapa */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div id="noticias" className="lg:col-span-1"><NewsSection /></div>
              <div className="lg:col-span-1"><RecentSongs /></div>
              <div className="lg:col-span-1"><WorldMap /></div>
            </div>
          </div>

          {direitaSponsors.length > 0 && (
            <div className="hidden lg:flex flex-col items-center gap-4">
              {direitaSponsors.map(p => (
                <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                  {p.imagem ? (
                    <img src={p.imagem} alt={p.nome} className={`object-contain ${p.tipo === 'premium' ? 'w-44' : 'w-32'}`} />
                  ) : (
                    <span className="text-xs text-muted-foreground">{p.nome}</span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </main>

      <RadioFooter />
      <div id="contato"><WhatsAppButton /></div>
    </div>
  );
};

export default Index;
