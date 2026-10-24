// Thin adapter that exposes existing Fetch-style handlers as Vercel Node Functions.
// Keep all secrets in Vercel server-side environment variables.
export async function runFetchHandler(req, res, handlers, maxBodyBytes = 16 * 1024 * 1024) {
  const method = String(req.method || "GET").toUpperCase();
  const handler = method === "OPTIONS" ? handlers.onRequestOptions :
    method === "POST" ? handlers.onRequestPost :
    method === "GET" ? handlers.onRequestGet : null;

  if (!handler) {
    res.statusCode = 405;
    res.setHeader("Allow", "POST, OPTIONS");
    res.end("Method Not Allowed");
    return;
  }

  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers || {})) {
      if (Array.isArray(value)) headers.set(key, value.join(", "));
      else if (typeof value === "string") headers.set(key, value);
    }

    let body;
    if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
      const declaredLength = Number(headers.get("content-length") || 0);
      if (declaredLength > maxBodyBytes) {
        res.statusCode = 413;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ error: "Request body is too large." }));
        return;
      }

      // Vercel may have already parsed JSON bodies. Preserve binary/multipart uploads
      // by reading the raw request stream when no parsed body is available.
      if (req.body !== undefined && req.body !== null &&
          typeof req.body === "object" && !Buffer.isBuffer(req.body) &&
          !(req.body instanceof Uint8Array)) {
        body = Buffer.from(JSON.stringify(req.body));
        if (!headers.has("content-type")) headers.set("content-type", "application/json");
      } else if (typeof req.body === "string") {
        body = Buffer.from(req.body);
      } else if (Buffer.isBuffer(req.body) || req.body instanceof Uint8Array) {
        body = Buffer.from(req.body);
      } else {
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > maxBodyBytes) {
            res.statusCode = 413;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: "Request body is too large." }));
            return;
          }
          chunks.push(Buffer.from(chunk));
        }
        body = Buffer.concat(chunks);
      }
      if (body && body.byteLength > maxBodyBytes) {
        res.statusCode = 413;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ error: "Request body is too large." }));
        return;
      }
    }

    const host = headers.get("host") || "localhost";
    const url = new URL(req.url || "/", "https://" + host);
    const init = { method, headers };
    if (body && method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
      init.body = body;
      init.duplex = "half";
    }
    const request = new Request(url, init);
    const response = await handler({ request, env: process.env });
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    const responseBody = Buffer.from(await response.arrayBuffer());
    res.end(responseBody);
  } catch (error) {
    console.error("Vercel API adapter failed:", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.end(JSON.stringify({ error: "Internal server error." }));
    } else {
      res.end();
    }
  }
}
