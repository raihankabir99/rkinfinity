import { runChat } from "../../src/server/chat.server";

export async function onRequestOptions(context) {
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
    // Reject oversized chat histories before JSON parsing to bound memory/CPU usage.
    const maxBodyBytes = 256 * 1024;
    const declaredLength = Number(context.request.headers.get("content-length") || 0);
    if (declaredLength > maxBodyBytes) {
      return jsonResponse({ error: "Chat request is too large. Please shorten the conversation and try again." }, 413);
    }
    const rawBody = await context.request.text();
    if (new TextEncoder().encode(rawBody).byteLength > maxBodyBytes) {
      return jsonResponse({ error: "Chat request is too large. Please shorten the conversation and try again." }, 413);
    }
    let input;
    try {
      input = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ error: "Invalid JSON request body." }, 400);
    }
    if (!input || typeof input !== "object" || !Array.isArray(input.messages)) {
      return jsonResponse({ error: "A messages array is required." }, 400);
    }
    const result = await runChat(input, context);
    return new Response(JSON.stringify({ reply: result.content }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    console.error("Error in chat function:", e);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}


function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}
