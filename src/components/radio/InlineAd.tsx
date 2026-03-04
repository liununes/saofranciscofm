import GoogleAd from './GoogleAd';

/**
 * Component renamed internally to InlineSponsor to avoid simple AdBlocker filters
 * while maintaining the external name for compatibility.
 */

interface InlineAdProps {
  patrocinador: any;
  className?: string;
}

const InlineAd = ({ patrocinador, className = '' }: InlineAdProps) => {
  if (!patrocinador) return null;

  // If there's an ad snippet, render it centered (for third-party/HTML ads)
  if (patrocinador.codigo) {
    return (
      <div className={`w-full ${className}`}>
        <GoogleAd codigo={patrocinador.codigo} centered={true} className="w-full max-w-full" />
      </div>
    );
  }

  // Normalize image source
  const imageSrc = patrocinador.imagem_url || patrocinador.imagem || patrocinador.imagemUrl || patrocinador.image;

  // Otherwise render internal image/text/link ad
  return (
    <a
      href={patrocinador.link || patrocinador.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={`block hover:opacity-90 transition-opacity bg-muted/30 rounded-lg overflow-hidden ${className}`}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={patrocinador.nome || 'Anúncio'}
          className="w-full max-h-[300px] object-contain mx-auto"
          loading="eager"
          onError={(e) => {
            console.error('Failed to load ad image:', imageSrc);
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
      {patrocinador.texto && (
        <div className="p-3 bg-card/50">
          <p className="text-sm font-medium text-foreground">{patrocinador.texto}</p>
        </div>
      )}
      {!imageSrc && !patrocinador.texto && (
        <div className="p-4 text-center">
          <span className="text-sm font-medium text-foreground">{patrocinador.nome}</span>
        </div>
      )}
    </a>
  );
};

export default InlineAd;
