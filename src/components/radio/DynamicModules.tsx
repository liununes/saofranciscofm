import { useState, useEffect, useMemo } from 'react';
import { useRadio } from '@/contexts/RadioContext';
import { Newspaper, Clock, MessageCircle, Music, Send, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

// Module 1: Featured News
const FeaturedNewsModule = () => {
  const { config } = useRadio();
  const [selected, setSelected] = useState<any>(null);

  const destaque = useMemo(() => {
    return config.noticias.find((n: any) => n.destaque);
  }, [config.noticias]);

  if (!destaque) return null;

  const openNoticia = async () => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client');
    const { data } = await supabaseAdmin.from('noticias').select('conteudo').eq('id', destaque.id).single();
    setSelected({ ...destaque, conteudo: data?.conteudo || destaque.resumo });
  };

  return (
    <>
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        {destaque.imagem && (
          <img src={destaque.imagem} alt={destaque.titulo} className="w-full h-48 sm:h-56 object-cover" loading="lazy" />
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-secondary" />
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">Destaque</span>
          </div>
          <h3 className="font-display font-bold text-lg text-foreground mb-2 line-clamp-2">{destaque.titulo}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{destaque.resumo}</p>
          <Button onClick={openNoticia} variant="outline" size="sm" className="gap-1">
            <Newspaper className="w-3.5 h-3.5" /> Ler matéria completa
          </Button>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl leading-tight">{selected?.titulo}</DialogTitle>
          </DialogHeader>
          {selected?.imagem && (
            <img src={selected.imagem} alt={selected.titulo} className="w-full h-56 object-cover rounded-xl" />
          )}
          <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
            {selected?.conteudo || selected?.resumo}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Module 2: Next Program
const NextProgramModule = () => {
  const { config, currentPrograma } = useRadio();
  const [nextProgram, setNextProgram] = useState<any>(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const findNext = async () => {
      const { supabaseAdmin } = await import('@/integrations/supabase/client');
      const { data: progs } = await supabaseAdmin
        .from('programas')
        .select('*, locutores(*)')
        .eq('ativo', true);

      if (!progs || progs.length === 0) { setNextProgram(null); return; }

      const now = new Date();
      const dayOfWeek = now.getDay();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

      // Find next program today
      let next = progs
        .filter(p => p.dias_semana.includes(dayOfWeek) && p.horario_inicio > currentTime)
        .sort((a, b) => a.horario_inicio.localeCompare(b.horario_inicio))[0];

      // If none today, find first program tomorrow
      if (!next) {
        const tomorrow = (dayOfWeek + 1) % 7;
        next = progs
          .filter(p => p.dias_semana.includes(tomorrow))
          .sort((a, b) => a.horario_inicio.localeCompare(b.horario_inicio))[0];
      }

      setNextProgram(next || null);
    };

    findNext();
    const interval = setInterval(findNext, 60000);
    return () => clearInterval(interval);
  }, [currentPrograma]);

  // Countdown timer
  useEffect(() => {
    if (!nextProgram) return;

    const updateCountdown = () => {
      const now = new Date();
      const [h, m] = nextProgram.horario_inicio.split(':').map(Number);
      const target = new Date(now);
      target.setHours(h, m, 0, 0);

      // If target is in the past, it's tomorrow
      if (target <= now) target.setDate(target.getDate() + 1);

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) { setCountdown('Começando agora!'); return; }

      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextProgram]);

  if (!nextProgram) return null;

  const locutor = nextProgram.locutores;

  return (
    <div className="bg-card rounded-2xl shadow-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-secondary" />
        <span className="text-xs font-bold uppercase tracking-wider text-secondary">Próximo no Ar</span>
      </div>
      <div className="flex items-center gap-4">
        {locutor?.imagem_url && (
          <Dialog>
            <DialogTrigger asChild>
              <img
                src={locutor.imagem_url}
                alt={locutor.nome}
                className="w-16 h-16 rounded-full object-cover border-2 border-secondary flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                loading="lazy"
              />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-transparent border-none shadow-none">
              <DialogHeader className="sr-only">
                <DialogTitle>{locutor.nome}</DialogTitle>
              </DialogHeader>
              <div className="relative flex items-center justify-center">
                <img
                  src={locutor.imagem_url}
                  alt={locutor.nome}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                />
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="bg-black/60 text-white px-4 py-2 rounded-full backdrop-blur-sm font-display font-medium">
                  {locutor.nome}
                </span>
              </div>
            </DialogContent>
          </Dialog>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-base text-foreground truncate">{nextProgram.nome}</h3>
          {locutor && <p className="text-sm text-muted-foreground truncate">{locutor.nome}</p>}
          <p className="text-xs text-muted-foreground">
            {nextProgram.horario_inicio.substring(0, 5)} - {nextProgram.horario_fim.substring(0, 5)}
          </p>
        </div>
      </div>
      {countdown && (
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Começa em</p>
          <p className="font-display font-bold text-2xl text-primary tabular-nums">{countdown}</p>
        </div>
      )}
      <div className="mt-4">
        <Link to="/programacao">
          <Button variant="outline" size="sm" className="w-full gap-1">
            <Clock className="w-3.5 h-3.5" /> Ver programação
          </Button>
        </Link>
      </div>
    </div>
  );
};

// Module 3: Listener Participation
const ListenerParticipationModule = () => {
  const { config } = useRadio();
  const [showMusicForm, setShowMusicForm] = useState(false);
  const [formData, setFormData] = useState({ nome: '', artista: '', musica: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.musica) {
      toast.error('Preencha seu nome e a música desejada.');
      return;
    }
    setSending(true);
    try {
      const subject = encodeURIComponent('Pedido Musical - São Francisco FM');
      const body = encodeURIComponent(
        `Nome: ${formData.nome}\nArtista: ${formData.artista}\nMúsica: ${formData.musica}`
      );
      window.open(`mailto:saofranciscofm1063@gmail.com?subject=${subject}&body=${body}`, '_blank');
      toast.success('Abrindo seu e-mail para enviar o pedido!');
      setFormData({ nome: '', artista: '', musica: '' });
      setShowMusicForm(false);
    } catch {
      toast.error('Erro ao abrir o e-mail.');
    } finally {
      setSending(false);
    }
  };

  const whatsappLink = `https://wa.me/55${config.whatsapp_numero?.replace(/\D/g, '')}?text=${encodeURIComponent(config.whatsapp_mensagem || 'Olá!')}`;

  return (
    <>
      <div className="bg-card rounded-2xl shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-4 h-4 text-secondary" />
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">Participe!</span>
        </div>
        <div className="space-y-3">
          <Button onClick={() => setShowMusicForm(true)} className="w-full gap-2 gradient-secondary text-secondary-foreground">
            <Music className="w-4 h-4" /> Pedir Música
          </Button>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full gap-2 mt-2">
              <MessageCircle className="w-4 h-4" /> Mandar mensagem no WhatsApp
            </Button>
          </a>
        </div>
      </div>

      <Dialog open={showMusicForm} onOpenChange={setShowMusicForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Music className="w-5 h-5 text-secondary" /> Pedir Música
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Seu Nome *</Label>
              <Input value={formData.nome} onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value }))} placeholder="Seu nome" required />
            </div>
            <div>
              <Label>Artista</Label>
              <Input value={formData.artista} onChange={e => setFormData(prev => ({ ...prev, artista: e.target.value }))} placeholder="Nome do artista" />
            </div>
            <div>
              <Label>Música *</Label>
              <Input value={formData.musica} onChange={e => setFormData(prev => ({ ...prev, musica: e.target.value }))} placeholder="Nome da música" required />
            </div>
            <Button type="submit" disabled={sending} className="w-full gap-2">
              <Send className="w-4 h-4" /> {sending ? 'Enviando...' : 'Enviar Pedido'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Module 4: Premium Sponsors
const PremiumSponsorModule = () => {
  const { config } = useRadio();

  const premiumSponsors = config.patrocinadores.filter(p => p.tipo === 'premium');

  if (premiumSponsors.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl shadow-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-4 h-4 text-secondary" />
        <span className="text-xs font-bold uppercase tracking-wider text-secondary">Patrocinadores</span>
      </div>
      <div className="flex items-center justify-center gap-6 flex-wrap">
        {premiumSponsors.map(p => (
          <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            {p.imagem ? (
              <img src={p.imagem} alt={p.nome} className="h-20 max-w-[240px] object-contain" loading="lazy" />
            ) : (
              <span className="text-sm text-muted-foreground font-medium">{p.nome}</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
};

// Main container
const DynamicModules = () => {
  const { config } = useRadio();

  const showDestaque = (config as any).visibilidade_destaque !== false;
  const showProximo = (config as any).visibilidade_proximo_programa !== false;
  const showParticipacao = (config as any).visibilidade_participacao !== false;
  const showPremium = (config as any).visibilidade_premium !== false;

  const hasAny = showDestaque || showProximo || showParticipacao || showPremium;
  if (!hasAny) return null;

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Premium first when active */}
        {showPremium && <PremiumSponsorModule />}
        {showDestaque && <FeaturedNewsModule />}
        {showProximo && <NextProgramModule />}
        {showParticipacao && <ListenerParticipationModule />}
      </div>
    </section>
  );
};

export default DynamicModules;
