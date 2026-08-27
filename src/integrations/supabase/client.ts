import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

declare global {
  interface Window {
    __SAO_APP_CONFIG__?: {
      supabaseUrl?: string;
      supabasePublishableKey?: string;
    };
  }
}

const DEFAULT_SUPABASE_URL = 'https://appliu-supabase.ceip2y.easypanel.host';
const runtimeConfig = typeof window !== 'undefined' ? window.__SAO_APP_CONFIG__ : undefined;
const SUPABASE_URL = (runtimeConfig?.supabaseUrl || import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
const SUPABASE_PUBLISHABLE_KEY = (runtimeConfig?.supabasePublishableKey || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

if (!SUPABASE_PUBLISHABLE_KEY) {
  console.error(
    '[Supabase] VITE_SUPABASE_PUBLISHABLE_KEY não foi definida. ' +
    'Configure a chave pública no ambiente de build para habilitar login e CRUD.'
  );
}

// A publishable/anon key is intentionally the only key shipped to the browser.
// Service-role keys must never be exposed in VITE_* variables or bundled code.
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY || 'missing-publishable-key',
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'x-application-name': 'sao-francisco-fm',
      },
    },
  }
);

export const isSupabaseConfigured = Boolean(SUPABASE_PUBLISHABLE_KEY);
