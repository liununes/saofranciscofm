import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  permissions: string[];
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: unknown }>;
  resetPassword: (email: string) => Promise<{ error: unknown }>;
}

async function readUserAccess(userId: string) {
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  if (rolesError) {
    console.error('[Auth] Não foi possível carregar as roles do usuário:', rolesError);
    return { isAdmin: false, permissions: [] as string[] };
  }

  const isAdmin = roles?.some(role => role.role === 'admin') ?? false;
  if (isAdmin) return { isAdmin: true, permissions: [] as string[] };

  const { data: permissions, error: permissionsError } = await supabase
    .from('user_permissions')
    .select('permission')
    .eq('user_id', userId);

  if (permissionsError) {
    console.error('[Auth] Não foi possível carregar as permissões do usuário:', permissionsError);
  }

  return {
    isAdmin: false,
    permissions: permissions?.map(permission => permission.permission) ?? [],
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const sessionVersion = useRef(0);

  const applySession = useCallback(async (nextSession: Session | null) => {
    const version = ++sessionVersion.current;
    setSession(nextSession);
    setUser(nextSession?.user ?? null);

    if (!nextSession?.user) {
      setIsAdmin(false);
      setPermissions([]);
      setLoading(false);
      return;
    }

    const access = await readUserAccess(nextSession.user.id);
    if (version !== sessionVersion.current) return;

    setIsAdmin(access.isAdmin);
    setPermissions(access.permissions);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error('[Auth] Não foi possível restaurar a sessão:', error);
        if (mounted) await applySession(data.session);
      } catch (error) {
        console.error('[Auth] Falha ao inicializar autenticação:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setPermissions([]);
          setLoading(false);
        }
      }
    };

    const { data: authState } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Do not await database queries inside Supabase's auth callback. Running
      // the access lookup in a separate task avoids deadlocks in self-hosted Auth.
      window.setTimeout(() => {
        if (mounted) void applySession(nextSession);
      }, 0);
    });

    void initialize();

    const fallback = window.setTimeout(() => {
      if (mounted) setLoading(false);
    }, 5000);

    return () => {
      mounted = false;
      window.clearTimeout(fallback);
      authState.subscription.unsubscribe();
    };
  }, [applySession]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: displayName?.trim() || email.trim() },
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('[Auth] Falha ao sair:', error);
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        permissions,
        signIn,
        signUp,
        signOut,
        updatePassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
