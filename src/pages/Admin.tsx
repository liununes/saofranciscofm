import { useState } from 'react';
import { useRadio, Musica, Noticia, Patrocinador } from '@/contexts/RadioContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Radio, Music, Newspaper, Image, Users, MessageCircle, Palette, Trash2, Plus, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const AdminPanel = () => {
  const { config, updateConfig } = useRadio();
  const [localConfig, setLocalConfig] = useState(config);

  const update = (key: string, value: any) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const save = () => {
    updateConfig(localConfig);
    toast.success('Configurações salvas com sucesso!');
  };

  const addMusica = () => {
    const m: Musica = { id: Date.now().toString(), titulo: '', artista: '', hora_execucao: '' };
    update('musicas_recentes', [...localConfig.musicas_recentes, m]);
  };

  const removeMusica = (id: string) => {
    update('musicas_recentes', localConfig.musicas_recentes.filter(m => m.id !== id));
  };

  const updateMusica = (id: string, field: keyof Musica, value: string) => {
    update('musicas_recentes', localConfig.musicas_recentes.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const addNoticia = () => {
    const n: Noticia = { id: Date.now().toString(), titulo: '', resumo: '', link_completo: '' };
    update('noticias', [...localConfig.noticias, n]);
  };

  const removeNoticia = (id: string) => {
    update('noticias', localConfig.noticias.filter(n => n.id !== id));
  };

  const updateNoticia = (id: string, field: keyof Noticia, value: string) => {
    update('noticias', localConfig.noticias.map(n =>
      n.id === id ? { ...n, [field]: value } : n
    ));
  };

  const addPatrocinador = () => {
    const p: Patrocinador = { id: Date.now().toString(), nome: '', imagem: '', link: '' };
    update('patrocinadores', [...localConfig.patrocinadores, p]);
  };

  const removePatrocinador = (id: string) => {
    update('patrocinadores', localConfig.patrocinadores.filter(p => p.id !== id));
  };

  const updatePatrocinador = (id: string, field: keyof Patrocinador, value: string) => {
    update('patrocinadores', localConfig.patrocinadores.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Admin Header */}
      <header className="gradient-primary sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display font-bold text-lg text-primary-foreground">Painel Administrativo</h1>
          </div>
          <Button onClick={save} className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto bg-card p-1.5 rounded-xl shadow-card">
            <TabsTrigger value="geral" className="gap-1.5 text-xs"><Radio className="w-3.5 h-3.5" /> Geral</TabsTrigger>
            <TabsTrigger value="programa" className="gap-1.5 text-xs"><Radio className="w-3.5 h-3.5" /> Programa</TabsTrigger>
            <TabsTrigger value="musicas" className="gap-1.5 text-xs"><Music className="w-3.5 h-3.5" /> Músicas</TabsTrigger>
            <TabsTrigger value="noticias" className="gap-1.5 text-xs"><Newspaper className="w-3.5 h-3.5" /> Notícias</TabsTrigger>
            <TabsTrigger value="patrocinadores" className="gap-1.5 text-xs"><Users className="w-3.5 h-3.5" /> Patrocinadores</TabsTrigger>
            <TabsTrigger value="slides" className="gap-1.5 text-xs"><Image className="w-3.5 h-3.5" /> Slides</TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-1.5 text-xs"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</TabsTrigger>
            <TabsTrigger value="aparencia" className="gap-1.5 text-xs"><Palette className="w-3.5 h-3.5" /> Aparência</TabsTrigger>
          </TabsList>

          {/* Geral */}
          <TabsContent value="geral">
            <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
              <h2 className="font-display font-bold text-foreground">Configurações Gerais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Nome da Rádio</Label><Input value={localConfig.nome_radio} onChange={e => update('nome_radio', e.target.value)} /></div>
                <div><Label>URL do Streaming</Label><Input value={localConfig.streaming_url} onChange={e => update('streaming_url', e.target.value)} placeholder="https://stream.example.com" /></div>
                <div><Label>Logo Principal (URL)</Label><Input value={localConfig.logo_principal} onChange={e => update('logo_principal', e.target.value)} placeholder="URL da logo" /></div>
                <div><Label>Logo Extra (URL)</Label><Input value={localConfig.logo_extra} onChange={e => update('logo_extra', e.target.value)} placeholder="URL da logo extra" /></div>
                <div>
                  <Label>Posição do Player</Label>
                  <Select value={localConfig.player_posicao} onValueChange={v => update('player_posicao', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Esquerda</SelectItem>
                      <SelectItem value="center">Centro</SelectItem>
                      <SelectItem value="right">Direita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Programa */}
          <TabsContent value="programa">
            <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
              <h2 className="font-display font-bold text-foreground">Programa Ao Vivo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Locutor Ao Vivo</Label><Input value={localConfig.locutor_ao_vivo} onChange={e => update('locutor_ao_vivo', e.target.value)} /></div>
                <div><Label>Programa Ao Vivo</Label><Input value={localConfig.programa_ao_vivo} onChange={e => update('programa_ao_vivo', e.target.value)} /></div>
                <div><Label>Horário Início</Label><Input type="time" value={localConfig.horario_inicio} onChange={e => update('horario_inicio', e.target.value)} /></div>
                <div><Label>Horário Fim</Label><Input type="time" value={localConfig.horario_fim} onChange={e => update('horario_fim', e.target.value)} /></div>
                <div className="md:col-span-2"><Label>Música Atual</Label><Input value={localConfig.musica_atual} onChange={e => update('musica_atual', e.target.value)} /></div>
              </div>
            </div>
          </TabsContent>

          {/* Músicas */}
          <TabsContent value="musicas">
            <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-foreground">Últimas Músicas Tocadas</h2>
                <Button onClick={addMusica} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
              </div>
              <div className="space-y-3">
                {localConfig.musicas_recentes.map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input placeholder="Título" value={m.titulo} onChange={e => updateMusica(m.id, 'titulo', e.target.value)} />
                      <Input placeholder="Artista" value={m.artista} onChange={e => updateMusica(m.id, 'artista', e.target.value)} />
                      <Input type="time" value={m.hora_execucao} onChange={e => updateMusica(m.id, 'hora_execucao', e.target.value)} />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeMusica(m.id)} className="text-destructive flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Notícias */}
          <TabsContent value="noticias">
            <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-foreground">Notícias</h2>
                <Button onClick={addNoticia} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
              </div>
              <div className="space-y-4">
                {localConfig.noticias.map(n => (
                  <div key={n.id} className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <Input placeholder="Título" value={n.titulo} onChange={e => updateNoticia(n.id, 'titulo', e.target.value)} />
                        <Textarea placeholder="Resumo" value={n.resumo} onChange={e => updateNoticia(n.id, 'resumo', e.target.value)} rows={2} />
                        <Input placeholder="Link completo" value={n.link_completo} onChange={e => updateNoticia(n.id, 'link_completo', e.target.value)} />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeNoticia(n.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Patrocinadores */}
          <TabsContent value="patrocinadores">
            <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-foreground">Patrocinadores</h2>
                <Button onClick={addPatrocinador} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
              </div>
              <div className="space-y-3">
                {localConfig.patrocinadores.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input placeholder="Nome" value={p.nome} onChange={e => updatePatrocinador(p.id, 'nome', e.target.value)} />
                      <Input placeholder="URL da imagem" value={p.imagem} onChange={e => updatePatrocinador(p.id, 'imagem', e.target.value)} />
                      <Input placeholder="Link" value={p.link} onChange={e => updatePatrocinador(p.id, 'link', e.target.value)} />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removePatrocinador(p.id)} className="text-destructive flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Slides */}
          <TabsContent value="slides">
            <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-foreground">Slides de Imagem</h2>
                <Button onClick={() => {
                  const s = { id: Date.now().toString(), imagem: '', ordem: localConfig.slide_imagens.length };
                  update('slide_imagens', [...localConfig.slide_imagens, s]);
                }} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
              </div>
              <p className="text-sm text-muted-foreground">Deixe vazio para usar as imagens padrão.</p>
              <div className="space-y-3">
                {localConfig.slide_imagens.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <span className="text-sm font-bold text-muted-foreground w-6">{i + 1}</span>
                    <Input placeholder="URL da imagem" value={s.imagem} onChange={e => {
                      update('slide_imagens', localConfig.slide_imagens.map(si =>
                        si.id === s.id ? { ...si, imagem: e.target.value } : si
                      ));
                    }} className="flex-1" />
                    <Button variant="ghost" size="icon" onClick={() => {
                      update('slide_imagens', localConfig.slide_imagens.filter(si => si.id !== s.id));
                    }} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* WhatsApp */}
          <TabsContent value="whatsapp">
            <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
              <h2 className="font-display font-bold text-foreground">Pedidos via WhatsApp</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Número do WhatsApp</Label><Input value={localConfig.whatsapp_numero} onChange={e => update('whatsapp_numero', e.target.value)} placeholder="553335112000" /></div>
                <div><Label>Mensagem Padrão</Label><Input value={localConfig.whatsapp_mensagem} onChange={e => update('whatsapp_mensagem', e.target.value)} /></div>
              </div>
            </div>
          </TabsContent>

          {/* Aparência */}
          <TabsContent value="aparencia">
            <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
              <h2 className="font-display font-bold text-foreground">Personalização</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Cor Primária</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={localConfig.cor_primaria} onChange={e => update('cor_primaria', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                    <Input value={localConfig.cor_primaria} onChange={e => update('cor_primaria', e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Cor Secundária</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={localConfig.cor_secundaria} onChange={e => update('cor_secundaria', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                    <Input value={localConfig.cor_secundaria} onChange={e => update('cor_secundaria', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
