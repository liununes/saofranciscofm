import { useState, useEffect, useCallback, useRef } from 'react';
import { useRadio } from '@/contexts/RadioContext';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Radio, Music, Newspaper, Image, Users, MessageCircle, Palette, Trash2, Plus, Save, Mic, CalendarClock, Shield, LogOut, Eye, EyeOff, User, FileText } from 'lucide-react';
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
  { key: 'editar_programacao', label: 'Programação' },
  { key: 'editar_locutores', label: 'Locutores' },
  { key: 'editar_noticias', label: 'Notícias' },
  { key: 'editar_patrocinadores', label: 'Patrocinadores' },
  { key: 'editar_slides', label: 'Slides' },
  { key: 'editar_streaming', label: 'Streaming' },
  { key: 'editar_cores_layout', label: 'Cores/Layout' },
  { key: 'editar_musicas', label: 'Músicas' },
  { key: 'editar_whatsapp', label: 'WhatsApp' },
  { key: 'editar_geral', label: 'Geral' },
  { key: 'editar_paginas', label: 'Páginas' },
  { key: 'gerenciar_usuarios', label: 'Gerenciar Usuários' },
];

const POSICOES_PATROCINADOR = [
  { value: 'topo', label: 'Topo' },
  { value: 'barra_centro_em_cima', label: 'Barra Central (Header)' },
  { value: 'centro', label: 'Centro' },
  { value: 'esquerda', label: 'Esquerda' },
  { value: 'direita', label: 'Direita' },
  { value: 'rodape', label: 'Rodapé' },
];

const ImageHint = ({ text }: { text: string }) => (
  <p className="text-[10px] text-muted-foreground mt-1">📐 {text}</p>
);

function useDebouncedSave(saveFn: (id: string, updates: any) => Promise<void>, delay = 600) {
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  return useCallback((id: string, updates: any) => {
    const key = `${id}-${Object.keys(updates).join(',')}`;
    if (timers.current[key]) clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => {
      saveFn(id, updates);
      delete timers.current[key];
    }, delay);
  }, [saveFn, delay]);
}

const AdminPanel = () => {
  const { refreshData } = useRadio();
  const { user, isAdmin, permissions, signOut, updatePassword } = useAuth();

  const [rc, setRc] = useState<any>({});
  const [locutores, setLocutores] = useState<any[]>([]);
  const [programas, setProgramas] = useState<any[]>([]);
  const [musicas, setMusicas] = useState<any[]>([]);
  const [noticias, setNoticias] = useState<any[]>([]);
  const [patrocinadores, setPatrocinadores] = useState<any[]>([]);
  const [slides, setSlides] = useState<any[]>([]);
  const [paginas, setPaginas] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Users management
  const [users, setUsers] = useState<any[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPerms, setNewUserPerms] = useState<string[]>([]);

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const hasPermission = (perm: string) => isAdmin || permissions.includes(perm);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [rcRes, locRes, progRes, musRes, notRes, patRes, slidRes, pagRes] = await Promise.all([
      supabase.from('radio_config').select('*').limit(1).single(),
      supabase.from('locutores').select('*').order('created_at'),
      supabase.from('programas').select('*, locutores(*)').order('horario_inicio'),
      supabase.from('musicas_recentes').select('*').order('created_at', { ascending: false }),
      supabase.from('noticias').select('*').order('created_at', { ascending: false }),
      supabase.from('patrocinadores').select('*').order('created_at'),
      supabase.from('slide_imagens').select('*').order('ordem'),
      supabase.from('paginas').select('*').order('slug'),
    ]);
    setRc(rcRes.data || {});
    setLocutores(locRes.data || []);
    setProgramas(progRes.data || []);
    setMusicas(musRes.data || []);
    setNoticias(notRes.data || []);
    setPatrocinadores(patRes.data || []);
    setSlides(slidRes.data || []);
    setPaginas(pagRes.data || []);

    if (isAdmin || permissions.includes('gerenciar_usuarios')) {
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
      cor_texto: rc.cor_texto,
      cor_fundo: rc.cor_fundo,
      imagem_fundo: rc.imagem_fundo,
      imagem_fundo_modo: rc.imagem_fundo_modo,
    }).eq('id', rc.id);
    setSaving(false);
    if (error) toast.error('Erro ao salvar.');
    else { toast.success('Salvo com sucesso!'); refreshData(); }
  };

  // --- Debounced DB persistence ---
  const persistLocutor = useCallback(async (id: string, updates: any) => { await supabase.from('locutores').update(updates).eq('id', id); }, []);
  const debouncedSaveLocutor = useDebouncedSave(persistLocutor);
  const persistPrograma = useCallback(async (id: string, updates: any) => { await supabase.from('programas').update(updates).eq('id', id); }, []);
  const debouncedSavePrograma = useDebouncedSave(persistPrograma);
  const persistMusica = useCallback(async (id: string, updates: any) => { await supabase.from('musicas_recentes').update(updates).eq('id', id); }, []);
  const debouncedSaveMusica = useDebouncedSave(persistMusica);
  const persistNoticia = useCallback(async (id: string, updates: any) => { await supabase.from('noticias').update(updates).eq('id', id); }, []);
  const debouncedSaveNoticia = useDebouncedSave(persistNoticia);
  const persistPatrocinador = useCallback(async (id: string, updates: any) => { await supabase.from('patrocinadores').update(updates).eq('id', id); }, []);
  const debouncedSavePatrocinador = useDebouncedSave(persistPatrocinador);
  const persistSlide = useCallback(async (id: string, updates: any) => { await supabase.from('slide_imagens').update(updates).eq('id', id); }, []);
  const debouncedSaveSlide = useDebouncedSave(persistSlide);
  const persistPagina = useCallback(async (id: string, updates: any) => { await supabase.from('paginas').update(updates).eq('id', id); }, []);
  const debouncedSavePagina = useDebouncedSave(persistPagina);

  // Local state updaters
  const updateLocutor = (id: string, updates: any) => { setLocutores(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l)); debouncedSaveLocutor(id, updates); };
  const updateLocutorImmediate = async (id: string, updates: any) => { setLocutores(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l)); await supabase.from('locutores').update(updates).eq('id', id); };
  const updatePrograma = (id: string, updates: any) => { setProgramas(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)); debouncedSavePrograma(id, updates); };
  const updateProgramaImmediate = async (id: string, updates: any) => { setProgramas(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)); await supabase.from('programas').update(updates).eq('id', id); };
  const updateMusica = (id: string, updates: any) => { setMusicas(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m)); debouncedSaveMusica(id, updates); };
  const updateNoticia = (id: string, updates: any) => { setNoticias(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n)); debouncedSaveNoticia(id, updates); };
  const updateNoticiaImmediate = async (id: string, updates: any) => { setNoticias(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n)); await supabase.from('noticias').update(updates).eq('id', id); };
  const updatePatrocinador = (id: string, updates: any) => { setPatrocinadores(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)); debouncedSavePatrocinador(id, updates); };
  const updatePatrocinadorImmediate = async (id: string, updates: any) => { setPatrocinadores(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)); await supabase.from('patrocinadores').update(updates).eq('id', id); };
  const updateSlide = (id: string, updates: any) => { setSlides(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s)); debouncedSaveSlide(id, updates); };
  const updateSlideImmediate = async (id: string, updates: any) => { setSlides(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s)); await supabase.from('slide_imagens').update(updates).eq('id', id); };
  const updatePagina = (id: string, updates: any) => { setPaginas(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)); debouncedSavePagina(id, updates); };
  const updatePaginaImmediate = async (id: string, updates: any) => { setPaginas(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)); await supabase.from('paginas').update(updates).eq('id', id); };

  // CRUD
  const addLocutor = async () => { const { data, error } = await supabase.from('locutores').insert({ nome: 'Novo Locutor' }).select().single(); if (!error && data) setLocutores(prev => [...prev, data]); };
  const deleteLocutor = async (id: string) => { await supabase.from('locutores').delete().eq('id', id); setLocutores(prev => prev.filter(l => l.id !== id)); };
  const addPrograma = async () => { const { data, error } = await supabase.from('programas').insert({ nome: 'Novo Programa', horario_inicio: '06:00', horario_fim: '10:00', dias_semana: [1,2,3,4,5] }).select('*, locutores(*)').single(); if (!error && data) setProgramas(prev => [...prev, data]); };
  const deletePrograma = async (id: string) => { await supabase.from('programas').delete().eq('id', id); setProgramas(prev => prev.filter(p => p.id !== id)); };
  const addMusica = async () => { const { data, error } = await supabase.from('musicas_recentes').insert({ titulo: '', artista: '', hora_execucao: '' }).select().single(); if (!error && data) setMusicas(prev => [data, ...prev]); };
  const deleteMusica = async (id: string) => { await supabase.from('musicas_recentes').delete().eq('id', id); setMusicas(prev => prev.filter(m => m.id !== id)); };
  const addNoticia = async () => { const { data, error } = await supabase.from('noticias').insert({ titulo: '', resumo: '', link_completo: '' }).select().single(); if (!error && data) setNoticias(prev => [data, ...prev]); };
  const deleteNoticia = async (id: string) => { await supabase.from('noticias').delete().eq('id', id); setNoticias(prev => prev.filter(n => n.id !== id)); };
  const addPatrocinador = async () => { const { data, error } = await supabase.from('patrocinadores').insert({ nome: '', tipo: 'normal', posicao: 'rodape' }).select().single(); if (!error && data) setPatrocinadores(prev => [...prev, data]); };
  const deletePatrocinador = async (id: string) => { await supabase.from('patrocinadores').delete().eq('id', id); setPatrocinadores(prev => prev.filter(p => p.id !== id)); };
  const addSlide = async () => { const { data, error } = await supabase.from('slide_imagens').insert({ imagem_url: '', ordem: slides.length }).select().single(); if (!error && data) setSlides(prev => [...prev, data]); };
  const deleteSlide = async (id: string) => { await supabase.from('slide_imagens').delete().eq('id', id); setSlides(prev => prev.filter(s => s.id !== id)); };

  // User management
  const createUser = async () => {
    if (!newUserEmail || !newUserPassword) { toast.error('Preencha e-mail e senha.'); return; }
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: newUserEmail, password: newUserPassword,
      options: { data: { display_name: newUserName || newUserEmail } },
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Usuário criado! (Verifique o e-mail para confirmar)');
    // Set permissions for new user if any selected
    if (signUpData?.user && newUserPerms.length > 0) {
      const permsToInsert = newUserPerms.map(p => ({ user_id: signUpData.user!.id, permission: p }));
      await supabase.from('user_permissions').insert(permsToInsert);
    }
    setNewUserEmail(''); setNewUserPassword(''); setNewUserName(''); setNewUserPerms([]);
    setTimeout(loadAll, 2000);
  };

  const toggleUserRole = async (userId: string, currentIsAdmin: boolean) => {
    if (currentIsAdmin) { await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin'); }
    else { await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' }); }
    loadAll();
  };

  const toggleUserPermission = async (userId: string, perm: string, has: boolean) => {
    if (has) { await supabase.from('user_permissions').delete().eq('user_id', userId).eq('permission', perm); }
    else { await supabase.from('user_permissions').insert({ user_id: userId, permission: perm }); }
    loadAll();
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) { toast.error('Senha deve ter pelo menos 6 caracteres.'); return; }
    const { error } = await updatePassword(newPassword);
    if (error) toast.error('Erro ao alterar senha.');
    else { toast.success('Senha alterada com sucesso!'); setNewPassword(''); }
  };

  return (
    <div className="min-h-screen bg-muted">
      <header className="gradient-primary sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="font-display font-bold text-lg text-primary-foreground">Painel Administrativo</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={saveConfig} disabled={saving} className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Save className="w-4 h-4" />{saving ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button onClick={signOut} variant="ghost" size="icon" className="text-primary-foreground"><LogOut className="w-5 h-5" /></Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto bg-card p-1.5 rounded-xl shadow-card">
            {hasPermission('editar_geral') && <TabsTrigger value="geral" className="gap-1.5 text-xs"><Radio className="w-3.5 h-3.5" /> Geral</TabsTrigger>}
            {hasPermission('editar_locutores') && <TabsTrigger value="locutores" className="gap-1.5 text-xs"><Mic className="w-3.5 h-3.5" /> Locutores</TabsTrigger>}
            {hasPermission('editar_programacao') && <TabsTrigger value="programas" className="gap-1.5 text-xs"><CalendarClock className="w-3.5 h-3.5" /> Programas</TabsTrigger>}
            {hasPermission('editar_musicas') && <TabsTrigger value="musicas" className="gap-1.5 text-xs"><Music className="w-3.5 h-3.5" /> Músicas</TabsTrigger>}
            {hasPermission('editar_noticias') && <TabsTrigger value="noticias" className="gap-1.5 text-xs"><Newspaper className="w-3.5 h-3.5" /> Notícias</TabsTrigger>}
            {hasPermission('editar_patrocinadores') && <TabsTrigger value="patrocinadores" className="gap-1.5 text-xs"><Users className="w-3.5 h-3.5" /> Patrocinadores</TabsTrigger>}
            {hasPermission('editar_slides') && <TabsTrigger value="slides" className="gap-1.5 text-xs"><Image className="w-3.5 h-3.5" /> Slides</TabsTrigger>}
            {hasPermission('editar_whatsapp') && <TabsTrigger value="whatsapp" className="gap-1.5 text-xs"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</TabsTrigger>}
            {hasPermission('editar_cores_layout') && <TabsTrigger value="aparencia" className="gap-1.5 text-xs"><Palette className="w-3.5 h-3.5" /> Aparência</TabsTrigger>}
            {hasPermission('editar_paginas') && <TabsTrigger value="paginas" className="gap-1.5 text-xs"><FileText className="w-3.5 h-3.5" /> Páginas</TabsTrigger>}
            {(isAdmin || hasPermission('gerenciar_usuarios')) && <TabsTrigger value="usuarios" className="gap-1.5 text-xs"><Shield className="w-3.5 h-3.5" /> Usuários</TabsTrigger>}
            <TabsTrigger value="perfil" className="gap-1.5 text-xs"><User className="w-3.5 h-3.5" /> Perfil</TabsTrigger>
          </TabsList>

          {/* Geral */}
          {hasPermission('editar_geral') && (
            <TabsContent value="geral">
              <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
                <h2 className="font-display font-bold text-foreground">Configurações Gerais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Nome da Rádio</Label><Input value={rc.nome_radio || ''} onChange={e => setRc({ ...rc, nome_radio: e.target.value })} /></div>
                  <div><Label>URL do Streaming</Label><Input value={rc.streaming_url || ''} onChange={e => setRc({ ...rc, streaming_url: e.target.value })} placeholder="https://stm28.srvaudio.com.br:10884/" /></div>
                  <div>
                    <Label>Logo Principal</Label>
                    <ImageHint text="Recomendado: 300×120 px (PNG/JPG)" />
                    <ImageUpload value={rc.logo_principal} onChange={url => setRc({ ...rc, logo_principal: url })} folder="logos" />
                  </div>
                  <div>
                    <Label>Logo Extra</Label>
                    <ImageHint text="Recomendado: 300×120 px (PNG/JPG)" />
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
          {hasPermission('editar_locutores') && (
            <TabsContent value="locutores">
              <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-foreground">Locutores</h2>
                  <Button onClick={addLocutor} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
                </div>
                <div className="space-y-3">
                  {locutores.map(l => (
                    <div key={l.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <div>
                        <ImageUpload value={l.imagem_url} onChange={url => updateLocutorImmediate(l.id, { imagem_url: url })} folder="locutores" />
                        <ImageHint text="400×400 px (quadrada)" />
                      </div>
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
          {hasPermission('editar_programacao') && (
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
                          <Select value={p.locutor_id || ''} onValueChange={v => updateProgramaImmediate(p.id, { locutor_id: v || null })}>
                            <SelectTrigger><SelectValue placeholder="Selecionar locutor" /></SelectTrigger>
                            <SelectContent>{locutores.map(l => <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>)}</SelectContent>
                          </Select>
                          <Input type="time" value={(p.horario_inicio || '').substring(0, 5)} onChange={e => updateProgramaImmediate(p.id, { horario_inicio: e.target.value })} />
                          <Input type="time" value={(p.horario_fim || '').substring(0, 5)} onChange={e => updateProgramaImmediate(p.id, { horario_fim: e.target.value })} />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deletePrograma(p.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {DIAS_SEMANA.map((dia, i) => (
                          <label key={i} className="flex items-center gap-1 text-xs">
                            <Checkbox checked={(p.dias_semana || []).includes(i)} onCheckedChange={checked => {
                              const dias = checked ? [...(p.dias_semana || []), i] : (p.dias_semana || []).filter((d: number) => d !== i);
                              updateProgramaImmediate(p.id, { dias_semana: dias });
                            }} />
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
          {hasPermission('editar_musicas') && (
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
          {hasPermission('editar_noticias') && (
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
                          <Textarea placeholder="Resumo (exibido no card)" value={n.resumo || ''} onChange={e => updateNoticia(n.id, { resumo: e.target.value })} rows={2} />
                          <Textarea placeholder="Conteúdo completo da notícia" value={n.conteudo || ''} onChange={e => updateNoticia(n.id, { conteudo: e.target.value })} rows={5} />
                          <Input placeholder="Link externo (opcional)" value={n.link_completo || ''} onChange={e => updateNoticia(n.id, { link_completo: e.target.value })} />
                          <div>
                            <ImageUpload value={n.imagem_url} onChange={url => updateNoticiaImmediate(n.id, { imagem_url: url })} folder="noticias" />
                            <ImageHint text="1200×630 px (paisagem)" />
                          </div>
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
          {hasPermission('editar_patrocinadores') && (
            <TabsContent value="patrocinadores">
              <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-foreground">Patrocinadores</h2>
                  <Button onClick={addPatrocinador} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
                </div>
                <div className="space-y-3">
                  {patrocinadores.map(p => (
                    <div key={p.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <div>
                        <ImageUpload value={p.imagem_url} onChange={url => updatePatrocinadorImmediate(p.id, { imagem_url: url })} folder="patrocinadores" />
                        <ImageHint text={p.tipo === 'premium' ? '400×200 px (premium)' : '200×120 px (normal)'} />
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input placeholder="Nome" value={p.nome} onChange={e => updatePatrocinador(p.id, { nome: e.target.value })} />
                        <Input placeholder="Link" value={p.link || ''} onChange={e => updatePatrocinador(p.id, { link: e.target.value })} />
                        <Select value={p.tipo || 'normal'} onValueChange={v => updatePatrocinadorImmediate(p.id, { tipo: v })}>
                          <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={p.posicao || 'rodape'} onValueChange={v => {
                          if (v === 'topo' && p.tipo !== 'premium') { toast.error('Apenas patrocinadores premium podem ficar no topo.'); return; }
                          updatePatrocinadorImmediate(p.id, { posicao: v });
                        }}>
                          <SelectTrigger><SelectValue placeholder="Posição" /></SelectTrigger>
                          <SelectContent>{POSICOES_PATROCINADOR.map(pos => <SelectItem key={pos.value} value={pos.value}>{pos.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deletePatrocinador(p.id)} className="text-destructive flex-shrink-0"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Slides */}
          {hasPermission('editar_slides') && (
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
                      <div>
                        <ImageUpload value={s.imagem_url} onChange={url => updateSlideImmediate(s.id, { imagem_url: url })} folder="slides" />
                        <ImageHint text="1280×720 px (paisagem, 16:9)" />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteSlide(s.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* WhatsApp */}
          {hasPermission('editar_whatsapp') && (
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
          {hasPermission('editar_cores_layout') && (
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
                  <div>
                    <Label>Cor do Texto</Label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={rc.cor_texto || '#1a1a2e'} onChange={e => setRc({ ...rc, cor_texto: e.target.value })} className="w-10 h-10 rounded cursor-pointer border-0" />
                      <Input value={rc.cor_texto || ''} onChange={e => setRc({ ...rc, cor_texto: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label>Cor de Fundo</Label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={rc.cor_fundo || '#f5f7fa'} onChange={e => setRc({ ...rc, cor_fundo: e.target.value })} className="w-10 h-10 rounded cursor-pointer border-0" />
                      <Input value={rc.cor_fundo || ''} onChange={e => setRc({ ...rc, cor_fundo: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label>Imagem de Fundo</Label>
                    <ImageUpload value={rc.imagem_fundo} onChange={url => setRc({ ...rc, imagem_fundo: url })} folder="backgrounds" />
                  </div>
                  <div>
                    <Label>Modo da Imagem de Fundo</Label>
                    <Select value={rc.imagem_fundo_modo || 'cover'} onValueChange={v => setRc({ ...rc, imagem_fundo_modo: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover">Preencher (cover)</SelectItem>
                        <SelectItem value="contain">Conter/ajustar ao centro</SelectItem>
                        <SelectItem value="left">Alinhar à esquerda</SelectItem>
                        <SelectItem value="right">Alinhar à direita</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Páginas */}
          {hasPermission('editar_paginas') && (
            <TabsContent value="paginas">
              <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
                <h2 className="font-display font-bold text-foreground">Páginas</h2>
                <div className="space-y-4">
                  {paginas.map(p => (
                    <div key={p.id} className="p-4 bg-muted rounded-lg space-y-2">
                      <p className="text-xs text-muted-foreground font-mono">/{p.slug}</p>
                      <Input placeholder="Título" value={p.titulo} onChange={e => updatePagina(p.id, { titulo: e.target.value })} />
                      <Textarea placeholder="Conteúdo da página" value={p.conteudo || ''} onChange={e => updatePagina(p.id, { conteudo: e.target.value })} rows={6} />
                      <div>
                        <ImageUpload value={p.imagem_url} onChange={url => updatePaginaImmediate(p.id, { imagem_url: url })} folder="paginas" />
                        <ImageHint text="1200×630 px (paisagem)" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Usuários */}
          {(isAdmin || hasPermission('gerenciar_usuarios')) && (
            <TabsContent value="usuarios">
              <div className="bg-card rounded-xl shadow-card p-6 space-y-6">
                <h2 className="font-display font-bold text-foreground">Gerenciar Usuários</h2>

                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <h3 className="font-semibold text-sm text-foreground">Criar Novo Usuário</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input placeholder="Nome" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                    <Input placeholder="E-mail" type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} />
                    <Input placeholder="Senha" type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Permissões iniciais:</p>
                    <div className="flex flex-wrap gap-2">
                      {PERMISSIONS.filter(p => p.key !== 'gerenciar_usuarios' || isAdmin).map(perm => (
                        <label key={perm.key} className="flex items-center gap-1 text-xs">
                          <Checkbox checked={newUserPerms.includes(perm.key)} onCheckedChange={checked => {
                            setNewUserPerms(prev => checked ? [...prev, perm.key] : prev.filter(k => k !== perm.key));
                          }} />
                          {perm.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button onClick={createUser} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Criar</Button>
                </div>

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
                          {isAdmin && (
                            <label className="flex items-center gap-2 text-xs">
                              <Checkbox checked={uIsAdmin} onCheckedChange={() => toggleUserRole(u.user_id, uIsAdmin)} />
                              Admin
                            </label>
                          )}
                        </div>
                        {!uIsAdmin && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Permissões:</p>
                            <div className="flex flex-wrap gap-2">
                              {PERMISSIONS.filter(perm => perm.key !== 'gerenciar_usuarios' || isAdmin).map(perm => (
                                <label key={perm.key} className="flex items-center gap-1 text-xs">
                                  <Checkbox checked={u.permissions?.includes(perm.key)} onCheckedChange={() => toggleUserPermission(u.user_id, perm.key, u.permissions?.includes(perm.key))} />
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
                  <Input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nova senha (min. 6 caracteres)" />
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
