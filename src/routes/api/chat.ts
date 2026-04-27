import { createFileRoute } from "@tanstack/react-router";

type Msg = { role: "system" | "user" | "assistant"; content: string };

async function handlePost(request: Request): Promise<Response> {
  try {
    const { messages } = (await request.json()) as { messages: Msg[] };
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages required" }), { status: 400 });
    }

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500 });
    }

    const system: Msg = {
      role: "system",
      content:
        "You are RK's friendly assistant for rkInfinity — RK is an SEO Specialist, Digital Marketer, Content Creator and Story Writer. Be warm, concise, and helpful. The visitor is anonymous; do NOT require login or email up front. After 2-3 useful exchanges, politely ask once: \"Give me your email so I can send you the next updates\". Never push if they decline. Keep replies short (2-4 sentences) and use markdown sparingly.",
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [system, ...messages],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: `Gateway ${res.status}: ${text.slice(0, 200)}` }), {
        status: res.status,
      });
    }

    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "Sorry, I didn't catch that.";
    return new Response(JSON.stringify({ content }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500 },
    );
  }
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: ({ request }: { request: Request }) => handlePost(request),
    },
  },
});
