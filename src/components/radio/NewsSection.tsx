import { useRadio } from '@/contexts/RadioContext';
import { Newspaper, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewsSection = () => {
  const { config } = useRadio();

  return (
    <div className="bg-card rounded-xl shadow-card p-5">
      <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5 text-secondary" />
        Notícias
      </h2>
      <div className="space-y-4">
        {config.noticias.map(n => (
          <article key={n.id} className="group">
            <Link to={`/noticia/${n.id}`} className="block p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="flex gap-3">
                {n.imagem && (
                  <img src={n.imagem} alt={n.titulo} className="w-20 h-16 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-sm text-foreground group-hover:text-primary transition-colors mb-1">
                    {n.titulo}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.resumo}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-2">
                    Ler mais <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
};

export default NewsSection;
