import { RoomServiceClient } from "livekit-server-sdk";

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders() });
}

export async function onRequestPost(context) {
  try {
    const { LIVEKIT_API_KEY: apiKey, LIVEKIT_API_SECRET: apiSecret, LIVEKIT_URL: livekitUrl } = context.env;
    if (!apiKey || !apiSecret || !livekitUrl) return json({ error: "LiveKit is not configured on the server." }, 500);

    const auth = context.request.headers.get("Authorization") || "";
    const moderatorToken = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const moderator = await verifyModeratorToken(moderatorToken, apiSecret);
    if (!moderator) return json({ error: "Moderator authorization required." }, 403);

    const body = await context.request.json();
    const action = typeof body?.action === "string" ? body.action : "";
    const targetIdentity = typeof body?.participantIdentity === "string" ? body.participantIdentity : "";
    if (!["mute", "remove", "lock", "unlock", "end"].includes(action)) return json({ error: "Unsupported moderation action." }, 400);
    if (["mute", "remove"].includes(action) && (!targetIdentity || targetIdentity === moderator.identity)) {
      return json({ error: "Choose another participant." }, 400);
    }

    const service = new RoomServiceClient(livekitUrl.replace(/^wss:/, "https:").replace(/^ws:/, "http:"), apiKey, apiSecret);
    const rooms = await service.listRooms([moderator.room]);
    const room = rooms[0];
    if (!room) return json({ error: "Room no longer exists." }, 404);
    let metadata = {};
    try { metadata = room.metadata ? JSON.parse(room.metadata) : {}; } catch { return json({ error: "Room metadata is invalid." }, 500); }
    if (metadata.ownerIdentity !== moderator.identity) return json({ error: "You are not the owner of this room." }, 403);

    if (action === "remove") {
      await service.removeParticipant(moderator.room, targetIdentity);
    } else if (action === "mute") {
      const participants = await service.listParticipants(moderator.room);
      const target = participants.find((p) => p.identity === targetIdentity);
      if (!target) return json({ error: "Participant not found." }, 404);
      const audioTracks = (target.tracks || []).filter((track) => track.type === 0 || String(track.type).toLowerCase().includes("audio"));
      for (const track of audioTracks) {
        if (track.sid) await service.mutePublishedTrack(moderator.room, targetIdentity, track.sid, true);
      }
    } else if (action === "lock" || action === "unlock") {
      await service.updateRoomMetadata(moderator.room, JSON.stringify({ ...metadata, locked: action === "lock" }));
    } else if (action === "end") {
      await service.deleteRoom(moderator.room);
    }

    return json({ ok: true, action });
  } catch (error) {
    console.error("LiveKit moderation action failed:", error);
    return json({ error: "Moderation action failed." }, 500);
  }
}

async function verifyModeratorToken(token, secret) {
  if (!token || token.length > 4096) return null;
  const [payloadPart, signaturePart, extra] = token.split(".");
  if (!payloadPart || !signaturePart || extra) return null;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const signature = Uint8Array.from(atob(signaturePart.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - signaturePart.length % 4) % 4)), (c) => c.charCodeAt(0));
  const valid = await crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(payloadPart));
  if (!valid) return null;
  const payload = JSON.parse(decodeURIComponent(escape(atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - payloadPart.length % 4) % 4)))));
  if (!payload.room || !payload.identity || !Number.isFinite(payload.exp) || payload.exp <= Date.now() / 1000) return null;
  return payload;
}
function corsHeaders() { return { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Cache-Control": "no-store" }; }
function json(body, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(), "Content-Type": "application/json; charset=utf-8" } }); }
