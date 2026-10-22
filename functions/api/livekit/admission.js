import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
const MAX_TOKEN_LENGTH = 8192;

export async function onRequestOptions() { return new Response(null, { headers: corsHeaders() }); }

export async function onRequestPost(context) {
  try {
    const { LIVEKIT_API_KEY: apiKey, LIVEKIT_API_SECRET: apiSecret, LIVEKIT_URL: livekitUrl, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = context.env;
    if (!apiKey || !apiSecret || !livekitUrl || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return json({ error: "Waiting room is not configured on the server." }, 500);
    const body = await context.request.json();
    const action = typeof body?.action === "string" ? body.action : "";
    const roomService = new RoomServiceClient(livekitUrl.replace(/^wss:/, "https:").replace(/^ws:/, "http:"), apiKey, apiSecret);

    if (action === "request") {
      const room = typeof body.room === "string" ? body.room.trim() : "";
      const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
      if (!room || room.length > 120 || !name) return json({ error: "A valid room and display name are required." }, 400);
      const rooms = await roomService.listRooms([room]);
      const existing = rooms[0];
      if (!existing) return json({ error: "Room not found. Ask the host for a current invite link." }, 404);
      let metadata = {};
      try { metadata = existing.metadata ? JSON.parse(existing.metadata) : {}; } catch { return json({ error: "Room metadata is invalid." }, 500); }
      if (metadata.locked) return json({ error: "This room is locked by its moderator." }, 403);
      const identity = "rkInfinity-" + crypto.randomUUID();
      if (metadata.waitingRoom !== true) return issueParticipantToken({ room, name, identity, apiKey, apiSecret, livekitUrl });
      const rows = await supabaseRequest(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, "classroom_admission_requests", {
        method: "POST", headers: { Prefer: "return=representation" },
        body: JSON.stringify([{ room_name: room, participant_identity: identity, participant_name: name, status: "pending" }]),
      });
      const request = rows[0];
      if (!request?.id) return json({ error: "Unable to create an admission request." }, 500);
      const requestToken = await signToken({ requestId: request.id, room, identity, name, exp: Math.floor(Date.now() / 1000) + 3600 }, apiSecret);
      return json({ waiting: true, requestId: request.id, requestToken, status: "pending" }, 202);
    }

    if (action === "status") {
      const requestToken = getBearer(context.request);
      const claims = await verifySignedToken(requestToken, apiSecret);
      if (!claims || !claims.requestId || !claims.room || !claims.identity || claims.exp <= Date.now() / 1000) return json({ error: "Valid admission request token required." }, 401);
      const rows = await supabaseRequest(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
        "classroom_admission_requests?id=eq." + encodeURIComponent(claims.requestId) + "&room_name=eq." + encodeURIComponent(claims.room) + "&participant_identity=eq." + encodeURIComponent(claims.identity) + "&select=id,status,participant_name&limit=1");
      if (!rows.length) return json({ error: "Admission request not found." }, 404);
      if (rows[0].status === "pending") return json({ status: "pending" });
      if (rows[0].status === "rejected") return json({ status: "rejected" });
      return issueParticipantToken({ room: claims.room, name: rows[0].participant_name, identity: claims.identity, apiKey, apiSecret, livekitUrl });
    }

    const moderator = await verifyModeratorToken(getBearer(context.request), apiSecret);
    if (!moderator) return json({ error: "Moderator authorization required." }, 403);
    const rooms = await roomService.listRooms([moderator.room]);
    const liveRoom = rooms[0];
    if (!liveRoom) return json({ error: "Room no longer exists." }, 404);
    let metadata = {};
    try { metadata = liveRoom.metadata ? JSON.parse(liveRoom.metadata) : {}; } catch { return json({ error: "Room metadata is invalid." }, 500); }
    if (metadata.ownerIdentity !== moderator.identity) return json({ error: "You are not the owner of this room." }, 403);

    if (action === "pending") {
      const rows = await supabaseRequest(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
        "classroom_admission_requests?room_name=eq." + encodeURIComponent(moderator.room) + "&status=eq.pending&select=id,participant_name,created_at&order=created_at.asc&limit=50");
      return json({ requests: rows.map((row) => ({ id: row.id, name: row.participant_name, createdAt: row.created_at })) });
    }
    if (action === "approve" || action === "reject") {
      const requestId = typeof body.requestId === "string" ? body.requestId : "";
      if (!/^[0-9a-f-]{36}$/i.test(requestId)) return json({ error: "A valid request ID is required." }, 400);
      const rows = await supabaseRequest(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
        "classroom_admission_requests?id=eq." + encodeURIComponent(requestId) + "&room_name=eq." + encodeURIComponent(moderator.room) + "&status=eq.pending", {
          method: "PATCH", headers: { Prefer: "return=representation" },
          body: JSON.stringify({ status: action === "approve" ? "approved" : "rejected", decided_at: new Date().toISOString(), decided_by: moderator.identity }),
        });
      if (!rows.length) return json({ error: "Request was already handled or does not belong to this room." }, 409);
      return json({ ok: true, status: rows[0].status });
    }
    return json({ error: "Unsupported waiting room action." }, 400);
  } catch (error) {
    console.error("Waiting room request failed:", error);
    return json({ error: "Unable to process waiting room request." }, 500);
  }
}

async function issueParticipantToken({ room, name, identity, apiKey, apiSecret, livekitUrl }) {
  const token = new AccessToken(apiKey, apiSecret, { identity, name, ttl: "2h" });
  token.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true, canPublishData: true });
  return json({ token: await token.toJwt(), url: livekitUrl, room, role: "participant" });
}
async function signToken(payload, secret) {
  const encoded = base64Url(JSON.stringify(payload));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encoded)));
  return encoded + "." + bytesToBase64Url(signature);
}
async function verifySignedToken(token, secret) {
  if (!token || token.length > MAX_TOKEN_LENGTH) return null;
  const parts = token.split("."); if (parts.length !== 2) return null;
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const signature = base64UrlToBytes(parts[1]);
    if (!await crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(parts[0]))) return null;
    return JSON.parse(decodeBase64Url(parts[0]));
  } catch { return null; }
}
async function verifyModeratorToken(token, secret) {
  const claims = await verifySignedToken(token, secret);
  if (!claims || typeof claims.room !== "string" || typeof claims.identity !== "string" || !Number.isFinite(claims.exp) || claims.exp <= Date.now() / 1000) return null;
  return claims;
}
function getBearer(request) { const auth = request.headers.get("Authorization") || ""; return auth.startsWith("Bearer ") ? auth.slice(7) : ""; }
function base64Url(value) { return btoa(unescape(encodeURIComponent(value))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_"); }
function bytesToBase64Url(bytes) { return btoa(String.fromCharCode(...bytes)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_"); }
function decodeBase64Url(value) { return decodeURIComponent(escape(atob(value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4)))); }
function base64UrlToBytes(value) { return Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4)), (c) => c.charCodeAt(0)); }
async function supabaseRequest(baseUrl, serviceKey, path, options = {}) {
  const response = await fetch(baseUrl.replace(/\/$/, "") + "/rest/v1/" + path, { ...options, headers: { apikey: serviceKey, Authorization: "Bearer " + serviceKey, "Content-Type": "application/json", ...(options.headers || {}) } });
  if (!response.ok) { const detail = await response.text(); console.error("Waiting room database request failed:", response.status, detail.slice(0, 300)); throw new Error("Waiting room database request failed."); }
  if (response.status === 204 || response.headers.get("content-length") === "0") return [];
  const text = await response.text(); return text ? JSON.parse(text) : [];
}
function corsHeaders() { return { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Cache-Control": "no-store" }; }
function json(body, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(), "Content-Type": "application/json; charset=utf-8" } }); }