import React from 'react';
import GoogleAd from './GoogleAd';

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

  // Otherwise render internal image/text/link ad
  return (
    <a href={patrocinador.link || '#'} target="_blank" rel="noopener noreferrer" className={`block hover:opacity-90 transition-opacity ${className}`}>
      {patrocinador.imagem_url ? (
        <img src={patrocinador.imagem_url} alt={patrocinador.nome} className="w-full max-h-72 object-cover rounded-md mx-auto" />
      ) : null}
      {patrocinador.texto && <p className="text-sm font-medium text-foreground mt-3">{patrocinador.texto}</p>}
      {!patrocinador.imagem_url && !patrocinador.texto && <span className="text-sm font-medium text-foreground">{patrocinador.nome}</span>}
    </a>
  );
};

export default InlineAd;
