import { RoomServiceClient } from "livekit-server-sdk";

export async function onRequestOptions() { return new Response(null, { headers: corsHeaders() }); }

export async function onRequestPost(context) {
  try {
    const { LIVEKIT_API_KEY: apiKey, LIVEKIT_API_SECRET: apiSecret, LIVEKIT_URL: livekitUrl, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = context.env;
    if (!apiKey || !apiSecret || !livekitUrl || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return json({ error: "Meeting scheduling is not configured on the server." }, 500);
    const moderator = await verifyModeratorToken(getBearer(context.request), apiSecret);
    if (!moderator) return json({ error: "Valid room moderator authorization is required." }, 403);
    const roomService = new RoomServiceClient(livekitUrl.replace(/^wss:/, "https:").replace(/^ws:/, "http:"), apiKey, apiSecret);
    const liveRooms = await roomService.listRooms([moderator.room]);
    if (!liveRooms[0]) return json({ error: "This room no longer exists." }, 404);
    let metadata = {};
    try { metadata = liveRooms[0].metadata ? JSON.parse(liveRooms[0].metadata) : {}; } catch { return json({ error: "Room metadata is invalid." }, 500); }
    if (metadata.ownerIdentity !== moderator.identity) return json({ error: "Only this room creator can manage its schedule." }, 403);
    const { SUPABASE_URL: baseUrl, SUPABASE_SERVICE_ROLE_KEY: serviceKey } = context.env;
    const parsed = await readLimitedJson(context.request, 8000);
    if (parsed.error) return json({ error: parsed.error }, parsed.status);
    const body = parsed.body;
    const action = typeof body?.action === "string" ? body.action : "";
    if (action === "list") {
      const rows = await supabaseRequest(baseUrl, serviceKey, "classroom_scheduled_meetings?room_name=eq." + encodeURIComponent(moderator.room) + "&owner_identity=eq." + encodeURIComponent(moderator.identity) + "&cancelled_at=is.null&select=id,title,starts_at,ends_at,created_at&order=starts_at.asc&limit=50");
      return json({ meetings: rows });
    }
    if (action === "create") {
      const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
      const startsAt = typeof body.startsAt === "string" ? Date.parse(body.startsAt) : NaN;
      const endsAt = typeof body.endsAt === "string" ? Date.parse(body.endsAt) : NaN;
      const now = Date.now();
      if (!title) return json({ error: "Enter a meeting title." }, 400);
      if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt) || startsAt < now + 60_000 || startsAt > now + 90 * 24 * 60 * 60 * 1000 || endsAt <= startsAt || endsAt - startsAt > 8 * 60 * 60 * 1000) return json({ error: "Choose a start time at least 1 minute ahead, within 90 days, and a duration up to 8 hours." }, 400);
      const rows = await supabaseRequest(baseUrl, serviceKey, "classroom_scheduled_meetings", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify([{ room_name: moderator.room, owner_identity: moderator.identity, title, starts_at: new Date(startsAt).toISOString(), ends_at: new Date(endsAt).toISOString() }]) });
      if (!rows[0]?.id) return json({ error: "Unable to save this meeting." }, 500);
      return json({ meeting: rows[0] }, 201);
    }
    if (action === "cancel") {
      const id = typeof body.id === "string" ? body.id : "";
      if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "A valid meeting ID is required." }, 400);
      const rows = await supabaseRequest(baseUrl, serviceKey, "classroom_scheduled_meetings?id=eq." + encodeURIComponent(id) + "&room_name=eq." + encodeURIComponent(moderator.room) + "&owner_identity=eq." + encodeURIComponent(moderator.identity) + "&cancelled_at=is.null", { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ cancelled_at: new Date().toISOString() }) });
      if (!rows.length) return json({ error: "Meeting was already cancelled or does not belong to this room." }, 409);
      return json({ ok: true });
    }
    return json({ error: "Unsupported scheduling action." }, 400);
  } catch (error) {
    console.error("Meeting schedule request failed:", error);
    return json({ error: "Unable to process meeting schedule request." }, 500);
  }
}

async function verifyModeratorToken(token, secret) {
  if (!token || token.length > 8192) return null;
  const parts = token.split("."); if (parts.length !== 2) return null;
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const signature = base64UrlToBytes(parts[1]);
    if (!await crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(parts[0]))) return null;
    const claims = JSON.parse(decodeBase64Url(parts[0]));
    if (typeof claims.room !== "string" || typeof claims.identity !== "string" || !Number.isFinite(claims.exp) || claims.exp <= Date.now() / 1000) return null;
    return claims;
  } catch { return null; }
}
function getBearer(request) { const auth = request.headers.get("Authorization") || ""; return auth.startsWith("Bearer ") ? auth.slice(7) : ""; }
function decodeBase64Url(value) { return decodeURIComponent(escape(atob(value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4)))); }
function base64UrlToBytes(value) { return Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4)), (c) => c.charCodeAt(0)); }
async function supabaseRequest(baseUrl, serviceKey, path, options = {}) {
  const response = await fetch(baseUrl.replace(/\/$/, "") + "/rest/v1/" + path, { ...options, headers: { apikey: serviceKey, Authorization: "Bearer " + serviceKey, "Content-Type": "application/json", ...(options.headers || {}) } });
  if (!response.ok) { const detail = await response.text(); console.error("Meeting schedule database request failed:", response.status, detail.slice(0, 300)); throw new Error("Meeting schedule database request failed."); }
  if (response.status === 204 || response.headers.get("content-length") === "0") return [];
  const text = await response.text(); return text ? JSON.parse(text) : [];
}
function corsHeaders() { return { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Cache-Control": "no-store" }; }
function json(body, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(), "Content-Type": "application/json; charset=utf-8" } }); }

async function readLimitedJson(request, maxBytes) {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > maxBytes) return { error: "Request body is too large.", status: 413 };
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) return { error: "Request body is too large.", status: 413 };
  try { return { body: JSON.parse(raw) }; }
  catch { return { error: "Invalid JSON body.", status: 400 }; }
}
