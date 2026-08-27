import { describe, expect, it } from 'vitest';
import { getSupabaseErrorMessage, normalizeStreamingUrl } from '@/lib/supabaseUtils';

describe('supabaseUtils', () => {
  it('normalizes a valid streaming URL', () => {
    expect(normalizeStreamingUrl('  https://stream.example.com/live  ')).toBe('https://stream.example.com/live');
  });

  it('rejects invalid streaming protocols', () => {
    expect(() => normalizeStreamingUrl('ftp://stream.example.com/live')).toThrow('http:// ou https://');
  });

  it('maps RLS errors to an actionable message', () => {
    expect(getSupabaseErrorMessage({ code: '42501', message: 'new row violates row-level security policy' }))
      .toContain('não tem permissão');
  });

  it('maps network errors to an actionable message', () => {
    expect(getSupabaseErrorMessage({ message: 'Failed to fetch' }))
      .toContain('conectar ao banco de dados');
  });
});
