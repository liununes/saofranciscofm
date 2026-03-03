import { useState, useEffect, useCallback, useRef } from 'react';
import { useRadio } from '@/contexts/RadioContext';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Radio, Music, Newspaper, Image, Users, MessageCircle, Palette, Trash2, Plus, Save, Mic, CalendarClock, Shield, LogOut, Eye, EyeOff, User, FileText, Globe, Phone, ToggleLeft, Megaphone, LayoutDashboard, Menu } from 'lucide-react';
import AddNoticiaByUrl from '@/components/admin/AddNoticiaByUrl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

const SOCIAL_ICONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'smartphone', label: 'Google Play' },
  { value: 'apple', label: 'App Store' },
  { value: 'globe', label: 'Site' },
  { value: 'link', label: 'Link' },
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

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  permission?: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'geral', label: 'Geral', icon: Radio, permission: 'editar_geral' },
  { id: 'locutores', label: 'Locutores', icon: Mic, permission: 'editar_locutores' },
  { id: 'programas', label: 'Programas', icon: CalendarClock, permission: 'editar_programacao' },
  { id: 'musicas', label: 'Músicas', icon: Music, permission: 'editar_musicas' },
  { id: 'noticias', label: 'Notícias', icon: Newspaper, permission: 'editar_noticias' },
  { id: 'publicidade_noticias', label: 'Publicidade Notícias', icon: Megaphone, permission: 'editar_noticias' },
  { id: 'patrocinadores', label: 'Patrocinadores', icon: Users, permission: 'editar_patrocinadores' },
  { id: 'slides', label: 'Slides', icon: Image, permission: 'editar_slides' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, permission: 'editar_whatsapp' },
  { id: 'aparencia', label: 'Aparência', icon: Palette, permission: 'editar_cores_layout' },
  { id: 'paginas', label: 'Páginas', icon: FileText, permission: 'editar_paginas' },
  { id: 'redes_sociais', label: 'Redes Sociais', icon: Globe, permission: 'editar_geral' },
  { id: 'visibilidade', label: 'Visibilidade', icon: ToggleLeft, permission: 'editar_geral' },
  { id: 'anuncios', label: 'Anúncios', icon: Megaphone, permission: 'editar_geral' },
  { id: 'usuarios', label: 'Usuários', icon: Shield, adminOnly: true },
  { id: 'perfil', label: 'Perfil', icon: User },
];

const AdminPanel = () => {
  const { refreshData } = useRadio();
  const { user, isAdmin, permissions, signOut, updatePassword } = useAuth();

  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [rc, setRc] = useState<any>({});
  const [locutores, setLocutores] = useState<any[]>([]);
  const [programas, setProgramas] = useState<any[]>([]);
  const [musicas, setMusicas] = useState<any[]>([]);
  const [noticias, setNoticias] = useState<any[]>([]);
  const [patrocinadores, setPatrocinadores] = useState<any[]>([]);
  const [slides, setSlides] = useState<any[]>([]);
  const [paginas, setPaginas] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [publicidades, setPublicidades] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPerms, setNewUserPerms] = useState<string[]>([]);

  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const hasPermission = (perm: string) => isAdmin || permissions.includes(perm);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [rcRes, locRes, progRes, musRes, notRes, patRes, slidRes, pagRes, socialRes, pubRes] = await Promise.all([
      supabase.from('radio_config').select('*').limit(1).single(),
      supabase.from('locutores').select('*').order('created_at'),
      supabase.from('programas').select('*, locutores(*)').order('horario_inicio'),
      supabase.from('musicas_recentes').select('*').order('created_at', { ascending: false }),
      supabase.from('noticias').select('*').order('created_at', { ascending: false }),
      supabase.from('patrocinadores').select('*').order('created_at'),
      supabase.from('slide_imagens').select('*').order('ordem'),
      supabase.from('paginas').select('*').order('slug'),
      supabase.from('social_links').select('*').order('ordem'),
      supabase.from('publicidade_noticias').select('*').order('created_at', { ascending: false }),
    ]);
    setRc(rcRes.data || {});
    setLocutores(locRes.data || []);
    setProgramas(progRes.data || []);
    setMusicas(musRes.data || []);
    setNoticias(notRes.data || []);
    setPatrocinadores(patRes.data || []);
    setSlides(slidRes.data || []);
    setPaginas(pagRes.data || []);
    setSocialLinks(socialRes.data || []);
    setPublicidades(pubRes.data || []);

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

  const saveConfig = async () => {
    setSaving(true);
    const { error } = await supabase.from('radio_config').update({
      nome_radio: rc.nome_radio,
      logo_principal: rc.logo_principal,
      logo_extra: rc.logo_extra,
      logo_extra_posicao: rc.logo_extra_posicao,
      streaming_url: rc.streaming_url,
      player_posicao: rc.player_posicao,
      logo_posicao: rc.logo_posicao,
      logo_tamanho: rc.logo_tamanho,
      patrocinador_alinhamento: rc.patrocinador_alinhamento,
      tema: rc.tema,
      musica_atual: rc.musica_atual,
      whatsapp_numero: rc.whatsapp_numero,
      whatsapp_mensagem: rc.whatsapp_mensagem,
      cor_primaria: rc.cor_primaria,
      cor_secundaria: rc.cor_secundaria,
      cor_texto: rc.cor_texto,
      cor_fundo: rc.cor_fundo,
      imagem_fundo: rc.imagem_fundo,
      imagem_fundo_modo: rc.imagem_fundo_modo,
      telefone_contato: rc.telefone_contato,
      telefone_link: rc.telefone_link || '',
      visibilidade_logo: rc.visibilidade_logo,
      visibilidade_noticias: rc.visibilidade_noticias,
      visibilidade_musicas: rc.visibilidade_musicas,
      visibilidade_player: rc.visibilidade_player,
      visibilidade_patrocinadores: rc.visibilidade_patrocinadores,
      visibilidade_slides: rc.visibilidade_slides,
      visibilidade_mapa: rc.visibilidade_mapa,
      visibilidade_telefone: rc.visibilidade_telefone,
      visibilidade_destaque: rc.visibilidade_destaque,
      visibilidade_proximo_programa: rc.visibilidade_proximo_programa,
      visibilidade_participacao: rc.visibilidade_participacao,
      visibilidade_premium: rc.visibilidade_premium,
      telefone_posicao: rc.telefone_posicao,
      ads_topo_codigo: rc.ads_topo_codigo,
      ads_topo_ativo: rc.ads_topo_ativo,
      ads_meio_codigo: rc.ads_meio_codigo,
      ads_meio_ativo: rc.ads_meio_ativo,
      ads_rodape_codigo: rc.ads_rodape_codigo,
      ads_rodape_ativo: rc.ads_rodape_ativo,
      noticias_posicao: rc.noticias_posicao || 'centro',
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

  const addSocialLink = async () => { const { data, error } = await supabase.from('social_links').insert({ nome: 'Novo Link', url: '', icone: 'link', ordem: socialLinks.length, ativo: false }).select().single(); if (!error && data) setSocialLinks(prev => [...prev, data]); };
  const deleteSocialLink = async (id: string) => { await supabase.from('social_links').delete().eq('id', id); setSocialLinks(prev => prev.filter(s => s.id !== id)); };
  const persistSocialLink = useCallback(async (id: string, updates: any) => { await supabase.from('social_links').update(updates).eq('id', id); }, []);
  const debouncedSaveSocialLink = useDebouncedSave(persistSocialLink);
  const updateSocialLink = (id: string, updates: any) => { setSocialLinks(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s)); debouncedSaveSocialLink(id, updates); };
  const updateSocialLinkImmediate = async (id: string, updates: any) => { setSocialLinks(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s)); await supabase.from('social_links').update(updates).eq('id', id); };

  const createUser = async () => {
    if (!newUserEmail || !newUserPassword) { toast.error('Preencha e-mail e senha.'); return; }
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: newUserEmail, password: newUserPassword,
      options: { data: { display_name: newUserName || newUserEmail } },
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Usuário criado! (Verifique o e-mail para confirmar)');
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

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (item.adminOnly) return isAdmin || hasPermission('gerenciar_usuarios');
    if (item.permission) return hasPermission(item.permission);
    return true;
  });

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return renderDashboard();
      case 'geral': return renderGeral();
      case 'locutores': return renderLocutores();
      case 'programas': return renderProgramas();
      case 'musicas': return renderMusicas();
      case 'noticias': return renderNoticias();
      case 'publicidade_noticias': return renderPublicidadeNoticias();
      case 'patrocinadores': return renderPatrocinadores();
      case 'slides': return renderSlides();
      case 'whatsapp': return renderWhatsApp();
      case 'aparencia': return renderAparencia();
      case 'paginas': return renderPaginas();
      case 'redes_sociais': return renderRedesSociais();
      case 'visibilidade': return renderVisibilidade();
      case 'anuncios': return renderAnuncios();
      case 'usuarios': return renderUsuarios();
      case 'perfil': return renderPerfil();
      default: return renderDashboard();
    }
  };

  // =================== RENDER SECTIONS ===================

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="font-display font-bold text-xl text-foreground">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('noticias')}>
          <CardContent className="pt-6 text-center">
            <Newspaper className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{noticias.length}</p>
            <p className="text-xs text-muted-foreground">Notícias</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('programas')}>
          <CardContent className="pt-6 text-center">
            <CalendarClock className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{programas.length}</p>
            <p className="text-xs text-muted-foreground">Programas</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('locutores')}>
          <CardContent className="pt-6 text-center">
            <Mic className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{locutores.length}</p>
            <p className="text-xs text-muted-foreground">Locutores</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('patrocinadores')}>
          <CardContent className="pt-6 text-center">
            <Users className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{patrocinadores.length}</p>
            <p className="text-xs text-muted-foreground">Patrocinadores</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Últimas Notícias</CardTitle></CardHeader>
          <CardContent>
            {noticias.slice(0, 5).map(n => (
              <div key={n.id} className="flex items-center gap-2 py-2 border-b last:border-0">
                {n.destaque && <span className="text-xs">⭐</span>}
                <p className="text-sm text-foreground truncate flex-1">{n.titulo || '(sem título)'}</p>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{n.created_at ? new Date(n.created_at).toLocaleDateString('pt-BR') : ''}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Programação Ativa</CardTitle></CardHeader>
          <CardContent>
            {programas.filter(p => p.ativo).slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <p className="text-sm text-foreground">{p.nome}</p>
                <span className="text-xs text-muted-foreground">{(p.horario_inicio || '').substring(0, 5)} - {(p.horario_fim || '').substring(0, 5)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderGeral = () => (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl text-foreground">Configurações Gerais</h2>
      <Card>
        <CardContent className="pt-6">
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
              <Label>Posição da Logo Extra</Label>
              <Select value={rc.logo_extra_posicao || 'right'} onValueChange={v => setRc({ ...rc, logo_extra_posicao: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda do Player</SelectItem>
                  <SelectItem value="right">Direita do Player</SelectItem>
                  <SelectItem value="above">Centralizada Acima</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Posição da Logo</Label>
              <Select value={rc.logo_posicao || 'left'} onValueChange={v => setRc({ ...rc, logo_posicao: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda do Player</SelectItem>
                  <SelectItem value="right">Direita do Player</SelectItem>
                  <SelectItem value="above">Centralizada Acima</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Tamanho da Logo (px)</Label><Input type="number" min={40} max={200} value={rc.logo_tamanho || 80} onChange={e => setRc({ ...rc, logo_tamanho: parseInt(e.target.value) || 80 })} /></div>
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
        </CardContent>
      </Card>

      {/* Phone Contact Section */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Phone className="w-4 h-4" /> Telefone de Contato</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Número exibido</Label><Input value={rc.telefone_contato || ''} onChange={e => setRc({ ...rc, telefone_contato: e.target.value })} placeholder="3511-2000" /></div>
            <div><Label>Link ao clicar (URL ou tel:)</Label><Input value={rc.telefone_link || ''} onChange={e => setRc({ ...rc, telefone_link: e.target.value })} placeholder="https://wa.me/553335112000 ou tel:+553335112000" /></div>
            <div>
              <Label>Posição do Telefone</Label>
              <Select value={rc.telefone_posicao || 'player'} onValueChange={v => setRc({ ...rc, telefone_posicao: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="player">Ao lado do Player</SelectItem>
                  <SelectItem value="header">Cabeçalho (Header)</SelectItem>
                  <SelectItem value="topo">Barra acima do Player</SelectItem>
                  <SelectItem value="centro">Centro do conteúdo</SelectItem>
                  <SelectItem value="meio-esquerda">Meio - Esquerda</SelectItem>
                  <SelectItem value="meio-direita">Meio - Direita</SelectItem>
                  <SelectItem value="rodape">Rodapé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Se o link estiver vazio, será usado <code>tel:</code> + o número informado.</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderLocutores = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-foreground">Locutores</h2>
        <Button onClick={addLocutor} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
      </div>
      <div className="space-y-3">
        {locutores.map(l => (
          <Card key={l.id}>
            <CardContent className="pt-4 flex items-start gap-3">
              <div>
                <ImageUpload value={l.imagem_url} onChange={url => updateLocutorImmediate(l.id, { imagem_url: url })} folder="locutores" />
                <ImageHint text="400×400 px (quadrada)" />
              </div>
              <div className="flex-1"><Input placeholder="Nome do locutor" value={l.nome} onChange={e => updateLocutor(l.id, { nome: e.target.value })} /></div>
              <Button variant="ghost" size="icon" onClick={() => deleteLocutor(l.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderProgramas = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-foreground">Programação</h2>
        <Button onClick={addPrograma} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
      </div>
      <div className="space-y-4">
        {programas.map(p => (
          <Card key={p.id}>
            <CardContent className="pt-4 space-y-3">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMusicas = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-foreground">Últimas Músicas Tocadas</h2>
        <Button onClick={addMusica} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
      </div>
      <div className="space-y-3">
        {musicas.map(m => (
          <Card key={m.id}>
            <CardContent className="pt-4 flex items-center gap-3">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input placeholder="Título" value={m.titulo} onChange={e => updateMusica(m.id, { titulo: e.target.value })} />
                <Input placeholder="Artista" value={m.artista} onChange={e => updateMusica(m.id, { artista: e.target.value })} />
                <Input type="time" value={m.hora_execucao} onChange={e => updateMusica(m.id, { hora_execucao: e.target.value })} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteMusica(m.id)} className="text-destructive flex-shrink-0"><Trash2 className="w-4 h-4" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderNoticias = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-display font-bold text-xl text-foreground">Notícias</h2>
        <div className="flex gap-2">
          <AddNoticiaByUrl onNoticiaAdded={loadAll} existingUrls={noticias.map((n: any) => n.link_completo).filter(Boolean)} />
          <Button onClick={addNoticia} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Manual</Button>
        </div>
      </div>

      {/* Posição das notícias */}
      <Card>
        <CardContent className="pt-4">
          <Label>Posição das Notícias no Site</Label>
          <Select value={rc.noticias_posicao || 'centro'} onValueChange={v => setRc({ ...rc, noticias_posicao: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="centro">Centro (principal)</SelectItem>
              <SelectItem value="esquerda">Lateral Esquerda</SelectItem>
              <SelectItem value="direita">Lateral Direita</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground mt-1">Quando centralizada e sem outros blocos, as notícias aparecem lado a lado.</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {noticias.map(n => (
          <Card key={n.id}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Input placeholder="Título" value={n.titulo} onChange={e => updateNoticia(n.id, { titulo: e.target.value })} className="flex-1" />
                    <label className="flex items-center gap-2 ml-3 whitespace-nowrap text-xs">
                      <Switch checked={n.destaque || false} onCheckedChange={checked => updateNoticiaImmediate(n.id, { destaque: checked })} />
                      ⭐ Destaque
                    </label>
                  </div>
                  <Textarea placeholder="Resumo (exibido no card)" value={n.resumo || ''} onChange={e => updateNoticia(n.id, { resumo: e.target.value })} rows={2} />
                  <Textarea placeholder="Conteúdo completo da matéria (separe parágrafos com linhas em branco)" value={n.conteudo || ''} onChange={e => updateNoticia(n.id, { conteudo: e.target.value })} rows={8} />
                  <Input placeholder="Link externo (opcional - ex: Acesse a matéria completa)" value={n.link_completo || ''} onChange={e => updateNoticia(n.id, { link_completo: e.target.value })} />
                  
                  {/* Publicidade na matéria */}
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">📢 Publicidade no texto</span>
                      <Switch checked={n.publicidade_ativa || false} onCheckedChange={checked => updateNoticiaImmediate(n.id, { publicidade_ativa: checked })} />
                    </div>
                    {n.publicidade_ativa && (
                      <>
                        <Select value={n.publicidade_id || ''} onValueChange={v => updateNoticiaImmediate(n.id, { publicidade_id: v || null })}>
                          <SelectTrigger><SelectValue placeholder="Selecionar publicidade..." /></SelectTrigger>
                          <SelectContent>
                            {publicidades.filter(p => p.ativo).map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] text-muted-foreground">Cadastre publicidades na seção "Publicidade Notícias"</p>
                      </>
                    )}
                  </div>

                  <div>
                    <ImageUpload value={n.imagem_url} onChange={url => updateNoticiaImmediate(n.id, { imagem_url: url })} folder="noticias" />
                    <ImageHint text="1200×630 px (paisagem)" />
                  </div>
                  {n.created_at && (
                    <p className="text-xs text-muted-foreground">
                      Publicado: {new Date(n.created_at).toLocaleDateString('pt-BR')}
                      {n.updated_at && n.updated_at !== n.created_at && (
                        <> · Atualizado: {new Date(n.updated_at).toLocaleDateString('pt-BR')}</>
                      )}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteNoticia(n.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Publicidade CRUD helpers
  const addPublicidade = async () => {
    const { data, error } = await supabase.from('publicidade_noticias').insert({ nome: 'Nova Publicidade', texto: '', ativo: true }).select().single();
    if (!error && data) setPublicidades(prev => [data, ...prev]);
  };
  const deletePublicidade = async (id: string) => {
    await supabase.from('publicidade_noticias').delete().eq('id', id);
    setPublicidades(prev => prev.filter(p => p.id !== id));
  };
  const persistPublicidade = useCallback(async (id: string, updates: any) => { await supabase.from('publicidade_noticias').update(updates).eq('id', id); }, []);
  const debouncedSavePublicidade = useDebouncedSave(persistPublicidade);
  const updatePublicidade = (id: string, updates: any) => { setPublicidades(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)); debouncedSavePublicidade(id, updates); };
  const updatePublicidadeImmediate = async (id: string, updates: any) => { setPublicidades(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)); await supabase.from('publicidade_noticias').update(updates).eq('id', id); };

  const renderPublicidadeNoticias = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-foreground">Publicidade em Notícias</h2>
        <Button onClick={addPublicidade} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Cadastre publicidades aqui. Depois, vá na seção Notícias e ative a publicidade escolhendo qual exibir em cada matéria.
      </p>
      <div className="space-y-4">
        {publicidades.map(p => (
          <Card key={p.id}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Input placeholder="Nome da publicidade" value={p.nome} onChange={e => updatePublicidade(p.id, { nome: e.target.value })} className="flex-1" />
                    <label className="flex items-center gap-2 ml-3 whitespace-nowrap text-xs">
                      <Switch checked={p.ativo ?? true} onCheckedChange={checked => updatePublicidadeImmediate(p.id, { ativo: checked })} />
                      Ativo
                    </label>
                  </div>
                  <Textarea placeholder="Texto da publicidade (ex: Promoção especial! Clique e confira)" value={p.texto || ''} onChange={e => updatePublicidade(p.id, { texto: e.target.value })} rows={3} />
                  <Input placeholder="Link (URL destino ao clicar)" value={p.link || ''} onChange={e => updatePublicidade(p.id, { link: e.target.value })} />
                  <div>
                    <ImageUpload value={p.imagem_url} onChange={url => updatePublicidadeImmediate(p.id, { imagem_url: url })} folder="publicidade" />
                    <ImageHint text="728×90 px (banner) ou 300×250 px (retângulo)" />
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deletePublicidade(p.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {publicidades.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma publicidade cadastrada. Clique em "Adicionar" para criar.</p>
        )}
      </div>
    </div>
  );

  const renderPatrocinadores = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-foreground">Patrocinadores</h2>
        <Button onClick={addPatrocinador} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
      </div>
      <div className="space-y-3">
        {patrocinadores.map(p => (
          <Card key={p.id}>
            <CardContent className="pt-4 flex items-start gap-3">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSlides = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-foreground">Slides de Imagem</h2>
        <Button onClick={addSlide} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
      </div>
      <p className="text-sm text-muted-foreground">Deixe vazio para usar as imagens padrão.</p>
      <div className="space-y-3">
        {slides.map((s, i) => (
          <Card key={s.id}>
            <CardContent className="pt-4 flex items-center gap-3">
              <span className="text-sm font-bold text-muted-foreground w-6">{i + 1}</span>
              <div>
                <ImageUpload value={s.imagem_url} onChange={url => updateSlideImmediate(s.id, { imagem_url: url })} folder="slides" />
                <ImageHint text="1280×720 px (16:9)" />
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteSlide(s.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderWhatsApp = () => (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl text-foreground">Pedidos via WhatsApp</h2>
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Número do WhatsApp</Label><Input value={rc.whatsapp_numero || ''} onChange={e => setRc({ ...rc, whatsapp_numero: e.target.value })} placeholder="553335112000" /></div>
          <div><Label>Mensagem Padrão</Label><Input value={rc.whatsapp_mensagem || ''} onChange={e => setRc({ ...rc, whatsapp_mensagem: e.target.value })} /></div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAparencia = () => (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl text-foreground">Personalização</h2>
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Tema do Site</Label>
            <Select value={rc.tema || 'claro'} onValueChange={v => setRc({ ...rc, tema: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="claro">Claro</SelectItem>
                <SelectItem value="escuro">Escuro</SelectItem>
                <SelectItem value="moderno">Moderno</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Alinhamento dos Patrocinadores</Label>
            <Select value={rc.patrocinador_alinhamento || 'center'} onValueChange={v => setRc({ ...rc, patrocinador_alinhamento: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Esquerda</SelectItem>
                <SelectItem value="center">Centro</SelectItem>
                <SelectItem value="right">Direita</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {['cor_primaria', 'cor_secundaria', 'cor_texto', 'cor_fundo'].map(key => {
            const labels: Record<string, string> = { cor_primaria: 'Cor Primária', cor_secundaria: 'Cor Secundária', cor_texto: 'Cor do Texto', cor_fundo: 'Cor de Fundo' };
            const defaults: Record<string, string> = { cor_primaria: '#005BBB', cor_secundaria: '#FFA500', cor_texto: '#1a1a2e', cor_fundo: '#f5f7fa' };
            return (
              <div key={key}>
                <Label>{labels[key]}</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={rc[key] || defaults[key]} onChange={e => setRc({ ...rc, [key]: e.target.value })} className="w-10 h-10 rounded cursor-pointer border-0" />
                  <Input value={rc[key] || ''} onChange={e => setRc({ ...rc, [key]: e.target.value })} />
                </div>
              </div>
            );
          })}
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
                <SelectItem value="contain">Conter/ajustar</SelectItem>
                <SelectItem value="left">Alinhar à esquerda</SelectItem>
                <SelectItem value="right">Alinhar à direita</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPaginas = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-foreground">Páginas</h2>
        <Button onClick={async () => {
          const slug = `pagina-${Date.now()}`;
          const { data, error } = await supabase.from('paginas').insert({ slug, titulo: 'Nova Página', conteudo: '' }).select().single();
          if (!error && data) { setPaginas(prev => [...prev, data]); toast.success('Página criada!'); }
          else toast.error('Erro ao criar página.');
        }} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Nova Página</Button>
      </div>
      <div className="space-y-4">
        {paginas.map(p => (
          <Card key={p.id}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-mono">/{p.slug}</p>
                <Button variant="ghost" size="icon" onClick={async () => {
                  await supabase.from('paginas').delete().eq('id', p.id);
                  setPaginas(prev => prev.filter(pg => pg.id !== p.id));
                  toast.success('Página removida.');
                }} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
              </div>
              <Input placeholder="Slug (URL)" value={p.slug} onChange={e => updatePagina(p.id, { slug: e.target.value })} />
              <Input placeholder="Título" value={p.titulo} onChange={e => updatePagina(p.id, { titulo: e.target.value })} />
              <Textarea placeholder="Conteúdo" value={p.conteudo || ''} onChange={e => updatePagina(p.id, { conteudo: e.target.value })} rows={6} />
              <div>
                <ImageUpload value={p.imagem_url} onChange={url => updatePaginaImmediate(p.id, { imagem_url: url })} folder="paginas" />
                <ImageHint text="1200×630 px" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderRedesSociais = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-foreground">Redes Sociais</h2>
        <Button onClick={addSocialLink} size="sm" className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
      </div>
      <p className="text-sm text-muted-foreground">Gerencie os ícones sociais do cabeçalho. Ative apenas os que possuem link.</p>
      <div className="space-y-3">
        {socialLinks.map(s => (
          <Card key={s.id}>
            <CardContent className="pt-4 flex items-center gap-3">
              <Switch checked={s.ativo} onCheckedChange={checked => updateSocialLinkImmediate(s.id, { ativo: checked })} />
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input placeholder="Nome" value={s.nome} onChange={e => updateSocialLink(s.id, { nome: e.target.value })} />
                <Input placeholder="URL" value={s.url || ''} onChange={e => updateSocialLink(s.id, { url: e.target.value })} />
                <Select value={s.icone || 'link'} onValueChange={v => updateSocialLinkImmediate(s.id, { icone: v })}>
                  <SelectTrigger><SelectValue placeholder="Ícone" /></SelectTrigger>
                  <SelectContent>{SOCIAL_ICONS.map(icon => <SelectItem key={icon.value} value={icon.value}>{icon.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteSocialLink(s.id)} className="text-destructive flex-shrink-0"><Trash2 className="w-4 h-4" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderVisibilidade = () => (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl text-foreground">Controle de Visibilidade</h2>
      <p className="text-sm text-muted-foreground">Ative ou desative seções. As alterações são aplicadas ao salvar.</p>
      <Card>
        <CardContent className="pt-6 space-y-3">
          {[
            { key: 'visibilidade_logo', label: 'Logo Principal' },
            { key: 'visibilidade_player', label: 'Player de Áudio' },
            { key: 'visibilidade_telefone', label: 'Telefone de Contato' },
            { key: 'visibilidade_noticias', label: 'Notícias' },
            { key: 'visibilidade_musicas', label: 'Últimas Músicas' },
            { key: 'visibilidade_patrocinadores', label: 'Patrocinadores' },
            { key: 'visibilidade_slides', label: 'Imagens / Slides' },
            { key: 'visibilidade_destaque', label: '📰 Módulo: Notícia em Destaque' },
            { key: 'visibilidade_proximo_programa', label: '⏰ Módulo: Próximo Programa' },
            { key: 'visibilidade_participacao', label: '🎤 Módulo: Participação do Ouvinte' },
            { key: 'visibilidade_premium', label: '⭐ Módulo: Patrocinador Premium' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium text-sm text-foreground">{item.label}</span>
              <Switch checked={rc[item.key] ?? true} onCheckedChange={checked => setRc({ ...rc, [item.key]: checked })} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderAnuncios = () => (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl text-foreground">Espaços para Google Ads</h2>
      <p className="text-sm text-muted-foreground">Cole o código do Google Ads em cada espaço e ative para exibir.</p>
      {[
        { codigoKey: 'ads_topo_codigo', ativoKey: 'ads_topo_ativo', label: 'Topo do Site' },
        { codigoKey: 'ads_meio_codigo', ativoKey: 'ads_meio_ativo', label: 'Meio do Conteúdo' },
        { codigoKey: 'ads_rodape_codigo', ativoKey: 'ads_rodape_ativo', label: 'Rodapé' },
      ].map(ad => (
        <Card key={ad.codigoKey}>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-foreground">{ad.label}</span>
              <Switch checked={rc[ad.ativoKey] ?? false} onCheckedChange={checked => setRc({ ...rc, [ad.ativoKey]: checked })} />
            </div>
            <Textarea placeholder="Cole o código do Google Ads..." value={rc[ad.codigoKey] || ''} onChange={e => setRc({ ...rc, [ad.codigoKey]: e.target.value })} rows={4} className="font-mono text-xs" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderUsuarios = () => (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl text-foreground">Gerenciar Usuários</h2>
      <Card>
        <CardContent className="pt-6 space-y-3">
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
        </CardContent>
      </Card>

      <div className="space-y-4">
        {users.map(u => {
          const uIsAdmin = u.roles?.some((r: any) => r.role === 'admin');
          const isSelf = u.user_id === user?.id;
          return (
            <Card key={u.id}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{u.display_name || u.email} {isSelf && <span className="text-xs text-muted-foreground">(você)</span>}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  {isAdmin && !isSelf && (
                    <label className="flex items-center gap-2 text-xs">
                      <Checkbox checked={uIsAdmin} onCheckedChange={() => toggleUserRole(u.user_id, uIsAdmin)} />
                      Admin
                    </label>
                  )}
                  {isSelf && uIsAdmin && (
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">Admin</span>
                  )}
                </div>
                {!uIsAdmin && !isSelf && (
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderPerfil = () => (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl text-foreground">Meu Perfil</h2>
      <Card>
        <CardContent className="pt-6 space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-14'} bg-card border-r border-border flex-shrink-0 transition-all duration-200 hidden md:flex flex-col`}>
        <div className="p-3 border-b border-border flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="flex-shrink-0">
            <Menu className="w-5 h-5" />
          </Button>
          {sidebarOpen && <span className="font-display font-bold text-sm text-foreground truncate">Admin</span>}
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {filteredNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="gradient-primary sticky top-0 z-50">
          <div className="flex items-center justify-between py-3 px-4">
            <div className="flex items-center gap-3">
              {/* Mobile menu */}
              <select
                value={activeSection}
                onChange={e => setActiveSection(e.target.value)}
                className="md:hidden bg-primary-foreground/10 text-primary-foreground text-sm rounded px-2 py-1 border-0"
              >
                {filteredNavItems.map(item => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
              <Link to="/" className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"><ArrowLeft className="w-5 h-5" /></Link>
              <h1 className="font-display font-bold text-lg text-primary-foreground hidden sm:block">Painel Administrativo</h1>
            </div>
            <Button onClick={saveConfig} disabled={saving} className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Save className="w-4 h-4" />{saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
