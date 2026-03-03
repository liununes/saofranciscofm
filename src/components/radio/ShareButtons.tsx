import { Facebook, MessageCircle, Twitter, Link2, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonsProps {
  url: string;
  title: string;
}

const ShareButtons = ({ url, title }: ShareButtonsProps) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copiado!');
  };

  const buttons = [
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      bg: 'bg-[hsl(142,70%,40%)]',
    },
    {
      label: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: 'bg-[hsl(220,46%,48%)]',
    },
    {
      label: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      bg: 'bg-[hsl(203,89%,53%)]',
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Share2 className="w-3.5 h-3.5" /> Compartilhar:
      </span>
      {buttons.map(btn => (
        <a
          key={btn.label}
          href={btn.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn.bg} text-[hsl(0,0%,100%)] px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity`}
        >
          <btn.icon className="w-3.5 h-3.5" />
          {btn.label}
        </a>
      ))}
      <button
        onClick={copyLink}
        className="bg-muted text-foreground px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 hover:bg-muted/80 transition-colors"
      >
        <Link2 className="w-3.5 h-3.5" />
        Copiar
      </button>
    </div>
  );
};

export default ShareButtons;
