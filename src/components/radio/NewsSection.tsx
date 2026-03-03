import { useState } from 'react';
import { useRadio } from '@/contexts/RadioContext';
import { Newspaper, ArrowRight, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import ShareButtons from '@/components/radio/ShareButtons';

interface NoticiaModal {
  id: string;
  titulo: string;
  resumo: string;
  imagem?: string;
  conteudo?: string;
  created_at?: string;
  updated_at?: string;
  link_completo?: string;
  patrocinador_id?: string;
  patrocinador_ativo?: boolean;
  patrocinador?: any;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
};

const NewsSection = () => {
  const { config } = useRadio();
  const [selected, setSelected] = useState<NoticiaModal | null>(null);
  const posicao = config.noticias_posicao || 'centro';
  const hasOtherBlocks = config.visibilidade_musicas;
  const isHorizontalGrid = posicao === 'centro' && !hasOtherBlocks;

  const openNoticia = async (n: any) => {
    const { data } = await supabase.from('noticias').select('*').eq('id', n.id).single();
    let patrocinador = null;
    if (data?.patrocinador_id && data?.patrocinador_ativo) {
      const { data: pat } = await supabase.from('patrocinadores').select('*').eq('id', data.patrocinador_id).single();
      patrocinador = pat;
    }
    setSelected({
      ...n,
      conteudo: data?.conteudo || n.resumo,
      link_completo: data?.link_completo || n.link_completo,
      patrocinador_id: data?.patrocinador_id,
      patrocinador_ativo: data?.patrocinador_ativo,
      patrocinador,
    });
  };

  const renderModalContent = () => {
    if (!selected) return null;
    const text = selected.conteudo || selected.resumo || '';
    const paragraphs = text.split('\n\n').filter((p: string) => p.trim());
    const pat = selected.patrocinador;

    if (!pat || paragraphs.length < 3) {
      return <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">{text}</div>;
    }

    const midpoint = Math.floor(paragraphs.length / 2);
    const before = paragraphs.slice(0, midpoint).join('\n\n');
    const after = paragraphs.slice(midpoint).join('\n\n');

    return (
      <div className="space-y-4">
        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">{before}</div>
        <div className="my-6 p-4 bg-muted rounded-xl border border-border text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Publicidade</p>
          <a href={pat.link || '#'} target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity">
            {pat.imagem_url ? (
              <img src={pat.imagem_url} alt={pat.nome} className="max-h-20 mx-auto object-contain" />
            ) : (
              <span className="text-sm font-medium text-foreground">{pat.nome}</span>
            )}
          </a>
        </div>
        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">{after}</div>
      </div>
    );
  };

  const shareUrl = selected ? `${window.location.origin}/noticia/${selected.id}` : '';

  return (
    <>
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
            <article key={n.id} className="group cursor-pointer" onClick={() => openNoticia(n)}>
              <div className={`p-4 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border ${isHorizontalGrid ? 'flex flex-col h-full' : ''}`}>
                {isHorizontalGrid ? (
                  <>
                    {n.imagem && <img src={n.imagem} alt={n.titulo} className="w-full h-40 rounded-xl object-cover mb-3" />}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-base text-foreground group-hover:text-primary transition-colors mb-1.5 line-clamp-2">{n.titulo}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">{n.resumo}</p>
                      {n.created_at && <p className="text-xs text-muted-foreground mt-2">{formatDate(n.created_at)}</p>}
                      <span className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-2 group-hover:gap-2 transition-all">
                        Ler mais <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-4">
                    {n.imagem && <img src={n.imagem} alt={n.titulo} className="w-24 h-20 rounded-xl object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-base text-foreground group-hover:text-primary transition-colors mb-1.5 line-clamp-2">{n.titulo}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{n.resumo}</p>
                      {n.created_at && <p className="text-xs text-muted-foreground mt-1">{formatDate(n.created_at)}</p>}
                      <span className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-2 group-hover:gap-2 transition-all">
                        Ler mais <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
          {config.noticias.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma notícia publicada.</p>
          )}
        </div>
      </div>

      {/* Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl leading-tight">{selected?.titulo}</DialogTitle>
          </DialogHeader>
          {selected?.imagem && (
            <img src={selected.imagem} alt={selected.titulo} className="w-full h-56 object-cover rounded-xl" />
          )}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {selected?.created_at && <span>Publicado em: {formatDate(selected.created_at)}</span>}
            {selected?.updated_at && selected.updated_at !== selected.created_at && (
              <span>Atualizado em: {formatDateTime(selected.updated_at)}</span>
            )}
          </div>

          {selected && <ShareButtons url={shareUrl} title={selected.titulo} />}

          {renderModalContent()}

          {/* Link externo */}
          {selected?.link_completo && (
            <div className="mt-4 p-4 bg-muted rounded-xl">
              <a
                href={selected.link_completo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Acesse a matéria completa
              </a>
            </div>
          )}

          {selected && (
            <div className="mt-4 pt-4 border-t border-border">
              <ShareButtons url={shareUrl} title={selected.titulo} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewsSection;
