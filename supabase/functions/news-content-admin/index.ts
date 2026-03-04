import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const isDateActive = (start?: string | null, end?: string | null, today?: string) => {
  const current = today || new Date().toISOString().slice(0, 10);
  if (start && start > current) return false;
  if (end && end < current) return false;
  return true;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Falta configuração no servidor (env vars)" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    const requireAuth = async () => {
      const { data: { user }, error } = await supabaseUserClient.auth.getUser();
      if (error || !user) {
        return { ok: false as const, response: new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }) };
      }
      return { ok: true as const };
    };

    if (action === "list_admin") {
      const auth = await requireAuth();
      if (!auth.ok) return auth.response;

      const { data, error } = await supabaseAdmin
        .from("publicidade_noticias")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ items: data || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create") {
      const auth = await requireAuth();
      if (!auth.ok) return auth.response;

      const payload = body?.payload || {};
      const { data, error } = await supabaseAdmin
        .from("publicidade_noticias")
        .insert({
          nome: payload.nome ?? "Nova Publicidade",
          texto: payload.texto ?? "",
          ativo: payload.ativo ?? true,
          imagem_url: payload.imagem_url ?? null,
          link: payload.link ?? "",
          data_inicio: payload.data_inicio ?? null,
          data_fim: payload.data_fim ?? null,
        })
        .select("*")
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ item: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update") {
      const auth = await requireAuth();
      if (!auth.ok) return auth.response;

      const id = body?.id;
      const payload = body?.payload || {};
      if (!id) throw new Error("ID é obrigatório");

      const { data, error } = await supabaseAdmin
        .from("publicidade_noticias")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ item: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const auth = await requireAuth();
      if (!auth.ok) return auth.response;

      const id = body?.id;
      if (!id) throw new Error("ID é obrigatório");

      const { error } = await supabaseAdmin
        .from("publicidade_noticias")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "resolve_for_news") {
      const noticiaId = body?.noticia_id;
      if (!noticiaId) {
        return new Response(JSON.stringify({ noticia: null, ad: null }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const today = new Date().toISOString().slice(0, 10);
      const { data: noticia } = await supabasePublic
        .from("noticias")
        .select("id, publicidade_ativa, publicidade_id, promocao_id")
        .eq("id", noticiaId)
        .maybeSingle();

      let ad: Record<string, unknown> | null = null;

      if (noticia?.publicidade_ativa) {
        if (noticia.publicidade_id) {
          const { data: pub } = await supabasePublic
            .from("publicidade_noticias")
            .select("*")
            .eq("id", noticia.publicidade_id)
            .eq("ativo", true)
            .maybeSingle();

          if (pub && isDateActive(pub.data_inicio, pub.data_fim, today)) {
            ad = pub as Record<string, unknown>;
          }
        }

        if (!ad && noticia.promocao_id) {
          const { data: promo } = await supabasePublic
            .from("promocoes")
            .select("*")
            .eq("id", noticia.promocao_id)
            .eq("ativo", true)
            .maybeSingle();

          const promoEnd = promo?.prorrogada_ate || promo?.data_validade;
          if (promo && isDateActive(promo.data_inicio, promoEnd, today)) {
            ad = { ...promo, is_promotion: true } as Record<string, unknown>;
          }
        }
      }

      if (!ad) {
        const { data: activeAds } = await supabasePublic
          .from("publicidade_noticias")
          .select("*")
          .eq("ativo", true);

        const validAds = (activeAds || []).filter((item: any) => isDateActive(item.data_inicio, item.data_fim, today));
        if (validAds.length > 0) {
          ad = validAds[Math.floor(Math.random() * validAds.length)] as Record<string, unknown>;
        }
      }

      return new Response(JSON.stringify({ noticia: noticia || null, ad }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("news-content-admin error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro interno",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
