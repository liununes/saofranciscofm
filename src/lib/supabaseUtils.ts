export interface SupabaseLikeError {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}

export function getSupabaseErrorMessage(error: unknown, fallback = 'Não foi possível concluir a operação.') {
  const candidate = error as SupabaseLikeError | null | undefined;
  const message = candidate?.message?.trim();

  if (!message) return fallback;
  if (candidate?.code === '42501' || /row-level security|permission denied/i.test(message)) {
    return 'Sua conta não tem permissão para esta operação. Solicite a role ou permissão correta ao administrador.';
  }
  if (/failed to fetch|network|fetch/i.test(message)) {
    return 'Não foi possível conectar ao banco de dados. Verifique a URL e a chave pública do Supabase no ambiente de produção.';
  }
  return message;
}

export function normalizeStreamingUrl(value: string, options: { allowHttpOnHttps?: boolean } = {}) {
  const trimmed = value.trim();
  if (!trimmed) return '';

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error('Informe uma URL válida para o streaming (ex.: https://servidor.exemplo/stream).');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('A URL do streaming deve começar com http:// ou https://.');
  }

  if (!options.allowHttpOnHttps && typeof window !== 'undefined' && window.location.protocol === 'https:' && parsed.protocol === 'http:') {
    throw new Error('O site está em HTTPS. Use uma URL HTTPS para evitar bloqueio de conteúdo misto pelo navegador.');
  }

  return parsed.toString();
}

export function getPlayableStreamingUrl(value: string) {
  const normalized = normalizeStreamingUrl(value, { allowHttpOnHttps: true });
  if (!normalized || typeof window === 'undefined') return normalized;

  const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
  if (localHosts.has(window.location.hostname)) return normalized;

  // The production Node server transcodes AAC+ to browser-friendly MP3 and
  // keeps the provider URL off the page's media request.
  return `/stream.mp3?url=${encodeURIComponent(normalized)}`;
}
