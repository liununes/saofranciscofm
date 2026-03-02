import { useRadio } from '@/contexts/RadioContext';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const { config } = useRadio();

  const whatsappUrl = `https://wa.me/${config.whatsapp_numero}?text=${encodeURIComponent(config.whatsapp_mensagem)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[hsl(142,70%,40%)] hover:bg-[hsl(142,70%,35%)] text-[hsl(0,0%,100%)] px-5 py-3 rounded-full shadow-elevated hover:scale-105 transition-all font-display font-semibold text-sm"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="hidden sm:inline">Peça sua música!</span>
    </a>
  );
};

export default WhatsAppButton;
