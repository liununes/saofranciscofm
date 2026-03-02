import { useRadio } from '@/contexts/RadioContext';
import RadioHeader from '@/components/radio/RadioHeader';
import RadioPlayer from '@/components/radio/RadioPlayer';
import ImageSlider from '@/components/radio/ImageSlider';
import RecentSongs from '@/components/radio/RecentSongs';
import NewsSection from '@/components/radio/NewsSection';
import WhatsAppButton from '@/components/radio/WhatsAppButton';
import RadioFooter from '@/components/radio/RadioFooter';

const SponsorBlock = ({ sponsors, className = '' }: { sponsors: any[]; className?: string }) => {
  if (sponsors.length === 0) return null;
  return (
    <div className={`flex items-center justify-center gap-4 flex-wrap py-3 ${className}`}>
      {sponsors.map(p => (
        <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer">
          {p.imagem ? (
            <img src={p.imagem} alt={p.nome} className={`object-contain ${p.tipo === 'premium' ? 'h-16 max-w-[200px]' : 'h-10 max-w-[120px]'}`} />
          ) : (
            <span className="text-sm text-muted-foreground">{p.nome}</span>
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

  return (
    <div className="min-h-screen bg-background">
      <RadioHeader />

      {/* Topo sponsors - only premium */}
      <SponsorBlock sponsors={topoSponsors} className="bg-muted" />

      <RadioPlayer />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Centro sponsors */}
        <SponsorBlock sponsors={centroSponsors} />

        {/* Slider Central */}
        <ImageSlider />

        {/* Content Grid with optional side sponsors */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6">
          {esquerdaSponsors.length > 0 && (
            <div className="hidden lg:flex flex-col items-center gap-4">
              {esquerdaSponsors.map(p => (
                <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer">
                  {p.imagem ? (
                    <img src={p.imagem} alt={p.nome} className={`object-contain ${p.tipo === 'premium' ? 'w-40' : 'w-28'}`} />
                  ) : (
                    <span className="text-xs text-muted-foreground">{p.nome}</span>
                  )}
                </a>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NewsSection />
            <RecentSongs />
          </div>

          {direitaSponsors.length > 0 && (
            <div className="hidden lg:flex flex-col items-center gap-4">
              {direitaSponsors.map(p => (
                <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer">
                  {p.imagem ? (
                    <img src={p.imagem} alt={p.nome} className={`object-contain ${p.tipo === 'premium' ? 'w-40' : 'w-28'}`} />
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
      <WhatsAppButton />
    </div>
  );
};

export default Index;
