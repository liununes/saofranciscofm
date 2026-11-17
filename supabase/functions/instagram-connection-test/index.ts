Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Método não permitido." }, { status: 405 });

  const expected = Deno.env.get("NEWS_CRON_SECRET");
  if (!expected || req.headers.get("x-news-cron-secret") !== expected) {
    return Response.json({ error: "Não autorizado." }, { status: 401 });
  }

  const token = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
  const igUserId = Deno.env.get("INSTAGRAM_USER_ID") || "17841412469890198";
  if (!token) return Response.json({ ok: false, stage: "configuration", error: "INSTAGRAM_ACCESS_TOKEN não configurado." }, { status: 500 });

  const base = "https://graph.facebook.com/v27.0";
  const safeError = (payload: any) => ({
    message: payload?.error?.message || "A Meta retornou um erro sem mensagem.",
    type: payload?.error?.type || null,
    code: payload?.error?.code ?? null,
    subcode: payload?.error?.error_subcode ?? null,
  });

  try {
    const profileUrl = new URL(`${base}/${encodeURIComponent(igUserId)}`);
    profileUrl.searchParams.set("fields", "id,username,account_type");
    profileUrl.searchParams.set("access_token", token);
    const profileResponse = await fetch(profileUrl, { signal: AbortSignal.timeout(15000) });
    const profile = await profileResponse.json();
    if (!profileResponse.ok) {
      return Response.json({ ok: false, stage: "profile", http_status: profileResponse.status, error: safeError(profile) }, { status: 200 });
    }

    const mediaUrl = new URL(`${base}/${encodeURIComponent(igUserId)}/media`);
    mediaUrl.searchParams.set("fields", "id,caption,media_type,permalink,timestamp,media_url,thumbnail_url");
    mediaUrl.searchParams.set("limit", "5");
    mediaUrl.searchParams.set("access_token", token);
    const mediaResponse = await fetch(mediaUrl, { signal: AbortSignal.timeout(15000) });
    const media = await mediaResponse.json();
    if (!mediaResponse.ok) {
      return Response.json({
        ok: false, stage: "media", http_status: mediaResponse.status,
        profile: { id: profile.id, username: profile.username, account_type: profile.account_type },
        error: safeError(media),
      }, { status: 200 });
    }

    return Response.json({
      ok: true,
      profile: { id: profile.id, username: profile.username, account_type: profile.account_type },
      media_count_returned: Array.isArray(media.data) ? media.data.length : 0,
      latest_media: (media.data || []).map((item: any) => ({
        id: item.id, caption: item.caption || "", media_type: item.media_type || null,
        permalink: item.permalink || null, timestamp: item.timestamp || null,
      })),
    });
  } catch (error) {
    return Response.json({
      ok: false, stage: "network",
      error: error instanceof Error ? error.message : "Falha de comunicação com a Meta.",
    }, { status: 200 });
  }
});