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
  const [patrocinador, setPatrocinador] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const { data } = await supabase.from('noticias').select('*').eq('id', id).single();
      setNoticia(data);

      // Debug logs to help identify why an assigned ad might not appear
      console.debug('Noticia fetch:', { id, publicidade_id: data?.publicidade_id, publicidade_ativa: data?.publicidade_ativa });

      if (data?.publicidade_id && data?.publicidade_ativa) {
        const { data: pub } = await supabase.from('publicidade_noticias').select('*').eq('id', data.publicidade_id).single();
        console.debug('Publicidade fetch for noticia:', { pub });
        if (pub?.ativo) {
          const hoje = new Date().toISOString().slice(0, 10);
          const dentroDoPerido = (!pub.data_inicio || pub.data_inicio <= hoje) && (!pub.data_fim || pub.data_fim >= hoje);
          if (dentroDoPerido) setPatrocinador(pub);
        }
      }
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
    // try split by blank line first, fallback to single-line split later
    let paragraphs = text.split(/\n\s*\n/).filter((p: string) => p.trim());

    if (!patrocinador) {
      return (
        <div className="space-y-3">
          {/* If the article expects an ad but none was loaded, show a small diagnostic placeholder */}
          {noticia?.publicidade_ativa && noticia?.publicidade_id && !patrocinador ? (
            <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded text-sm">
              Publicidade ativa nesta matéria, mas nenhum anúncio disponível no momento. Verifique em Administração → Publicidade Notícias se a publicidade selecionada está ativa e dentro do período configurado.
            </div>
          ) : null}

          <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
            {text}
          </div>
        </div>
      );
    }

    // If there are multiple paragraphs, insert between them.
    // For single-paragraph articles, split the text in the middle (by nearest space) to ensure the ad divides the content.
    let before = '';
    let after = '';

    if (paragraphs.length >= 2) {
      const midpoint = Math.floor(paragraphs.length / 2);
      before = paragraphs.slice(0, midpoint).join('\n\n');
      after = paragraphs.slice(midpoint).join('\n\n');
    } else {
      const full = paragraphs[0] || text || '';
      const mid = Math.floor(full.length / 2);
      // find nearest space around midpoint
      const leftSpace = full.lastIndexOf(' ', mid);
      const rightSpace = full.indexOf(' ', mid + 1);
      let splitAt = -1;
      if (leftSpace > 50) splitAt = leftSpace; // prefer a reasonable left break
      else if (rightSpace !== -1) splitAt = rightSpace;
      else splitAt = mid;

      before = full.slice(0, splitAt).trim();
      after = full.slice(splitAt).trim();
    }

    return (
      <div className="space-y-4">
        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">{before}</div>

        {/* Ad block (full-width, similar to design screenshot) */}
        <div className="my-6 p-6 bg-muted/60 rounded-xl border border-border text-center w-full">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Publicidade</p>
          <InlineAd patrocinador={patrocinador} />
        </div>

        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">{after}</div>
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
        {showAdsDebug ? (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-800 rounded text-sm">
            <div className="font-semibold mb-1">ADS DEBUG</div>
            <div className="text-xs">publicidade_ativa: {String(noticia.publicidade_ativa)}</div>
            <div className="text-xs">publicidade_id: {String(noticia.publicidade_id)}</div>
            <div className="text-xs">patrocinador loaded: {patrocinador ? 'yes' : 'no'}</div>
            <details className="text-xs mt-2"><summary>patrocinador object</summary><pre className="text-xs">{JSON.stringify(patrocinador, null, 2)}</pre></details>
          </div>
        ) : null}

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
