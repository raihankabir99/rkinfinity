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
    if (existingRooms[0]) {
      let metadata = {};
      try { metadata = existingRooms[0].metadata ? JSON.parse(existingRooms[0].metadata) : {}; } catch { metadata = {}; }
      if (metadata.locked) return json({ error: "This room is locked by its moderator." }, 403);
    }

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
