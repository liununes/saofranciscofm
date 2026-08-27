import { useRadio } from '@/contexts/RadioContext';
import RadioHeader from '@/components/radio/RadioHeader';
import RadioFooter from '@/components/radio/RadioFooter';
import WhatsAppButton from '@/components/radio/WhatsAppButton';
import { Clock, Mic, Radio } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const Programacao = () => {
  const { programas, currentPrograma } = useRadio();

  return (
    <div className="min-h-screen bg-background">
      <RadioHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Radio className="w-8 h-8 text-primary" />
          <h1 className="font-display font-bold text-2xl text-foreground">Programação</h1>
        </div>

        {programas.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Nenhum programa cadastrado.</p>
        ) : (
          <div className="grid gap-4">
            {programas.map(prog => {
              const isCurrent = currentPrograma?.id === prog.id;
              return (
                <div
                  key={prog.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isCurrent
                    ? 'bg-primary/10 border-primary shadow-md'
                    : 'bg-card border-border hover:shadow-card'
                    }`}
                >
                  {prog.locutor?.imagem_url ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <img
                          src={prog.locutor.imagem_url}
                          alt={prog.locutor.nome}
                          className="w-14 h-14 rounded-full object-cover border-2 border-secondary cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-transparent border-none shadow-none">
                        <DialogHeader className="sr-only">
                          <DialogTitle>{prog.locutor.nome}</DialogTitle>
                        </DialogHeader>
                        <div className="relative flex items-center justify-center">
                          <img
                            src={prog.locutor.imagem_url}
                            alt={prog.locutor.nome}
                            className="max-w-full max-h-[80vh] object-contain rounded-lg"
                          />
                        </div>
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                          <span className="bg-black/60 text-white px-4 py-2 rounded-full backdrop-blur-sm font-display font-medium">
                            {prog.locutor.nome}
                          </span>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                      <Mic className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-foreground truncate">{prog.nome}</h3>
                      {isCurrent && (
                        <span className="text-[10px] font-bold uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded-full animate-pulse">
                          AO VIVO
                        </span>
                      )}
                    </div>
                    {prog.locutor && (
                      <p className="text-sm text-muted-foreground">{prog.locutor.nome}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {prog.horario_inicio.substring(0, 5)} – {prog.horario_fim.substring(0, 5)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {prog.dias_semana.map(d => DIAS_SEMANA[d]).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <RadioFooter />
      <WhatsAppButton />
    </div>
  );
};

export default Programacao;
