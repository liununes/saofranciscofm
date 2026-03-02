import { useRadio } from '@/contexts/RadioContext';
import RadioHeader from '@/components/radio/RadioHeader';
import RadioPlayer from '@/components/radio/RadioPlayer';
import ImageSlider from '@/components/radio/ImageSlider';
import RecentSongs from '@/components/radio/RecentSongs';
import NewsSection from '@/components/radio/NewsSection';
import WhatsAppButton from '@/components/radio/WhatsAppButton';
import RadioFooter from '@/components/radio/RadioFooter';
import WorldMap from '@/components/radio/WorldMap';
import GoogleAd from '@/components/radio/GoogleAd';
import PhoneContact from '@/components/radio/PhoneContact';
import { useMemo } from 'react';

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

      {/* Google Ads - Topo */}
      {config.ads_topo_ativo && config.ads_topo_codigo && (
        <GoogleAd codigo={config.ads_topo_codigo} className="py-2 bg-muted/50" />
      )}

      {/* Topo sponsors */}
      {config.visibilidade_patrocinadores && <SponsorBlock sponsors={topoSponsors} align={align} className="bg-muted" />}

      {/* Telefone - posição topo */}
      <PhoneContact position="topo" variant="bar" />

      {config.visibilidade_player && <div id="programacao"><RadioPlayer /></div>}

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Centro sponsors */}
        {config.visibilidade_patrocinadores && <SponsorBlock sponsors={centroSponsors} align={align} />}

        {/* Slider */}
        {config.visibilidade_slides && <ImageSlider />}

        {/* Google Ads - Meio */}
        {config.ads_meio_ativo && config.ads_meio_codigo && (
          <GoogleAd codigo={config.ads_meio_codigo} className="py-4" />
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8">
          {config.visibilidade_patrocinadores && esquerdaSponsors.length > 0 && (
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {config.visibilidade_noticias && <div id="noticias" className="lg:col-span-1"><NewsSection /></div>}
              {config.visibilidade_musicas && <div className="lg:col-span-1"><RecentSongs /></div>}
              {config.visibilidade_mapa && <div className="lg:col-span-1"><WorldMap /></div>}
            </div>

            {/* Telefone - posições centro, meio-esquerda, meio-direita */}
            <PhoneContact position="centro" variant="block" />
            <PhoneContact position="meio-esquerda" variant="block" />
            <PhoneContact position="meio-direita" variant="block" />
          </div>

          {config.visibilidade_patrocinadores && direitaSponsors.length > 0 && (
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

      {/* Google Ads - Rodapé */}
      {config.ads_rodape_ativo && config.ads_rodape_codigo && (
        <GoogleAd codigo={config.ads_rodape_codigo} className="py-4 bg-muted/50" />
      )}

      <RadioFooter />
      <div id="contato"><WhatsAppButton /></div>
    </div>
  );
};

export default Index;
