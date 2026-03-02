import { useState, useEffect } from 'react';
import { useRadio } from '@/contexts/RadioContext';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Radio, Music, Newspaper, Image, Users, MessageCircle, Palette, Trash2, Plus, Save, Mic, CalendarClock, Shield, LogOut, Eye, EyeOff, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const PERMISSIONS = [
  { key: 'noticias', label: 'Notícias' },
  { key: 'locutores', label: 'Locutores' },
  { key: 'programas', label: 'Programas' },
  { key: 'musicas', label: 'Músicas' },
  { key: 'patrocinadores', label: 'Patrocinadores' },
  { key: 'slides', label: 'Slides' },
  { key: 'streaming', label: 'Streaming' },
  { key: 'aparencia', label: 'Aparência' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'geral', label: 'Geral' },
];

const AdminPanel = () => {
  const { refreshData } = useRadio();
  const { user, isAdmin, permissions, signOut, updatePassword } = useAuth();

  // Radio config state
  const [rc, setRc] = useState<any>({});
  const [locutores, setLocutores] = useState<any[]>([]);
  const [programas, setProgramas] = useState<any[]>([]);
  const [musicas, setMusicas] = useState<any[]>([]);
  const [noticias, setNoticias] = useState<any[]>([]);
  const [patrocinadores, setPatrocinadores] = useState<any[]>([]);
  const [slides, setSlides] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Users management
  const [users, setUsers] = useState<any[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const hasPermission = (perm: string) => isAdmin || permissions.includes(perm);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [rcRes, locRes, progRes, musRes, notRes, patRes, slidRes] = await Promise.all([
      supabase.from('radio_config').select('*').limit(1).single(),
      supabase.from('locutores').select('*').order('created_at'),
      supabase.from('programas').select('*, locutores(*)').order('horario_inicio'),
      supabase.from('musicas_recentes').select('*').order('created_at', { ascending: false }),
      supabase.from('noticias').select('*').order('created_at', { ascending: false }),
      supabase.from('patrocinadores').select('*').order('created_at'),
      supabase.from('slide_imagens').select('*').order('ordem'),
    ]);
    setRc(rcRes.data || {});
    setLocutores(locRes.data || []);
    setProgramas(progRes.data || []);
    setMusicas(musRes.data || []);
    setNoticias(notRes.data || []);
    setPatrocinadores(patRes.data || []);
    setSlides(slidRes.data || []);

    // Load users if admin
    if (isAdmin) {
      const { data: profiles } = await supabase.from('profiles').select('*');
      if (profiles) {
        const usersWithRoles = await Promise.all(profiles.map(async (p) => {
          const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', p.user_id);
          const { data: perms } = await supabase.from('user_permissions').select('permission').eq('user_id', p.user_id);
          return { ...p, roles: roles || [], permissions: perms?.map(pp => pp.permission) || [] };
        }));
        setUsers(usersWithRoles);
      }
    }
  };

  // ---- SAVE FUNCTIONS ----
  const saveConfig = async () => {
    setSaving(true);
    const { error } = await supabase.from('radio_config').update({
      nome_radio: rc.nome_radio,
      logo_principal: rc.logo_principal,
      logo_extra: rc.logo_extra,
      streaming_url: rc.streaming_url,
      player_posicao: rc.player_posicao,
      musica_atual: rc.musica_atual,
      whatsapp_numero: rc.whatsapp_numero,
      whatsapp_mensagem: rc.whatsapp_mensagem,
      cor_primaria: rc.cor_primaria,
      cor_secundaria: rc.cor_secundaria,
    }).eq('id', rc.id);
    setSaving(false);
    if (error) toast.error('Erro ao salvar.');
    else {
      toast.success('Salvo com sucesso!');
      refreshData();
    }
  };

  // Locutores CRUD
  const addLocutor = async () => {
    const { data, error } = await supabase.from('locutores').insert({ nome: 'Novo Locutor' }).select().single();
    if (!error && data) setLocutores([...locutores, data]);
  };

  const updateLocutor = async (id: string, updates: any) => {
    await supabase.from('locutores').update(updates).eq('id', id);
    setLocutores(locutores.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLocutor = async (id: string) => {
    await supabase.from('locutores').delete().eq('id', id);
    setLocutores(locutores.filter(l => l.id !== id));
  };

  // Programas CRUD
  const addPrograma = async () => {
    const { data, error } = await supabase.from('programas').insert({
      nome: 'Novo Programa',
      horario_inicio: '06:00',
      horario_fim: '10:00',
      dias_semana: [1, 2, 3, 4, 5],
    }).select('*, locutores(*)').single();
    if (!error && data) setProgramas([...programas, data]);
  };

  const updatePrograma = async (id: string, updates: any) => {
    await supabase.from('programas').update(updates).eq('id', id);
    setProgramas(programas.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePrograma = async (id: string) => {
    await supabase.from('programas').delete().eq('id', id);
    setProgramas(programas.filter(p => p.id !== id));
  };

  // Musicas CRUD
  const addMusica = async () => {
    const { data, error } = await supabase.from('musicas_recentes').insert({ titulo: '', artista: '', hora_execucao: '' }).select().single();
    if (!error && data) setMusicas([data, ...musicas]);
  };

  const updateMusica = async (id: string, updates: any) => {
    await supabase.from('musicas_recentes').update(updates).eq('id', id);
    setMusicas(musicas.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMusica = async (id: string) => {
    await supabase.from('musicas_recentes').delete().eq('id', id);
    setMusicas(musicas.filter(m => m.id !== id));
  };

  // Noticias CRUD
  const addNoticia = async () => {
    const { data, error } = await supabase.from('noticias').insert({ titulo: '', resumo: '', link_completo: '' }).select().single();
    if (!error && data) setNoticias([data, ...noticias]);
  };

  const updateNoticia = async (id: string, updates: any) => {
    await supabase.from('noticias').update(updates).eq('id', id);
    setNoticias(noticias.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const deleteNoticia = async (id: string) => {
    await supabase.from('noticias').delete().eq('id', id);
    setNoticias(noticias.filter(n => n.id !== id));
  };

  // Patrocinadores CRUD
  const addPatrocinador = async () => {
    const { data, error } = await supabase.from('patrocinadores').insert({ nome: '' }).select().single();
    if (!error && data) setPatrocinadores([...patrocinadores, data]);
  };

  const updatePatrocinador = async (id: string, updates: any) => {
    await supabase.from('patrocinadores').update(updates).eq('id', id);
    setPatrocinadores(patrocinadores.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePatrocinador = async (id: string) => {
    await supabase.from('patrocinadores').delete().eq('id', id);
    setPatrocinadores(patrocinadores.filter(p => p.id !== id));
  };

  // Slides CRUD
  const addSlide = async () => {
    const { data, error } = await supabase.from('slide_imagens').insert({ imagem_url: '', ordem: slides.length }).select().single();
    if (!error && data) setSlides([...slides, data]);
  };

  const updateSlide = async (id: string, updates: any) => {
    await supabase.from('slide_imagens').update(updates).eq('id', id);
    setSlides(slides.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSlide = async (id: string) => {
    await supabase.from('slide_imagens').delete().eq('id', id);
    setSlides(slides.filter(s => s.id !== id));
  };

  // User management
  const createUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast.error('Preencha e-mail e senha.');
      return;
    }
    // We use signUp from the client - the new user will get a profile via trigger
    const { error } = await supabase.auth.signUp({
      email: newUserEmail,
      password: newUserPassword,
      options: { data: { display_name: newUserName || newUserEmail } },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Usuário criado! (Verifique o e-mail para confirmar)');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setTimeout(loadAll, 2000);
    }
  };

  const toggleUserRole = async (userId: string, currentIsAdmin: boolean) => {
    if (currentIsAdmin) {
      await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
    } else {
      await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
    }
    loadAll();
  };

  const toggleUserPermission = async (userId: string, perm: string, has: boolean) => {
    if (has) {
      await supabase.from('user_permissions').delete().eq('user_id', userId).eq('permission', perm);
    } else {
      await supabase.from('user_permissions').insert({ user_id: userId, permission: perm });
    }
    loadAll();
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres.');
      return;
    }
    const { error } = await updatePassword(newPassword);
    if (error) toast.error('Erro ao alterar senha.');
    else {
      toast.success('Senha alterada com sucesso!');
      setNewPassword('');
    }
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
          <div className="flex items-center gap-2">
            <Button onClick={saveConfig} disabled={saving} className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button onClick={signOut} variant="ghost" size="icon" className="text-primary-foreground">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto bg-card p-1.5 rounded-xl shadow-card">
            {hasPermission('geral') && <TabsTrigger value="geral" className="gap-1.5 text-xs"><Radio className="w-3.5 h-3.5" /> Geral</TabsTrigger>}
            {hasPermission('locutores') && <TabsTrigger value="locutores" className="gap-1.5 text-xs"><Mic className="w-3.5 h-3.5" /> Locutores</TabsTrigger>}
            {hasPermission('programas') && <TabsTrigger value="programas" className="gap-1.5 text-xs"><CalendarClock className="w-3.5 h-3.5" /> Programas</TabsTrigger>}
            {hasPermission('musicas') && <TabsTrigger value="musicas" className="gap-1.5 text-xs"><Music className="w-3.5 h-3.5" /> Músicas</TabsTrigger>}
            {hasPermission('noticias') && <TabsTrigger value="noticias" className="gap-1.5 text-xs"><Newspaper className="w-3.5 h-3.5" /> Notícias</TabsTrigger>}
            {hasPermission('patrocinadores') && <TabsTrigger value="patrocinadores" className="gap-1.5 text-xs"><Users className="w-3.5 h-3.5" /> Patrocinadores</TabsTrigger>}
            {hasPermission('slides') && <TabsTrigger value="slides" className="gap-1.5 text-xs"><Image className="w-3.5 h-3.5" /> Slides</TabsTrigger>}
            {hasPermission('whatsapp') && <TabsTrigger value="whatsapp" className="gap-1.5 text-xs"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</TabsTrigger>}
            {hasPermission('aparencia') && <TabsTrigger value="aparencia" className="gap-1.5 text-xs"><Palette className="w-3.5 h-3.5" /> Aparência</TabsTrigger>}
            {isAdmin && <TabsTrigger value="usuarios" className="gap-1.5 text-xs"><Shield className="w-3.5 h-3.5" /> Usuários</TabsTrigger>}
            <TabsTrigger value="perfil" className="gap-1.5 text-xs"><User className="w-3.5 h-3.5" /> Perfil</TabsTrigger>
          </TabsList>

          {/* Geral */}
          {hasPermission('geral') && (
            <TabsContent value="geral">
              <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
                <h2 className="font-display font-bold text-foreground">Configurações Gerais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Nome da Rádio</Label><Input value={rc.nome_radio || ''} onChange={e => setRc({ ...rc, nome_radio: e.target.value })} /></div>
                  <div><Label>URL do Streaming</Label><Input value={rc.streaming_url || ''} onChange={e => setRc({ ...rc, streaming_url: e.target.value })} placeholder="https://stm28.srvaudio.com.br:10884/" /></div>
                  <div>
                    <Label>Logo Principal</Label>
                    <ImageUpload value={rc.logo_principal} onChange={url => setRc({ ...rc, logo_principal: url })} folder="logos" />
                  </div>
                  <div>
                    <Label>Logo Extra</Label>
                    <ImageUpload value={rc.logo_extra} onChange={url => setRc({ ...rc, logo_extra: url })} folder="logos" />
                  </div>
                  <div>
                    <Label>Posição do Player</Label>
                    <Select value={rc.player_posicao || 'center'} onValueChange={v => setRc({ ...rc, player_posicao: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Esquerda</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="right">Direita</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Música Atual</Label><Input value={rc.musica_atual || ''} onChange={e => setRc({ ...rc, musica_atual: e.target.value })} /></div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Locutores */}
          {hasPermission('locutores') && (
            <TabsContent value="locutores">
              <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-foreground">Locutores</h2>
                  <Button onClick={addLocutor} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
                </div>
                <div className="space-y-3">
                  {locutores.map(l => (
                    <div key={l.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <ImageUpload value={l.imagem_url} onChange={url => updateLocutor(l.id, { imagem_url: url })} folder="locutores" />
                      <div className="flex-1">
                        <Input placeholder="Nome do locutor" value={l.nome} onChange={e => updateLocutor(l.id, { nome: e.target.value })} />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteLocutor(l.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Programas */}
          {hasPermission('programas') && (
            <TabsContent value="programas">
              <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-foreground">Programação</h2>
                  <Button onClick={addPrograma} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
                </div>
                <div className="space-y-4">
                  {programas.map(p => (
                    <div key={p.id} className="p-4 bg-muted rounded-lg space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Input placeholder="Nome do programa" value={p.nome} onChange={e => updatePrograma(p.id, { nome: e.target.value })} />
                          <Select value={p.locutor_id || ''} onValueChange={v => updatePrograma(p.id, { locutor_id: v || null })}>
                            <SelectTrigger><SelectValue placeholder="Selecionar locutor" /></SelectTrigger>
                            <SelectContent>
                              {locutores.map(l => <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Input type="time" value={(p.horario_inicio || '').substring(0, 5)} onChange={e => updatePrograma(p.id, { horario_inicio: e.target.value })} />
                          <Input type="time" value={(p.horario_fim || '').substring(0, 5)} onChange={e => updatePrograma(p.id, { horario_fim: e.target.value })} />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deletePrograma(p.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {DIAS_SEMANA.map((dia, i) => (
                          <label key={i} className="flex items-center gap-1 text-xs">
                            <Checkbox
                              checked={(p.dias_semana || []).includes(i)}
                              onCheckedChange={checked => {
                                const dias = checked
                                  ? [...(p.dias_semana || []), i]
                                  : (p.dias_semana || []).filter((d: number) => d !== i);
                                updatePrograma(p.id, { dias_semana: dias });
                              }}
                            />
                            {dia}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Músicas */}
          {hasPermission('musicas') && (
            <TabsContent value="musicas">
              <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-foreground">Últimas Músicas Tocadas</h2>
                  <Button onClick={addMusica} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
                </div>
                <div className="space-y-3">
                  {musicas.map(m => (
                    <div key={m.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Input placeholder="Título" value={m.titulo} onChange={e => updateMusica(m.id, { titulo: e.target.value })} />
                        <Input placeholder="Artista" value={m.artista} onChange={e => updateMusica(m.id, { artista: e.target.value })} />
                        <Input type="time" value={m.hora_execucao} onChange={e => updateMusica(m.id, { hora_execucao: e.target.value })} />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteMusica(m.id)} className="text-destructive flex-shrink-0"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Notícias */}
          {hasPermission('noticias') && (
            <TabsContent value="noticias">
              <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-foreground">Notícias</h2>
                  <Button onClick={addNoticia} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
                </div>
                <div className="space-y-4">
                  {noticias.map(n => (
                    <div key={n.id} className="p-4 bg-muted rounded-lg space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                          <Input placeholder="Título" value={n.titulo} onChange={e => updateNoticia(n.id, { titulo: e.target.value })} />
                          <Textarea placeholder="Resumo" value={n.resumo || ''} onChange={e => updateNoticia(n.id, { resumo: e.target.value })} rows={2} />
                          <Input placeholder="Link completo" value={n.link_completo || ''} onChange={e => updateNoticia(n.id, { link_completo: e.target.value })} />
                          <ImageUpload value={n.imagem_url} onChange={url => updateNoticia(n.id, { imagem_url: url })} folder="noticias" />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteNoticia(n.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Patrocinadores */}
          {hasPermission('patrocinadores') && (
            <TabsContent value="patrocinadores">
              <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-foreground">Patrocinadores</h2>
                  <Button onClick={addPatrocinador} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
                </div>
                <div className="space-y-3">
                  {patrocinadores.map(p => (
                    <div key={p.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <ImageUpload value={p.imagem_url} onChange={url => updatePatrocinador(p.id, { imagem_url: url })} folder="patrocinadores" />
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input placeholder="Nome" value={p.nome} onChange={e => updatePatrocinador(p.id, { nome: e.target.value })} />
                        <Input placeholder="Link" value={p.link || ''} onChange={e => updatePatrocinador(p.id, { link: e.target.value })} />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deletePatrocinador(p.id)} className="text-destructive flex-shrink-0"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Slides */}
          {hasPermission('slides') && (
            <TabsContent value="slides">
              <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-foreground">Slides de Imagem</h2>
                  <Button onClick={addSlide} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
                </div>
                <p className="text-sm text-muted-foreground">Deixe vazio para usar as imagens padrão.</p>
                <div className="space-y-3">
                  {slides.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <span className="text-sm font-bold text-muted-foreground w-6">{i + 1}</span>
                      <ImageUpload value={s.imagem_url} onChange={url => updateSlide(s.id, { imagem_url: url })} folder="slides" />
                      <Button variant="ghost" size="icon" onClick={() => deleteSlide(s.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* WhatsApp */}
          {hasPermission('whatsapp') && (
            <TabsContent value="whatsapp">
              <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
                <h2 className="font-display font-bold text-foreground">Pedidos via WhatsApp</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Número do WhatsApp</Label><Input value={rc.whatsapp_numero || ''} onChange={e => setRc({ ...rc, whatsapp_numero: e.target.value })} placeholder="553335112000" /></div>
                  <div><Label>Mensagem Padrão</Label><Input value={rc.whatsapp_mensagem || ''} onChange={e => setRc({ ...rc, whatsapp_mensagem: e.target.value })} /></div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Aparência */}
          {hasPermission('aparencia') && (
            <TabsContent value="aparencia">
              <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
                <h2 className="font-display font-bold text-foreground">Personalização</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Cor Primária</Label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={rc.cor_primaria || '#005BBB'} onChange={e => setRc({ ...rc, cor_primaria: e.target.value })} className="w-10 h-10 rounded cursor-pointer border-0" />
                      <Input value={rc.cor_primaria || ''} onChange={e => setRc({ ...rc, cor_primaria: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label>Cor Secundária</Label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={rc.cor_secundaria || '#FFA500'} onChange={e => setRc({ ...rc, cor_secundaria: e.target.value })} className="w-10 h-10 rounded cursor-pointer border-0" />
                      <Input value={rc.cor_secundaria || ''} onChange={e => setRc({ ...rc, cor_secundaria: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Usuários (Admin only) */}
          {isAdmin && (
            <TabsContent value="usuarios">
              <div className="bg-card rounded-xl shadow-card p-6 space-y-6">
                <h2 className="font-display font-bold text-foreground">Gerenciar Usuários</h2>

                {/* Create user */}
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <h3 className="font-semibold text-sm text-foreground">Criar Novo Usuário</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input placeholder="Nome" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                    <Input placeholder="E-mail" type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} />
                    <Input placeholder="Senha" type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} />
                  </div>
                  <Button onClick={createUser} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Criar</Button>
                </div>

                {/* User list */}
                <div className="space-y-4">
                  {users.map(u => {
                    const uIsAdmin = u.roles?.some((r: any) => r.role === 'admin');
                    return (
                      <div key={u.id} className="p-4 bg-muted rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm text-foreground">{u.display_name || u.email}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                          <label className="flex items-center gap-2 text-xs">
                            <Checkbox checked={uIsAdmin} onCheckedChange={() => toggleUserRole(u.user_id, uIsAdmin)} />
                            Admin
                          </label>
                        </div>
                        {!uIsAdmin && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Permissões:</p>
                            <div className="flex flex-wrap gap-2">
                              {PERMISSIONS.map(perm => (
                                <label key={perm.key} className="flex items-center gap-1 text-xs">
                                  <Checkbox
                                    checked={u.permissions?.includes(perm.key)}
                                    onCheckedChange={() => toggleUserPermission(u.user_id, perm.key, u.permissions?.includes(perm.key))}
                                  />
                                  {perm.label}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Perfil */}
          <TabsContent value="perfil">
            <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
              <h2 className="font-display font-bold text-foreground">Meu Perfil</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="max-w-sm space-y-3">
                <Label>Alterar Senha</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Nova senha (min. 6 caracteres)"
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button onClick={handlePasswordChange} size="sm">Alterar Senha</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
