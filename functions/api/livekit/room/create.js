import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders() });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 80) return json({ error: "Enter a valid display name." }, 400);

    const { LIVEKIT_API_KEY: apiKey, LIVEKIT_API_SECRET: apiSecret, LIVEKIT_URL: livekitUrl } = context.env;
    if (!apiKey || !apiSecret || !livekitUrl) return json({ error: "LiveKit is not configured on the server." }, 500);

    const roomService = new RoomServiceClient(livekitUrl.replace(/^wss:/, "https:").replace(/^ws:/, "http:"), apiKey, apiSecret);
    const room = `infinit-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
    const identity = `rkInfinity-${crypto.randomUUID()}`;
    await roomService.createRoom({
      name: room,
      emptyTimeout: 300,
      maxParticipants: 100,
      metadata: JSON.stringify({ ownerIdentity: identity, locked: false, createdAt: new Date().toISOString() }),
    });

    const token = new AccessToken(apiKey, apiSecret, { identity, name, ttl: "2h", metadata: JSON.stringify({ role: "moderator" }) });
    token.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true, canPublishData: true });
    const moderatorToken = await signModeratorToken({ room, identity, exp: Math.floor(Date.now() / 1000) + 7200 }, apiSecret);
    return json({ token: await token.toJwt(), url: livekitUrl, room, role: "moderator", moderatorToken });
  } catch (error) {
    console.error("Unable to create LiveKit room:", error);
    return json({ error: "Unable to create room." }, 500);
  }
}

async function signModeratorToken(payload, secret) {
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encoded)));
  const sig = btoa(String.fromCharCode(...signature)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return encoded + "." + sig;
}
function corsHeaders() { return { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Cache-Control": "no-store" }; }
function json(body, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(), "Content-Type": "application/json; charset=utf-8" } }); }
