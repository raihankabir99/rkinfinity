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
    const room = typeof body?.room === "string" ? body.room.trim() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!room || room.length > 120 || !name || name.length > 80) {
      return json({ error: "A valid room and participant name are required." }, 400);
    }

    const apiKey = context.env.LIVEKIT_API_KEY;
    const apiSecret = context.env.LIVEKIT_API_SECRET;
    const livekitUrl = context.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      console.error("LiveKit server credentials are not configured.");
      return json({ error: "LiveKit is not configured on the server." }, 500);
    }

    const service = new RoomServiceClient(livekitUrl.replace(/^wss:/, "https:").replace(/^ws:/, "http:"), apiKey, apiSecret);
    const existingRooms = await service.listRooms([room]);
    const existingRoom = existingRooms[0];
    // Never let the join endpoint implicitly create a room: only the create endpoint
    // may create rooms and establish their owner.
    if (!existingRoom) return json({ error: "Room not found. Ask the room creator for a valid invite link." }, 404);
    let metadata = {};
    try { metadata = existingRoom.metadata ? JSON.parse(existingRoom.metadata) : {}; }
    catch { return json({ error: "Room metadata is invalid." }, 500); }
    if (metadata.locked) return json({ error: "This room is locked by its moderator." }, 403);

    const identity = `rkInfinity-${crypto.randomUUID()}`;
    const token = new AccessToken(apiKey, apiSecret, {
      identity,
      name,
      ttl: "2h",
    });

    token.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    return json({
      token: await token.toJwt(),
      url: livekitUrl,
      room,
    });
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
