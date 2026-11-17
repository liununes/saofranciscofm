import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type FeedConfig = {
  url: string;
  name: string;
  scope: "regional" | "nacional";
};

const FEEDS: FeedConfig[] = [
  {
    url: "https://g1.globo.com/rss/g1/mg/vales-mg/",
    name: "G1 Vales de Minas Gerais",
    scope: "regional",
  },
  {
    url: "https://g1.globo.com/rss/g1/mg/grande-minas/",
    name: "G1 Grande Minas",
    scope: "regional",
  },
  {
    url: "https://g1.globo.com/rss/g1/",
    name: "G1",
    scope: "nacional",
  },
];

const clean = (value: string) =>
  value.replace(/<!\[CDATA\[|\]\]>/g, "").trim();

function nodeText(parent: Element, tag: string): string {
  return parent.getElementsByTagName(tag)[0]?.textContent?.trim() ?? "";
}

function htmlToText(value: string): string {
  const doc = new DOMParser().parseFromString(value, "text/html");
  return (doc.body?.textContent ?? value)
    .replace(/\s+/g, " ")
    .trim();
}

function validHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") &&
      !["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

function getImage(item: Element): string | null {
  const enclosure = item.querySelector('enclosure[type^="image/"]')?.getAttribute("url");
  const media = item.getElementsByTagName("media:content")[0]?.getAttribute("url") ??
    item.getElementsByTagName("media:thumbnail")[0]?.getAttribute("url");
  const candidate = enclosure || media;
  return candidate && validHttpUrl(candidate) ? candidate : null;
}

function getItems(xml: string): Element[] {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.querySelector("parsererror")) throw new Error("O feed RSS retornou XML inválido.");
  return Array.from(doc.getElementsByTagName("item"));
}

async function fetchFeed(feed: FeedConfig) {
  const response = await fetch(feed.url, {
    headers: { "User-Agent": "SaoFranciscoFM-NewsBot/1.0 (+https://saofranciscofm.com.br)" },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`${feed.name}: HTTP ${response.status}`);
  return getItems(await response.text()).map((item) => {
    const title = htmlToText(clean(nodeText(item, "title")));
    const link = nodeText(item, "link");
    const guid = nodeText(item, "guid") || link;
    const description = htmlToText(clean(
      nodeText(item, "description") ||
      nodeText(item, "content:encoded"),
    ));
    const rawDate = nodeText(item, "pubDate");
    const publishedAt = rawDate ? new Date(rawDate) : new Date();
    return {
      title,
      link,
      guid: guid.slice(0, 1800),
      summary: description.slice(0, 360),
      image: getImage(item),
      publishedAt: Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
      feed,
    };
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Método não permitido." }, { status: 405 });
  }

  const expectedSecret = Deno.env.get("NEWS_CRON_SECRET");
  const receivedSecret = req.headers.get("x-news-cron-secret");
  if (!expectedSecret || !receivedSecret || receivedSecret !== expectedSecret) {
    return Response.json({ error: "Não autorizado." }, { status: 401 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ error: "Configuração do banco incompleta." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const startedAt = new Date();
  const results: Array<{ feed: string; imported: number; skipped: number; error?: string }> = [];
  let importedTotal = 0;

  for (const feed of FEEDS) {
    try {
      const items = await fetchFeed(feed);
      let imported = 0;
      let skipped = 0;

      for (const item of items) {
        if (!item.title || !validHttpUrl(item.link)) {
          skipped++;
          continue;
        }

        // Evita importar notícias antigas no primeiro processamento e em falhas prolongadas.
        const ageHours = (Date.now() - item.publishedAt.getTime()) / 3600000;
        if (ageHours > 48 || ageHours < -2) {
          skipped++;
          continue;
        }

        const { data: existing } = await supabase
          .from("noticias")
          .select("id")
          .eq("rss_guid", item.guid)
          .maybeSingle();

        if (existing) {
          skipped++;
          continue;
        }

        const summary = item.summary || item.title;
        const { error } = await supabase.from("noticias").insert({
          titulo: item.title.slice(0, 250),
          resumo: summary.slice(0, 500),
          conteudo: summary,
          link_completo: item.link,
          imagem_url: item.image,
          fonte: feed.name,
          origem_rss: true,
          rss_guid: item.guid,
          abrangencia: feed.scope,
          created_at: item.publishedAt.toISOString(),
        });

        if (error) {
          // Unique index protege contra duplicidade mesmo se duas execuções coincidirem.
          if (error.code === "23505") {
            skipped++;
            continue;
          }
          throw error;
        }
        imported++;
        importedTotal++;
      }

      results.push({ feed: feed.name, imported, skipped });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Falha no feed", feed.name, message);
      results.push({ feed: feed.name, imported: 0, skipped: 0, error: message });
    }
  }

  return Response.json({
    ok: results.every((item) => !item.error),
    started_at: startedAt.toISOString(),
    imported: importedTotal,
    feeds: results,
  });
});
