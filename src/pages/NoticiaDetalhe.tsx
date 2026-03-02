import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';
import RadioHeader from '@/components/radio/RadioHeader';
import RadioFooter from '@/components/radio/RadioFooter';
import WhatsAppButton from '@/components/radio/WhatsAppButton';

const NoticiaDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const [noticia, setNoticia] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const { data } = await supabase.from('noticias').select('*').eq('id', id).single();
      setNoticia(data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background">Carregando...</div>;
  if (!noticia) return <div className="min-h-screen flex items-center justify-center bg-background">Notícia não encontrada.</div>;

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
        {noticia.resumo && <p className="text-muted-foreground mb-6">{noticia.resumo}</p>}
        {noticia.conteudo && (
          <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
            {noticia.conteudo}
          </div>
        )}
      </main>
      <RadioFooter />
      <WhatsAppButton />
    </div>
  );
};

export default NoticiaDetalhe;
