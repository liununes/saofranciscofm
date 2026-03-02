import { useState } from 'react';
import { useRadio } from '@/contexts/RadioContext';
import { Newspaper, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface NoticiaModal {
  id: string;
  titulo: string;
  resumo: string;
  imagem?: string;
  conteudo?: string;
  created_at?: string;
  updated_at?: string;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR');
};

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
};

const NewsSection = () => {
  const { config } = useRadio();
  const [selected, setSelected] = useState<NoticiaModal | null>(null);

  const openNoticia = async (n: any) => {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data } = await supabase.from('noticias').select('conteudo').eq('id', n.id).single();
    setSelected({ ...n, conteudo: data?.conteudo || n.resumo });
  };

  return (
    <>
      <div className="bg-card rounded-2xl shadow-card p-6">
        <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2 mb-5">
          <Newspaper className="w-5 h-5 text-secondary" />
          Notícias
        </h2>
        <div className="space-y-4">
          {config.noticias.map(n => (
            <article key={n.id} className="group cursor-pointer" onClick={() => openNoticia(n)}>
              <div className="p-4 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border">
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
                        Publicado em: {formatDate(n.created_at)}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-2 group-hover:gap-2 transition-all">
                      Ler mais <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
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
          <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
            {selected?.conteudo || selected?.resumo}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewsSection;
