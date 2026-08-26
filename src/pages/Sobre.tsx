import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RadioHeader from '@/components/radio/RadioHeader';
import RadioFooter from '@/components/radio/RadioFooter';
import WhatsAppButton from '@/components/radio/WhatsAppButton';

const Sobre = () => {
  const [pagina, setPagina] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabaseAdmin.from('paginas').select('*').eq('slug', 'sobre').single();
      setPagina(data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background">
      <RadioHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        {pagina?.imagem_url && (
          <img src={pagina.imagem_url} alt={pagina.titulo} className="w-full h-64 object-cover rounded-xl mb-6" />
        )}
        <h1 className="font-display font-bold text-2xl text-foreground mb-4">{pagina?.titulo || 'Sobre'}</h1>
        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
          {pagina?.conteudo || ''}
        </div>
      </main>
      <RadioFooter />
      <WhatsAppButton />
    </div>
  );
};

export default Sobre;
