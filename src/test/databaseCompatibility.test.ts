import { describe, expect, it } from 'vitest';
import {
  normalizeNoticia,
  normalizePrograma,
  permissionNamesFromRows,
  toNoticiaDbUpdates,
  toProgramaDbUpdates,
} from '@/lib/databaseCompatibility';

describe('databaseCompatibility', () => {
  it('normaliza notícia legada para o formato público', () => {
    const noticia = normalizeNoticia({
      id: 'n1',
      titulo: 'Título',
      imagem: '/imagem.jpg',
      url: 'https://example.com',
      data_postagem: '2026-08-27T10:00:00Z',
    });

    expect(noticia.imagem_url).toBe('/imagem.jpg');
    expect(noticia.link_completo).toBe('https://example.com');
    expect(noticia.created_at).toBe('2026-08-27T10:00:00Z');
  });

  it('converte atualizações de notícia para colunas legadas', () => {
    expect(toNoticiaDbUpdates({ imagem_url: '/new.jpg', link_completo: 'https://new.example.com', titulo: 'Novo' }))
      .toEqual({ imagem: '/new.jpg', url: 'https://new.example.com', titulo: 'Novo' });
  });

  it('normaliza e converte horários legados de programas', () => {
    const programa = normalizePrograma({ nome: 'Manhã', hora_inicio: '08:00:00', hora_fim: '11:00:00', dias_semana: [1] });
    expect(programa.horario_inicio).toBe('08:00:00');
    expect(programa.horario_fim).toBe('11:00:00');
    expect(programa.ativo).toBe(true);
    expect(toProgramaDbUpdates({ horario_inicio: '09:00', horario_fim: '12:00', ativo: false }))
      .toEqual({ hora_inicio: '09:00', hora_fim: '12:00' });
  });

  it('lê permissões do formato array e do formato linha-a-linha', () => {
    expect(permissionNamesFromRows([{ permissions: ['noticias', 'programacao'] }]))
      .toEqual(['noticias', 'programacao']);
    expect(permissionNamesFromRows([{ permission: 'noticias' }, { permission: 'programacao' }]))
      .toEqual(['noticias', 'programacao']);
  });
});
