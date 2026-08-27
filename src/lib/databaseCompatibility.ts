export type AdminUpdates = Record<string, unknown>;

export const normalizeNoticia = (noticia: any) => ({
  ...noticia,
  resumo: noticia?.resumo ?? '',
  conteudo: noticia?.conteudo ?? '',
  link_completo: noticia?.link_completo ?? noticia?.url ?? '',
  imagem_url: noticia?.imagem_url ?? noticia?.imagem ?? '',
  created_at: noticia?.created_at ?? noticia?.data_postagem ?? null,
  updated_at: noticia?.updated_at ?? noticia?.data_postagem ?? null,
  destaque: noticia?.destaque ?? false,
});

export const toNoticiaDbUpdates = (updates: AdminUpdates) => {
  const payload = { ...updates };
  if (Object.prototype.hasOwnProperty.call(payload, 'imagem_url')) {
    payload.imagem = payload.imagem_url;
    delete payload.imagem_url;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'link_completo')) {
    payload.url = payload.link_completo;
    delete payload.link_completo;
  }
  delete payload.created_at;
  delete payload.updated_at;
  return payload;
};

export const normalizePrograma = (programa: any) => ({
  ...programa,
  horario_inicio: programa?.horario_inicio ?? programa?.hora_inicio ?? '00:00:00',
  horario_fim: programa?.horario_fim ?? programa?.hora_fim ?? '00:00:00',
  ativo: programa?.ativo ?? true,
  locutor: programa?.locutor ?? programa?.locutores ?? undefined,
});

export const toProgramaDbUpdates = (updates: AdminUpdates) => {
  const payload = { ...updates };
  if (Object.prototype.hasOwnProperty.call(payload, 'horario_inicio')) {
    payload.hora_inicio = payload.horario_inicio;
    delete payload.horario_inicio;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'horario_fim')) {
    payload.hora_fim = payload.horario_fim;
    delete payload.horario_fim;
  }
  // The production schema has no ativo column; every stored program is active.
  delete payload.ativo;
  return payload;
};

export const permissionNamesFromRows = (rows: any[] | null | undefined): string[] => {
  if (!rows?.length) return [];
  const legacyPermissions = rows.flatMap(row => Array.isArray(row?.permissions) ? row.permissions : []);
  if (legacyPermissions.length > 0) return [...new Set(legacyPermissions)];
  return [...new Set(rows.map(row => row?.permission).filter((permission): permission is string => Boolean(permission)))];
};

export const isLegacyPermissionRow = (row: any): boolean => Array.isArray(row?.permissions);
