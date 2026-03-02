import { Phone } from 'lucide-react';
import { useRadio } from '@/contexts/RadioContext';

interface PhoneContactProps {
  position: string;
  variant?: 'bar' | 'block' | 'inline' | 'header' | 'footer';
  className?: string;
}

const PhoneContact = ({ position, variant = 'bar', className = '' }: PhoneContactProps) => {
  const { config } = useRadio();

  if (!config.visibilidade_telefone || !config.telefone_contato || config.telefone_posicao !== position) return null;

  // Use custom link if provided, otherwise fallback to tel: with digits
  const href = config.telefone_link || `tel:${config.telefone_contato.replace(/\D/g, '')}`;
  const isExternal = href.startsWith('http');

  const linkProps = {
    href,
    ...(isExternal ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {}),
  };

  if (variant === 'header') {
    return (
      <a {...linkProps} className={`flex items-center gap-1.5 text-primary-foreground/80 hover:text-primary-foreground transition-colors ${className}`}>
        <Phone className="w-4 h-4" />
        <span className="font-semibold text-sm">{config.telefone_contato}</span>
      </a>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`flex items-center justify-center gap-2 mt-4 ${className}`}>
        <Phone className="w-4 h-4 text-secondary" />
        <a {...linkProps} className="text-primary-foreground font-semibold hover:text-secondary transition-colors">
          {config.telefone_contato}
        </a>
      </div>
    );
  }

  if (variant === 'bar') {
    return (
      <div className={`bg-primary/5 border-b border-primary/10 ${className}`}>
        <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm">
          <Phone className="w-4 h-4 text-primary" />
          <span className="font-medium">Contato:</span>
          <a {...linkProps} className="text-primary font-semibold hover:underline">
            {config.telefone_contato}
          </a>
        </div>
      </div>
    );
  }

  if (variant === 'block') {
    const alignClass = position === 'meio-esquerda' ? 'justify-start' : position === 'meio-direita' ? 'justify-end' : 'justify-center';
    return (
      <div className={`flex items-center ${alignClass} gap-3 py-4 px-6 bg-primary/5 rounded-xl border border-primary/10 ${className}`}>
        <Phone className="w-6 h-6 text-primary" />
        <span className="font-medium text-lg">Contato:</span>
        <a {...linkProps} className="text-primary font-bold text-xl hover:underline">
          {config.telefone_contato}
        </a>
      </div>
    );
  }

  return null;
};

export default PhoneContact;
