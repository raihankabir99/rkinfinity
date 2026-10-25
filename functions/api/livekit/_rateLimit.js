// Vercel-compatible, server-side rate limiting backed by Supabase RPC.
// Fail closed if the limiter is unavailable: these endpoints perform privileged operations.
export async function enforceVercelRateLimit(context, endpoint, limit, windowSeconds = 60) {
  const baseUrl = context.env.SUPABASE_URL;
  const serviceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !serviceKey) {
    return json({ error: "Rate limiting is not configured on the server." }, 503);
  }

  // Vercel appends the connecting address to x-forwarded-for; use the last entry.
  const forwarded = context.request.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",").map((part) => part.trim()).filter(Boolean).slice(-1)[0]
    || context.request.headers.get("x-real-ip")
    || "unknown";
  const rateKey = endpoint + ":" + ip.slice(0, 200);

  try {
    const response = await fetch(baseUrl.replace(/\/$/, "") + "/rest/v1/rpc/check_classroom_api_rate_limit", {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: "Bearer " + serviceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_rate_key: rateKey,
        p_limit: limit,
        p_window_seconds: windowSeconds,
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error("Vercel rate limiter failed:", endpoint, response.status, detail.slice(0, 250));
      return json({ error: "Temporarily unable to process this request. Please try again shortly." }, 503);
    }
    const allowed = await response.json();
    if (allowed !== true) return json({ error: "Too many requests. Please wait and try again." }, 429);
    return null;
  } catch (error) {
    console.error("Vercel rate limiter unavailable:", endpoint, error);
    return json({ error: "Temporarily unable to process this request. Please try again shortly." }, 503);
  }
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
