import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(JSON.stringify({ error: 'Falta configuração no servidor (env vars)' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cliente para verificar autenticação do usuário
    const authHeader = req.headers.get("Authorization");
    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    // Cliente administrativo para bypass de RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser();

    if (userError || !user) {
      console.error('Auth check failed:', userError);
      return new Response(JSON.stringify({ error: "Não autenticado", details: userError }), {
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

      // Verificar se proxy já existe (usando Admin para garantir que vemos tudo)
      const { data: existing } = await supabaseAdmin
        .from("publicidade_noticias")
        .select("id")
        .eq("codigo", codigoProxy)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify(existing), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Buscar detalhes da promoção
      const { data: promo } = await supabaseAdmin.from("promocoes").select("nome").eq("id", promocaoId).single();

      // Criar o proxy
      const { data: newProxy, error: proxyErr } = await supabaseAdmin
        .from("publicidade_noticias")
        .insert({
          nome: `🎁 [Promoção] ${promo?.nome || promocaoId}`,
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
      const id = body?.id;
      if (!id) throw new Error("ID é obrigatório");

      const { error } = await supabaseAdmin.from("publicidade_noticias").delete().eq("id", id);
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
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro interno",
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
