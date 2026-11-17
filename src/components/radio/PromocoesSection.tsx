import { useMemo } from 'react';
import { Ticket, ExternalLink } from 'lucide-react';
import { useRadio } from '@/contexts/RadioContext';

const parseLocalDate = (value?: string) => {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatLocalDate = (value?: string) => {
  const date = parseLocalDate(value);
  return date ? date.toLocaleDateString('pt-BR') : '';
};

const PromocoesSection = () => {
  const { config } = useRadio();

  const promocoesAtivas = useMemo(() => {
    const agora = new Date();
    const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;

    return (config.promocoes || []).filter((p: any) => {
      if (!p.ativo) return false;
      if (p.data_inicio && p.data_inicio > hoje) return false;
      const fim = p.prorrogada_ate || p.data_validade;
      if (fim && fim < hoje) return false;
      return true;
    });
  }, [config.promocoes]);

  if (promocoesAtivas.length === 0) return null;

  return (
    <section className="radio-section radio-promotions bg-card rounded-2xl shadow-card p-6">
      <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2 mb-5">
        <Ticket className="w-5 h-5 text-primary" />
        Promoções
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promocoesAtivas.map((p: any) => (
          <article key={p.id} className="radio-promo border border-border rounded-xl p-4 bg-background/60 space-y-3">
            {p.imagem_url && (
              <img src={p.imagem_url} alt={p.nome || 'Promoção'} className="w-full h-40 object-cover rounded-lg" loading="lazy" />
            )}

            <div className="space-y-1">
              <h3 className="font-display font-semibold text-lg text-foreground">{p.nome}</h3>
              {p.texto && <p className="text-sm text-foreground">{p.texto}</p>}
              {p.descricao && <p className="text-sm text-muted-foreground">{p.descricao}</p>}
            </div>

            <div className="text-xs text-muted-foreground">
              {p.prorrogada_ate ? (
                <span>🔁 Prorrogada até {formatLocalDate(p.prorrogada_ate)}</span>
              ) : p.data_validade ? (
                <span>Válida até {formatLocalDate(p.data_validade)}</span>
              ) : (
                <span>Sem prazo de validade</span>
              )}
            </div>

            {p.link && (
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Ver promoção
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default PromocoesSection;
