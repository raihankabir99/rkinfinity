const MAX_TOKEN_LENGTH = 8192;

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders() });
}

export async function onRequestPost(context) {
  try {
    const { LIVEKIT_API_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = context.env;
    if (!LIVEKIT_API_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ error: "Attendance storage is not configured on the server." }, 500);
    }

    const body = await context.request.json();
    const action = typeof body?.action === "string" ? body.action : "";
    const auth = context.request.headers.get("Authorization") || "";
    const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!bearer || bearer.length > MAX_TOKEN_LENGTH) return json({ error: "Authorization required." }, 401);

    if (action === "history") {
      const moderator = await verifyModeratorToken(bearer, LIVEKIT_API_SECRET);
      if (!moderator || !moderator.room || !moderator.identity) return json({ error: "Moderator authorization required." }, 403);
      const rows = await supabaseRequest(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
        `classroom_attendance?room_name=eq.${encodeURIComponent(moderator.room)}&select=id,room_name,participant_identity,participant_name,joined_at,left_at&order=joined_at.asc`);
      return json({ records: rows.map((row) => ({
        identity: row.participant_identity,
        name: row.participant_name,
        joinedAt: Date.parse(row.joined_at),
        ...(row.left_at ? { leftAt: Date.parse(row.left_at) } : {}),
      })) });
    }

    const claims = await verifyLiveKitToken(bearer, LIVEKIT_API_SECRET);
    if (!claims) return json({ error: "Valid LiveKit participant token required." }, 403);
    const grant = claims.video || {};
    const room = typeof grant.room === "string" ? grant.room : "";
    const identity = typeof claims.sub === "string" ? claims.sub : "";
    const name = typeof claims.name === "string" && claims.name.trim() ? claims.name.trim().slice(0, 120) : identity;
    if (!grant.roomJoin || !room || !identity) return json({ error: "Token does not authorize a room participant." }, 403);

    if (action === "join") {
      const joinedAt = new Date().toISOString();
      await supabaseRequest(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, "classroom_attendance", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ room_name: room, participant_identity: identity, participant_name: name, joined_at: joinedAt }),
      });
      return json({ ok: true, joinedAt });
    }

    if (action === "leave") {
      const leftAt = new Date().toISOString();
      await supabaseRequest(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
        `classroom_attendance?room_name=eq.${encodeURIComponent(room)}&participant_identity=eq.${encodeURIComponent(identity)}&left_at=is.null&order=joined_at.desc&limit=1`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ left_at: leftAt }),
        });
      return json({ ok: true, leftAt });
    }

    return json({ error: "Unsupported attendance action." }, 400);
  } catch (error) {
    console.error("Classroom attendance request failed:", error);
    return json({ error: "Unable to process attendance." }, 500);
  }
}

async function verifyModeratorToken(token, secret) {
  if (!token || token.length > MAX_TOKEN_LENGTH) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadPart, signaturePart] = parts;
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const signature = Uint8Array.from(atob(signaturePart.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - signaturePart.length % 4) % 4)), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(payloadPart));
    if (!valid) return null;
    const payload = JSON.parse(decodeBase64Url(payloadPart));
    if (typeof payload.room !== "string" || !payload.room || typeof payload.identity !== "string" || !payload.identity ||
      !Number.isFinite(payload.exp) || payload.exp <= Date.now() / 1000) return null;
    return payload;
  } catch { return null; }
}

async function verifyLiveKitToken(token, secret) {
  const claims = await verifySignedToken(token, secret);
  if (!claims || !Number.isFinite(claims.exp) || claims.exp <= Date.now() / 1000) return null;
  return claims;
}

async function verifySignedToken(token, secret) {
  if (!token || token.length > MAX_TOKEN_LENGTH) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerPart, payloadPart, signaturePart] = parts;
  try {
    const header = JSON.parse(decodeBase64Url(headerPart));
    if (header.alg !== "HS256") return null;
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const signature = Uint8Array.from(atob(signaturePart.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - signaturePart.length % 4) % 4)), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(`${headerPart}.${payloadPart}`));
    if (!valid) return null;
    return JSON.parse(decodeBase64Url(payloadPart));
  } catch { return null; }
}

function decodeBase64Url(value) {
  return decodeURIComponent(escape(atob(value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4))));
}

async function supabaseRequest(baseUrl, serviceKey, path, options = {}) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error("Supabase attendance request failed:", response.status, detail.slice(0, 500));
    throw new Error("Attendance database request failed.");
  }
  if (response.status === 204 || response.headers.get("content-length") === "0") return [];
  const text = await response.text();
  return text ? JSON.parse(text) : [];
}

function corsHeaders() {
  return { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Cache-Control": "no-store" };
}
function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(), "Content-Type": "application/json; charset=utf-8" } });
}
