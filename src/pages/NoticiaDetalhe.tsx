import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import RadioHeader from '@/components/radio/RadioHeader';
import RadioFooter from '@/components/radio/RadioFooter';
import WhatsAppButton from '@/components/radio/WhatsAppButton';
import ShareButtons from '@/components/radio/ShareButtons';
import InlineAd from '@/components/radio/InlineAd';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

const NoticiaDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const [noticia, setNoticia] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const { data } = await supabase.from('noticias').select('*').eq('id', id).single();
      setNoticia(data);
      setLoading(false);
    };
    fetchData();
  }, [id]);


  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background">Carregando...</div>;
  if (!noticia) return <div className="min-h-screen flex items-center justify-center bg-background">Notícia não encontrada.</div>;

  const shareUrl = window.location.href;

  const urlParams = new URLSearchParams(window.location.search);
  const showAdsDebug = urlParams.get('ads_debug') === '1';

  // Prepare and split content, then inject sponsor block in the middle
  const renderContent = () => {
    const text = noticia.conteudo || noticia.resumo || '';
    return (
      <div className="space-y-3">
        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
          {text}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <RadioHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        {noticia.imagem_url && (
          <img src={noticia.imagem_url} alt={noticia.titulo} className="w-full h-64 object-cover rounded-xl mb-6" />
        )}

        <h1 className="font-display font-bold text-2xl text-foreground mb-3">{noticia.titulo}</h1>

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
          {noticia.created_at && <span>Publicado em: {formatDate(noticia.created_at)}</span>}
          {noticia.updated_at && noticia.updated_at !== noticia.created_at && (
            <span>Atualizado em: {formatDate(noticia.updated_at)}</span>
          )}
        </div>

        {/* Share buttons */}
        <div className="mb-6">
          <ShareButtons url={shareUrl} title={noticia.titulo} />
        </div>

        {noticia.resumo && <p className="text-muted-foreground mb-6 text-lg">{noticia.resumo}</p>}


        {renderContent()}

        {/* External link */}
        {noticia.link_completo && (
          <div className="mt-8 p-4 bg-muted rounded-xl">
            <a
              href={noticia.link_completo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Acesse a matéria completa
            </a>
          </div>
        )}

        {/* Share buttons bottom */}
        <div className="mt-8 pt-6 border-t border-border">
          <ShareButtons url={shareUrl} title={noticia.titulo} />
        </div>
      </main>
      <RadioFooter />
      <WhatsAppButton />
    </div>
  );
};

export default NoticiaDetalhe;
