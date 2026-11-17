import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GRAPH_API_VERSION = "v27.0";
const MAX_MEDIA = 25;
const MAX_AGE_HOURS = 48;

type InstagramMedia = {
  id: string;
  caption?: string;
  media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  permalink?: string;
  timestamp?: string;
  media_url?: string;
  thumbnail_url?: string;
};

function isHttpsUrl(value?: string): boolean {
  if (!value) return false;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

function isInstagramPermalink(value?: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      (url.hostname === "instagram.com" || url.hostname.endsWith(".instagram.com"));
  } catch { return false; }
}

function safeMetaError(payload: any) {
  return {
    message: payload?.error?.message || "A Meta retornou um erro sem mensagem.",
    type: payload?.error?.type || null,
    code: payload?.error?.code ?? null,
    subcode: payload?.error?.error_subcode ?? null,
  };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Método não permitido." }, { status: 405 });
  }

  const expected = Deno.env.get("NEWS_CRON_SECRET");
  if (!expected || req.headers.get("x-news-cron-secret") !== expected) {
    return Response.json({ error: "Não autorizado." }, { status: 401 });
  }

  const token = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
  const igUserId = Deno.env.get("INSTAGRAM_USER_ID") || "17841412469890198";
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!token || !supabaseUrl || !serviceRoleKey) {
    return Response.json({
      ok: false,
      stage: "configuration",
      error: "Configure INSTAGRAM_ACCESS_TOKEN, SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.",
    }, { status: 500 });
  }

  try {
    const mediaUrl = new URL(`https://graph.facebook.com/${GRAPH_API_VERSION}/${encodeURIComponent(igUserId)}/media`);
    mediaUrl.searchParams.set(
      "fields",
      "id,caption,media_type,permalink,timestamp,media_url,thumbnail_url",
    );
    mediaUrl.searchParams.set("limit", String(MAX_MEDIA));
    mediaUrl.searchParams.set("access_token", token);

    const response = await fetch(mediaUrl, { signal: AbortSignal.timeout(20000) });
    const payload = await response.json();
    if (!response.ok) {
      return Response.json({
        ok: false,
        stage: "instagram_media",
        http_status: response.status,
        error: safeMetaError(payload),
      }, { status: 502 });
    }

    const now = Date.now();
    const cutoff = now - MAX_AGE_HOURS * 60 * 60 * 1000;
    const media: InstagramMedia[] = Array.isArray(payload.data) ? payload.data : [];
    const recent = media.filter((item) => {
      const published = item.timestamp ? new Date(item.timestamp).getTime() : NaN;
      return Boolean(item.id) && isInstagramPermalink(item.permalink) &&
        Number.isFinite(published) && published >= cutoff && published <= now + 5 * 60 * 1000;
    });

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const externalIds = recent.map((item) => `instagram:${item.id}`);
    let known = new Set<string>();
    if (externalIds.length) {
      const { data, error } = await supabase
        .from("noticias")
        .select("rss_guid")
        .in("rss_guid", externalIds);
      if (error) {
        return Response.json({ ok: false, stage: "database_lookup", error: error.message }, { status: 500 });
      }
      known = new Set((data ?? []).map((row) => row.rss_guid));
    }

    const rows = recent.filter((item) => !known.has(`instagram:${item.id}`)).map((item) => {
      const caption = (item.caption || "Publicação da Rádio São Francisco FM no Instagram.").trim();
      const image = item.media_type === "VIDEO"
        ? (item.thumbnail_url || item.media_url)
        : (item.media_url || item.thumbnail_url);
      return {
        titulo: caption.replace(/\\s+/g, " ").slice(0, 250) || "Publicação da Rádio São Francisco FM",
        resumo: caption.slice(0, 360),
        conteudo: caption,
        link_completo: item.permalink,
        imagem_url: isHttpsUrl(image) ? image : null,
        fonte: "Instagram · @radiosaofranciscofm",
        origem_rss: false,
        rss_guid: `instagram:${item.id}`,
        abrangencia: "Itambacuri e região",
        created_at: new Date(item.timestamp!).toISOString(),
      };
    });

    let imported = 0;
    if (rows.length) {
      const { data, error } = await supabase.from("noticias").insert(rows).select("id");
      if (error) {
        return Response.json({ ok: false, stage: "database_insert", error: error.message }, { status: 500 });
      }
      imported = data?.length ?? rows.length;
    }

    return Response.json({
      ok: true,
      profile_id: igUserId,
      media_received: media.length,
      recent_media: recent.length,
      imported,
      already_imported: recent.length - rows.length,
      window_hours: MAX_AGE_HOURS,
    });
  } catch (error) {
    return Response.json({
      ok: false,
      stage: "network",
      error: error instanceof Error ? error.message : "Falha inesperada na coleta do Instagram.",
    }, { status: 502 });
  }
});
