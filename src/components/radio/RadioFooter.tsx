import { useRadio } from '@/contexts/RadioContext';
import { Radio, Eye } from 'lucide-react';
import PhoneContact from '@/components/radio/PhoneContact';

const RadioFooter = () => {
  const { config } = useRadio();
  const footerSponsors = config.patrocinadores.filter(p => p.posicao === 'rodape');

  return (
    <footer className="gradient-primary py-8 mt-8">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Radio className="w-5 h-5 text-secondary" />
          <span className="font-display font-bold text-primary-foreground">{config.nome_radio}</span>
        </div>
        <p className="text-primary-foreground/60 text-sm">
          © {new Date().getFullYear()} {config.nome_radio}. Todos os direitos reservados.
        </p>

        {/* Contador de Acessos Público */}
        <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-primary-foreground/40 uppercase tracking-widest font-bold">
          <Eye className="w-3 h-3" />
          <span>Acessos: {config.total_visitas || '...'}</span>
        </div>

        <PhoneContact position="rodape" variant="footer" />

        {footerSponsors.length > 0 && (
          <div className="flex items-center justify-center gap-8 mt-6 flex-wrap">
            {footerSponsors.map(p => (
              <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                {p.imagem ? (
                  <img src={p.imagem} alt={p.nome} className={`object-contain ${p.tipo === 'premium' ? 'h-10' : 'h-7'}`} />
                ) : (
                  <span className="text-primary-foreground/60 text-sm">{p.nome}</span>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
};

export default RadioFooter;
