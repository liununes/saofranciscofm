import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "URL é obrigatória" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the page HTML with timeout
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

    // Extract meta tags with regex (no DOM parser in Deno)
    const getMeta = (property: string): string => {
      // Try og: tags
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
    // Make relative URLs absolute
    if (imagem && !imagem.startsWith("http")) {
      try {
        imagem = new URL(imagem, url).href;
      } catch { /* ignore */ }
    }

    let resumo = getMeta("og:description") || getMeta("description") || getMeta("twitter:description");

    let fonte = getMeta("og:site_name");
    if (!fonte) {
      try { fonte = new URL(url).hostname.replace("www.", ""); } catch { fonte = ""; }
    }

    let dataPublicacao = getMeta("article:published_time") || getMeta("datePublished") || getMeta("date");

    // If missing title/resumo, use AI to extract from first chunk of HTML
    if (!titulo || !resumo) {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (LOVABLE_API_KEY) {
        // Get text content (strip tags, limit size)
        const textOnly = html.replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 3000);

        try {
          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: "Extract news metadata from the given text. Return ONLY valid JSON with keys: titulo, resumo (max 200 chars). No markdown." },
                { role: "user", content: textOnly },
              ],
              tools: [{
                type: "function",
                function: {
                  name: "extract_metadata",
                  description: "Extract article title and summary",
                  parameters: {
                    type: "object",
                    properties: {
                      titulo: { type: "string", description: "Article title" },
                      resumo: { type: "string", description: "Short summary, max 200 chars" },
                    },
                    required: ["titulo", "resumo"],
                    additionalProperties: false,
                  },
                },
              }],
              tool_choice: { type: "function", function: { name: "extract_metadata" } },
            }),
          });

          if (aiResp.ok) {
            const aiData = await aiResp.json();
            const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
            if (toolCall?.function?.arguments) {
              const parsed = JSON.parse(toolCall.function.arguments);
              if (!titulo && parsed.titulo) titulo = parsed.titulo;
              if (!resumo && parsed.resumo) resumo = parsed.resumo;
            }
          }
        } catch (e) {
          console.error("AI extraction failed:", e);
        }
      }
    }

    return new Response(JSON.stringify({
      titulo: titulo.substring(0, 300),
      resumo: resumo.substring(0, 500),
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
