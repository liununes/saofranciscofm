import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    console.log('news-ads-admin invoked', { method: req.method });
    console.log('request headers', Object.fromEntries(req.headers.entries()));

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
      return new Response(JSON.stringify({ error: 'Server misconfiguration: missing env vars' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    let user: any = null;
    let authErrorDetails: any = null;
    try {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        console.warn('No Authorization header provided');
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.warn('supabase.auth.getUser returned error', userError);
        authErrorDetails = userError;
      }
      user = userData?.user ?? null;
    } catch (authErr) {
      console.error('auth.getUser critical failure', authErr instanceof Error ? authErr.message : String(authErr));
      authErrorDetails = authErr;
    }

    if (!user) {
      console.error('Authentication check failed - user is null');
      return new Response(JSON.stringify({
        error: "Não autenticado",
        details: authErrorDetails,
        debug: "Check if Authorization header is being sent correctly from the frontend."
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const action = body?.action;

    if (action === "create_proxy") {
      const promocaoId = body?.promocao_id;
      if (!promocaoId) throw new Error("Missing promocao_id");

      const codigoProxy = `PROMO:${promocaoId}`;

      // Check if proxy already exists
      const { data: existing } = await supabase
        .from("publicidade_noticias")
        .select("id")
        .eq("codigo", codigoProxy)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify(existing), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch promo details to mirror its name
      const { data: promo } = await supabase.from("promocoes").select("nome").eq("id", promocaoId).single();

      // Create it
      const { data: newProxy, error: proxyErr } = await supabase
        .from("publicidade_noticias")
        .insert({
          nome: `[PROXY] ${promo?.nome || promocaoId}`,
          ativo: true,
          codigo: codigoProxy,
        })
        .select("id")
        .single();

      if (proxyErr) throw proxyErr;

      return new Response(JSON.stringify(newProxy), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list") {
      const { data, error } = await supabase
        .from("publicidade_noticias")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ items: data || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create") {
      const payload = body?.payload || {};
      const { data, error } = await supabase
        .from("publicidade_noticias")
        .insert({
          nome: payload.nome ?? "Nova Publicidade",
          texto: payload.texto ?? "",
          ativo: payload.ativo ?? true,
          imagem_url: payload.imagem_url ?? null,
          link: payload.link ?? "",
          data_inicio: payload.data_inicio ?? null,
          data_fim: payload.data_fim ?? null,
          codigo: payload.codigo ?? null,
        })
        .select("*")
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ item: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update") {
      const id = body?.id;
      const payload = body?.payload || {};

      if (!id) {
        return new Response(JSON.stringify({ error: "ID é obrigatório" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
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
      const id = body?.id;
      if (!id) {
        return new Response(JSON.stringify({ error: "ID é obrigatório" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase.from("publicidade_noticias").delete().eq("id", id);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("news-ads-admin error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
