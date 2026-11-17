import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type FeedConfig = { url: string; name: string; scope: "Minas Gerais" };
type NewsItem = {
  title: string; link: string; guid: string; summary: string; image: string | null;
  publishedAt: Date; feed: FeedConfig;
};

const FEEDS: FeedConfig[] = [
  { url: "https://g1.globo.com/rss/g1/mg/vales-mg/", name: "G1 Vales de Minas Gerais", scope: "Minas Gerais" },
  { url: "https://g1.globo.com/rss/g1/mg/grande-minas/", name: "G1 Grande Minas", scope: "Minas Gerais" },
];

function decodeEntities(value: string): string {
  return value.replace(/&amp;/gi, "&").replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}
function tagText(xml: string, tag: string): string {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(new RegExp(
    `<(?:[\\w.-]+:)?${escaped}\\b[^>]*>([\\s\\S]*?)<\\/(?:[\\w.-]+:)?${escaped}\\s*>`, "i"));
  return match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim() : "";
}
function htmlToText(value: string): string {
  return decodeEntities(value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ").trim();
}
function validHttpUrl(value: string): boolean {
  try { const u = new URL(value); return ["https:", "http:"].includes(u.protocol) &&
    !["localhost", "127.0.0.1", "::1"].includes(u.hostname); } catch { return false; }
}
function attribute(tag: string, name: string): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return tag.match(new RegExp(`\\b${escaped}\\s*=\\s*["']([^"']+)["']`, "i"))?.[1] ?? "";
}
function getImage(item: string): string | null {
  const enclosure = item.match(/<enclosure\b[^>]*>/i)?.[0] ?? "";
  const media = item.match(/<(?:media:content|media:thumbnail)\b[^>]*>/i)?.[0] ?? "";
  const candidate = attribute(enclosure, "url") || attribute(media, "url");
  return candidate && validHttpUrl(candidate) ? decodeEntities(candidate) : null;
}
async function fetchFeed(feed: FeedConfig): Promise<NewsItem[]> {
  const response = await fetch(feed.url, {
    headers: { "User-Agent": "SaoFranciscoFM-NewsBot/1.0 (+https://saofranciscofm.com.br)" },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const xml = await response.text();
  const entries = Array.from(xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi), m => m[1]);
  if (!entries.length) throw new Error("Nenhum item RSS encontrado.");
  return entries.slice(0, 20).map(item => {
    const title = htmlToText(tagText(item, "title"));
    const link = decodeEntities(tagText(item, "link"));
    const guid = decodeEntities(tagText(item, "guid") || link);
    const description = htmlToText(tagText(item, "description") || tagText(item, "encoded"));
    const rawDate = tagText(item, "pubDate");
    const parsedDate = rawDate ? new Date(rawDate) : new Date();
    return { title, link, guid: guid.slice(0, 1800), summary: description.slice(0, 360),
      image: getImage(item), publishedAt: Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate, feed };
  });
}

Deno.serve(async req => {
  if (req.method !== "POST") return Response.json({ error: "Método não permitido." }, { status: 405 });
  const expected = Deno.env.get("NEWS_CRON_SECRET");
  if (!expected || req.headers.get("x-news-cron-secret") !== expected)
    return Response.json({ error: "Não autorizado." }, { status: 401 });

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return Response.json({ error: "Configuração do banco incompleta." }, { status: 500 });
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const startedAt = new Date();
  const feedResults = await Promise.all(FEEDS.map(async feed => {
    try { return { feed, items: await fetchFeed(feed), error: undefined as string | undefined }; }
    catch (e) { return { feed, items: [] as NewsItem[], error: e instanceof Error ? e.message : String(e) }; }
  }));

  const cutoff = Date.now();
  const candidates = feedResults.flatMap(result => result.items.filter(item => {
    const age = (cutoff - item.publishedAt.getTime()) / 3600000;
    return item.title && validHttpUrl(item.link) && item.guid && age <= 48 && age >= -2;
  }));
  const uniqueByGuid = new Map<string, NewsItem>();
  for (const item of candidates) if (!uniqueByGuid.has(item.guid)) uniqueByGuid.set(item.guid, item);
  const uniqueItems = [...uniqueByGuid.values()];

  let imported = 0;
  let databaseError: string | undefined;
  if (uniqueItems.length) {
    const guids = uniqueItems.map(item => item.guid);
    const { data: existing, error: lookupError } = await supabase
      .from("noticias").select("rss_guid").in("rss_guid", guids);
    if (lookupError) databaseError = lookupError.message;
    else {
      const known = new Set((existing ?? []).map(row => row.rss_guid));
      const rows = uniqueItems.filter(item => !known.has(item.guid)).map(item => {
        const summary = item.summary || item.title;
        return {
          titulo: item.title.slice(0, 250), resumo: summary.slice(0, 500), conteudo: summary,
          link_completo: item.link, imagem_url: item.image, fonte: item.feed.name,
          origem_rss: true, rss_guid: item.guid, abrangencia: item.feed.scope,
          created_at: item.publishedAt.toISOString(),
        };
      });
      if (rows.length) {
        const { data, error } = await supabase.from("noticias").insert(rows).select("id");
        if (error) databaseError = error.message;
        else imported = data?.length ?? rows.length;
      }
    }
  }

  const feeds = feedResults.map(result => ({
    feed: result.feed.name,
    found: result.items.length,
    imported: databaseError ? 0 : uniqueItems.filter(item => item.feed.name === result.feed.name && !databaseError).length,
    error: result.error,
  }));
  return Response.json({
    ok: !databaseError && feedResults.every(result => !result.error),
    started_at: startedAt.toISOString(),
    imported,
    already_or_invalid: Math.max(0, candidates.length - imported),
    database_error: databaseError,
    feeds,
  });
});
