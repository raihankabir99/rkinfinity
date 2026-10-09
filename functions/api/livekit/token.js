import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const requestedRoom = typeof body?.room === "string" ? body.room.trim() : "";

    if (!name || name.length > 80 || (requestedRoom && requestedRoom.length > 120)) {
      return json({ error: "A valid room and participant name are required." }, 400);
    }

    const apiKey = context.env.LIVEKIT_API_KEY;
    const apiSecret = context.env.LIVEKIT_API_SECRET;
    const livekitUrl = context.env.LIVEKIT_URL;
    if (!apiKey || !apiSecret || !livekitUrl) {
      console.error("LiveKit server credentials are not configured.");
      return json({ error: "LiveKit is not configured on the server." }, 500);
    }

    const serviceUrl = livekitUrl.replace(/^wss:/, "https:").replace(/^ws:/, "http:");
    const service = new RoomServiceClient(serviceUrl, apiKey, apiSecret);

    // A room must be explicitly created first. This prevents arbitrary room names
    // from being claimed as owner by whoever joins first.
    const room = requestedRoom ? (await service.listRooms([requestedRoom]))[0] : null;
    if (!room) {
      return json({ error: "Room not found. Create a room first, then share its invite link." }, 404);
    }

    let metadata = {};
    try { metadata = room.metadata ? JSON.parse(room.metadata) : {}; } catch { metadata = {}; }
    const identity = `rkInfinity-${crypto.randomUUID()}`;
    const token = new AccessToken(apiKey, apiSecret, { identity, name, ttl: "2h" });
    token.addGrant({
      roomJoin: true,
      room: requestedRoom,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      // Room creator is the only one who receives moderator metadata.
      metadata: JSON.stringify({ role: "participant" }),
    });

    return json({ token: await token.toJwt(), url: livekitUrl, room: requestedRoom, role: "participant" });
  } catch (error) {
    console.error("Error creating LiveKit token:", error);
    return json({ error: "Unable to create LiveKit access token." }, 500);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
