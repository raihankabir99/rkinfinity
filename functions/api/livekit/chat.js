const MAX_TOKEN_LENGTH = 8192;
const MAX_BODY_BYTES = 12_000;

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders() });
}

export async function onRequestPost(context) {
  try {
    const { LIVEKIT_API_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = context.env;
    if (!LIVEKIT_API_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ error: "Room chat storage is not configured on the server." }, 500);
    }
    const length = Number(context.request.headers.get("content-length") || 0);
    if (length > MAX_BODY_BYTES) return json({ error: "Request body is too large." }, 413);
    const raw = await context.request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json({ error: "Request body is too large." }, 413);
    let body;
    try { body = JSON.parse(raw); } catch { return json({ error: "Invalid JSON body." }, 400); }

    const auth = context.request.headers.get("Authorization") || "";
    const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const claims = await verifyLiveKitToken(bearer, LIVEKIT_API_SECRET);
    if (!claims) return json({ error: "Valid LiveKit participant token required." }, 401);
    const grant = claims.video || {};
    const room = typeof grant.room === "string" ? grant.room : "";
    const identity = typeof claims.sub === "string" ? claims.sub : "";
    const name = typeof claims.name === "string" && claims.name.trim() ? claims.name.trim().slice(0, 120) : identity;
    if (!grant.roomJoin || !room || !identity) return json({ error: "Token does not authorize a room participant." }, 403);

    const action = typeof body?.action === "string" ? body.action : "";
    if (action === "history") {
      const limit = Number.isInteger(body.limit) ? Math.min(50, Math.max(1, body.limit)) : 30;
      const before = typeof body.before === "string" && Number.isFinite(Date.parse(body.before))
        ? body.before : null;
      const filters = [
        `room_name=eq.${encodeURIComponent(room)}`,
        `or=(recipient_identity.is.null,recipient_identity.eq.${encodeURIComponent(identity)},sender_identity.eq.${encodeURIComponent(identity)})`,
        "select=id,room_name,client_message_id,sender_identity,sender_name,recipient_identity,content,created_at",
        "order=created_at.desc,id.desc",
        `limit=${limit + 1}`,
      ];
      if (before) filters.push(`created_at=lt.${encodeURIComponent(before)}`);
      const rows = await supabaseRequest(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, `classroom_chat_messages?${filters.join("&")}`);
      const hasMore = rows.length > limit;
      const page = rows.slice(0, limit).reverse();
      return json({ messages: page.map(toClientMessage), hasMore });
    }

    if (action === "send") {
      const id = typeof body.clientMessageId === "string" ? body.clientMessageId : "";
      const content = typeof body.content === "string" ? body.content.trim() : "";
      const recipient = body.recipientIdentity == null ? null :
        (typeof body.recipientIdentity === "string" ? body.recipientIdentity.trim() : "");
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        return json({ error: "A valid client message ID is required." }, 400);
      }
      if (!content || content.length > 4000) return json({ error: "Message must be between 1 and 4000 characters." }, 400);
      if (recipient === "" || (recipient && (recipient.length > 200 || recipient === identity))) {
        return json({ error: "Invalid private-message recipient." }, 400);
      }
      const inserted = await supabaseRequest(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
        "classroom_chat_messages?on_conflict=room_name,sender_identity,client_message_id", {
          method: "POST",
          headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
          body: JSON.stringify([{
            room_name: room,
            client_message_id: id,
            sender_identity: identity,
            sender_name: name.slice(0, 120) || identity,
            recipient_identity: recipient,
            content,
          }]),
        });
      if (inserted.length) return json({ message: toClientMessage(inserted[0]) }, 201);
      const existing = await supabaseRequest(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
        `classroom_chat_messages?room_name=eq.${encodeURIComponent(room)}&sender_identity=eq.${encodeURIComponent(identity)}&client_message_id=eq.${encodeURIComponent(id)}&select=id,room_name,client_message_id,sender_identity,sender_name,recipient_identity,content,created_at&limit=1`);
      if (!existing.length) return json({ error: "Message could not be saved." }, 500);
      return json({ message: toClientMessage(existing[0]), duplicate: true });
    }

    return json({ error: "Unsupported room chat action." }, 400);
  } catch (error) {
    console.error("Room chat request failed:", error);
    return json({ error: "Unable to process room chat request." }, 500);
  }
}

function toClientMessage(row) {
  return {
    id: row.client_message_id,
    sender: row.sender_name,
    senderId: row.sender_identity,
    text: row.content,
    recipientId: row.recipient_identity || undefined,
    createdAt: row.created_at,
  };
}

async function verifyLiveKitToken(token, secret) {
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
    const claims = JSON.parse(decodeBase64Url(payloadPart));
    if (!Number.isFinite(claims.exp) || claims.exp <= Date.now() / 1000) return null;
    return claims;
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
    console.error("Supabase room chat request failed:", response.status, detail.slice(0, 400));
    throw new Error("Room chat database request failed.");
  }
  if (response.status === 204 || response.headers.get("content-length") === "0") return [];
  const text = await response.text();
  return text ? JSON.parse(text) : [];
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store",
  };
}
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json; charset=utf-8" },
  });
}
