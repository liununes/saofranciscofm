import { useState } from 'react';
import { useRadio } from '@/contexts/RadioContext';
import { Newspaper, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR');
};

const NewsSection = () => {
  const { config } = useRadio();
  const posicao = config.noticias_posicao || 'centro';
  const hasOtherBlocks = config.visibilidade_musicas;

  // When centered without other blocks: horizontal grid. Otherwise: vertical list.
  const isHorizontalGrid = posicao === 'centro' && !hasOtherBlocks;

  return (
    <div className="bg-card rounded-2xl shadow-card p-6">
      <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2 mb-5">
        <Newspaper className="w-5 h-5 text-secondary" />
        Notícias
      </h2>
      <div className={isHorizontalGrid 
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        : "space-y-4"
      }>
        {config.noticias.map(n => (
          <Link 
            key={n.id} 
            to={`/noticia/${n.id}`}
            className="group block"
          >
            <article>
              <div className={`p-4 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border ${isHorizontalGrid ? 'flex flex-col h-full' : ''}`}>
                {isHorizontalGrid ? (
                  <>
                    {n.imagem && (
                      <img src={n.imagem} alt={n.titulo} className="w-full h-40 rounded-xl object-cover mb-3" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-base text-foreground group-hover:text-primary transition-colors mb-1.5 line-clamp-2">
                        {n.titulo}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">{n.resumo}</p>
                      {n.created_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(n.created_at)}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-2 group-hover:gap-2 transition-all">
                        Ler mais <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-4">
                    {n.imagem && (
                      <img src={n.imagem} alt={n.titulo} className="w-24 h-20 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-base text-foreground group-hover:text-primary transition-colors mb-1.5 line-clamp-2">
                        {n.titulo}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{n.resumo}</p>
                      {n.created_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(n.created_at)}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-2 group-hover:gap-2 transition-all">
                        Ler mais <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </article>
          </Link>
        ))}
        {config.noticias.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma notícia publicada.</p>
        )}
      </div>
    </div>
  );
};

export default NewsSection;
