import { enforceVercelRateLimit } from "./_rateLimit.js";

const MAX_TOKEN_LENGTH = 8192;
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MIME_EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "video/mp4": "mp4", "video/webm": "webm", "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/webm": "webm", "audio/ogg": "ogg", "application/pdf": "pdf", "text/plain": "txt" };

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders() });
}

export async function onRequestPost(context) {
  try {
    const rateLimit = await enforceVercelRateLimit(context, "attachment", 20);
    if (rateLimit) return rateLimit;
    const { LIVEKIT_API_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = context.env;
    if (!LIVEKIT_API_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return json({ error: "Attachment storage is not configured on the server." }, 500);
    const auth = context.request.headers.get("Authorization") || "";
    const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const claims = await verifyLiveKitToken(bearer, LIVEKIT_API_SECRET);
    if (!claims) return json({ error: "Valid LiveKit participant token required." }, 401);
    const grant = claims.video || {};
    const room = typeof grant.room === "string" ? grant.room : "";
    const identity = typeof claims.sub === "string" ? claims.sub : "";
    if (!grant.roomJoin || !room || !identity) return json({ error: "Token does not authorize a room participant." }, 403);

    const requestLength = Number(context.request.headers.get("content-length") || 0);
    if (requestLength > MAX_FILE_BYTES + 100_000) return json({ error: "Upload request exceeds the 4 MB limit." }, 413);
    const contentType = context.request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const form = await context.request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return json({ error: "Choose a file to upload." }, 400);
      if (!file.size || file.size > MAX_FILE_BYTES) return json({ error: "Files must be 4 MB or smaller." }, 413);
      const extension = MIME_EXTENSIONS[file.type];
      if (!extension) return json({ error: "This file type is not allowed." }, 415);
      const originalName = file.name.replace(/[^a-zA-Z0-9._ -]/g, "_").trim().slice(0, 180) || ("attachment." + extension);
      const path = room + "/" + identity + "/" + crypto.randomUUID() + "." + extension;
      const upload = await fetch(storageUrl(SUPABASE_URL, "object/classroom-attachments/" + encodePath(path)), {
        method: "POST",
        headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: "Bearer " + SUPABASE_SERVICE_ROLE_KEY, "Content-Type": file.type, "x-upsert": "false" },
        body: file.stream(),
      });
      if (!upload.ok) {
        const detail = await upload.text();
        console.error("Classroom attachment upload failed:", upload.status, detail.slice(0, 300));
        return json({ error: "File upload failed." }, 502);
      }
      return json({ path, name: originalName, mime: file.type, size: file.size }, 201);
    }

    const length = Number(context.request.headers.get("content-length") || 0);
    if (length > 8000) return json({ error: "Request body is too large." }, 413);
    const body = await context.request.json();
    if (body?.action !== "download" || typeof body.path !== "string") return json({ error: "Unsupported attachment action." }, 400);
    const path = body.path.trim();
    if (!path.startsWith(room + "/") || path.includes("..") || path.length > 500) return json({ error: "Invalid attachment path." }, 403);
    const rows = await supabaseRequest(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
      "classroom_chat_messages?room_name=eq." + encodeURIComponent(room) + "&attachment_path=eq." + encodeURIComponent(path) + "&or=(recipient_identity.is.null,recipient_identity.eq." + encodeURIComponent(identity) + ",sender_identity.eq." + encodeURIComponent(identity) + ")&select=attachment_path&limit=1");
    if (!rows.length) return json({ error: "You do not have access to this attachment." }, 403);
    const signedResponse = await fetch(storageUrl(SUPABASE_URL, "object/sign/classroom-attachments/" + encodePath(path)), {
      method: "POST",
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: "Bearer " + SUPABASE_SERVICE_ROLE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ expiresIn: 300 }),
    });
    if (!signedResponse.ok) {
      const detail = await signedResponse.text();
      console.error("Attachment signed URL failed:", signedResponse.status, detail.slice(0, 300));
      return json({ error: "Unable to open this attachment." }, 502);
    }
    const signed = await signedResponse.json();
    const relative = signed.signedURL || signed.signedUrl;
    if (typeof relative !== "string") return json({ error: "Storage did not return a signed URL." }, 502);
    const url = relative.startsWith("http") ? relative : stripTrailingSlash(SUPABASE_URL) + "/storage/v1" + (relative.startsWith("/") ? relative : "/" + relative);
    return json({ url, expiresIn: 300 });
  } catch (error) {
    console.error("Classroom attachment request failed:", error);
    return json({ error: "Unable to process attachment request." }, 500);
  }
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
    if (!await crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(headerPart + "." + payloadPart))) return null;
    const claims = JSON.parse(decodeBase64Url(payloadPart));
    if (!Number.isFinite(claims.exp) || claims.exp <= Date.now() / 1000) return null;
    return claims;
  } catch { return null; }
}
function decodeBase64Url(value) { return decodeURIComponent(escape(atob(value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4)))); }
function encodePath(path) { return path.split("/").map(encodeURIComponent).join("/"); }
function storageUrl(base, path) { return stripTrailingSlash(base) + "/storage/v1/" + path; }
function stripTrailingSlash(value) { return value.endsWith("/") ? value.slice(0, -1) : value; }
async function supabaseRequest(baseUrl, serviceKey, path) {
  const response = await fetch(stripTrailingSlash(baseUrl) + "/rest/v1/" + path, { headers: { apikey: serviceKey, Authorization: "Bearer " + serviceKey, "Content-Type": "application/json" } });
  if (!response.ok) { const detail = await response.text(); console.error("Attachment access query failed:", response.status, detail.slice(0, 300)); throw new Error("Attachment access query failed."); }
  const text = await response.text();
  return text ? JSON.parse(text) : [];
}
function corsHeaders() { return { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Cache-Control": "no-store" }; }
function json(body, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(), "Content-Type": "application/json; charset=utf-8" } }); }