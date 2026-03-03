import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Globe, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

interface ExtractedData {
  titulo: string;
  resumo: string;
  conteudo: string;
  imagem: string;
  fonte: string;
  data_publicacao: string;
  url: string;
}

interface Props {
  onNoticiaAdded: () => void;
  existingUrls: string[];
}

const AddNoticiaByUrl = ({ onNoticiaAdded, existingUrls }: Props) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [editData, setEditData] = useState({ titulo: '', resumo: '', conteudo: '', imagem: '', fonte: '', link: '' });

  const handleExtract = async () => {
    if (!url.trim()) { toast.error('Cole uma URL válida.'); return; }

    if (existingUrls.includes(url.trim())) {
      toast.error('Essa URL já foi adicionada anteriormente.');
      return;
    }

    setLoading(true);
    setExtracted(null);

    try {
      const { data, error } = await supabase.functions.invoke('extract-url-meta', {
        body: { url: url.trim() },
      });

      if (error) throw error;
      if (data?.error) { toast.error(data.error); setLoading(false); return; }

      setExtracted(data);
      setEditData({
        titulo: data.titulo || '',
        resumo: data.resumo || '',
        conteudo: data.conteudo || '',
        imagem: data.imagem || '',
        fonte: data.fonte || '',
        link: data.url || url.trim(),
      });
    } catch (e) {
      console.error('Extraction error:', e);
      toast.error('Falha ao extrair dados da URL. Tente novamente ou preencha manualmente.');
      setExtracted({ titulo: '', resumo: '', conteudo: '', imagem: '', fonte: '', data_publicacao: '', url: url.trim() });
      setEditData({ titulo: '', resumo: '', conteudo: '', imagem: '', fonte: '', link: url.trim() });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editData.titulo.trim()) { toast.error('O título é obrigatório.'); return; }

    let conteudo = editData.conteudo || editData.resumo;
    if (editData.fonte) {
      conteudo += `\n\n— Fonte: ${editData.fonte}`;
    }

    const { error } = await supabase.from('noticias').insert({
      titulo: editData.titulo.trim(),
      resumo: editData.resumo.trim(),
      conteudo,
      link_completo: editData.link,
      imagem_url: editData.imagem || null,
    });

    if (error) { toast.error('Erro ao salvar notícia.'); return; }

    toast.success('Notícia adicionada com sucesso!');
    setOpen(false);
    setUrl('');
    setExtracted(null);
    setEditData({ titulo: '', resumo: '', conteudo: '', imagem: '', fonte: '', link: '' });
    onNoticiaAdded();
  };

  return (
    <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) { setExtracted(null); setUrl(''); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Globe className="w-4 h-4" /> Adicionar por URL
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Adicionar Notícia por URL</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>URL da Notícia</Label>
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://exemplo.com/noticia..."
                disabled={loading}
              />
              <Button onClick={handleExtract} disabled={loading || !url.trim()} size="sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Extrair'}
              </Button>
            </div>
          </div>

          {extracted && (
            <div className="space-y-3 border-t pt-4">
              <p className="text-xs text-muted-foreground">Revise e edite os campos antes de publicar. O texto completo foi extraído — delete o que não quiser.</p>

              <div>
                <Label>Título</Label>
                <Input value={editData.titulo} onChange={e => setEditData(d => ({ ...d, titulo: e.target.value }))} />
              </div>

              <div>
                <Label>Resumo (exibido no card)</Label>
                <Textarea value={editData.resumo} onChange={e => setEditData(d => ({ ...d, resumo: e.target.value }))} rows={3} />
              </div>

              <div>
                <Label>Conteúdo completo da matéria</Label>
                <Textarea value={editData.conteudo} onChange={e => setEditData(d => ({ ...d, conteudo: e.target.value }))} rows={12} />
                <p className="text-[10px] text-muted-foreground mt-1">Edite livremente: remova trechos indesejados, corrija formatação. Separe parágrafos com linhas em branco.</p>
              </div>

              <div>
                <Label>Imagem</Label>
                {editData.imagem && (
                  <img src={editData.imagem} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2" />
                )}
                <ImageUpload value={editData.imagem} onChange={img => setEditData(d => ({ ...d, imagem: img }))} folder="noticias" />
                <p className="text-[10px] text-muted-foreground mt-1">Ou mantenha a imagem extraída automaticamente</p>
              </div>

              <div>
                <Label>Fonte</Label>
                <Input value={editData.fonte} onChange={e => setEditData(d => ({ ...d, fonte: e.target.value }))} />
              </div>

              <div>
                <Label>Link Original (aparece como "Acesse a matéria completa")</Label>
                <div className="flex items-center gap-2">
                  <Input value={editData.link} onChange={e => setEditData(d => ({ ...d, link: e.target.value }))} />
                  {editData.link && (
                    <a href={editData.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              <Button onClick={handleSave} className="w-full gap-1">
                Publicar Notícia
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddNoticiaByUrl;
