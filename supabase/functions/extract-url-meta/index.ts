import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "URL é obrigatória" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SSRF protection: validate URL protocol and block private/internal addresses
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return new Response(JSON.stringify({ error: "URL inválida" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return new Response(JSON.stringify({ error: "Apenas URLs HTTP/HTTPS são permitidas" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hostname = parsed.hostname;
    const privatePattern = /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|169\.254\.|0\.|localhost|::1|\[::1\])/i;
    if (privatePattern.test(hostname)) {
      return new Response(JSON.stringify({ error: "Endereços internos não são permitidos" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let html: string;
    try {
      const resp = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; RadioBot/1.0)" },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      html = await resp.text();
    } catch (e) {
      clearTimeout(timeout);
      const msg = e instanceof Error && e.name === "AbortError" ? "Timeout ao acessar a URL" : `Erro ao acessar: ${e instanceof Error ? e.message : "desconhecido"}`;
      return new Response(JSON.stringify({ error: msg }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    clearTimeout(timeout);

    const getMeta = (property: string): string => {
      const ogMatch = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"))
        || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, "i"));
      return ogMatch?.[1] || "";
    };

    let titulo = getMeta("og:title") || getMeta("twitter:title");
    if (!titulo) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      titulo = titleMatch?.[1]?.trim() || "";
    }

    let imagem = getMeta("og:image") || getMeta("twitter:image");
    if (imagem && !imagem.startsWith("http")) {
      try { imagem = new URL(imagem, url).href; } catch { /* ignore */ }
    }

    let resumo = getMeta("og:description") || getMeta("description") || getMeta("twitter:description");

    let fonte = getMeta("og:site_name");
    if (!fonte) {
      try { fonte = new URL(url).hostname.replace("www.", ""); } catch { fonte = ""; }
    }

    let dataPublicacao = getMeta("article:published_time") || getMeta("datePublished") || getMeta("date");

    // Extract full article body text
    let conteudo = "";
    // Try to get article/main content
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
      || html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
      || html.match(/<div[^>]*class="[^"]*(?:article|content|post|entry|materia|noticia)[^"]*"[^>]*>([\s\S]*?)<\/div>/i);

    if (articleMatch) {
      conteudo = articleMatch[1]
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<nav[\s\S]*?<\/nav>/gi, "")
        .replace(/<header[\s\S]*?<\/header>/gi, "")
        .replace(/<footer[\s\S]*?<\/footer>/gi, "")
        .replace(/<aside[\s\S]*?<\/aside>/gi, "")
        .replace(/<figure[\s\S]*?<\/figure>/gi, "")
        .replace(/<img[^>]*>/gi, "")
        .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "$2")
        .replace(/<\/?(?:div|span|section|p|br|h[1-6]|ul|ol|li|blockquote|em|strong|b|i)[^>]*>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]+/g, " ")
        .trim();
    }

    // If missing title/resumo/conteudo, try simple text extraction fallback
    if (!titulo || !resumo || !conteudo) {
      const textOnly = html.replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 6000);

      if (!titulo) {
        const firstSentence = textOnly.substring(0, 200).split(/[.!?]/)[0];
        titulo = firstSentence || "Notícia";
      }
      if (!resumo) {
        resumo = textOnly.substring(0, 200);
      }
      if (!conteudo) {
        conteudo = textOnly;
      }
    }

    return new Response(JSON.stringify({
      titulo: titulo.substring(0, 300),
      resumo: resumo.substring(0, 500),
      conteudo: conteudo.substring(0, 10000),
      imagem,
      fonte,
      data_publicacao: dataPublicacao,
      url,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-url-meta error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
