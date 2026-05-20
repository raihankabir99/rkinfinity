
import { Ai } from '@cloudflare/ai';

export default {
  async fetch(request, env) {
    // Define CORS headers for security and accessibility
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
    };

    // Handle CORS preflight requests for browser compatibility
    async function handleOptions(request) {
      if (
        request.headers.get("Origin") !== null &&
        request.headers.get("Access-Control-Request-Method") !== null &&
        request.headers.get("Access-Control-Request-Headers") !== null
      ) {
        return new Response(null, {
          headers: {
            ...corsHeaders,
            "Access-Control-Allow-Headers": request.headers.get(
              "Access-Control-Request-Headers"
            ),
          },
        });
      } else {
        return new Response(null, {
          headers: {
            Allow: "GET, HEAD, POST, OPTIONS",
          },
        });
      }
    }

    // Respond to OPTIONS method (preflight requests)
    if (request.method === "OPTIONS") {
      return handleOptions(request);
    }

    const url = new URL(request.url);

    // Main API route for the chatbot
    if (url.pathname === "/api/chat") {
      try {
        const ai = new Ai(env.AI);
        const { messages } = await request.json();

        // System prompt to define the AI's personality and role
        const systemPrompt = {
          role: "system",
          content: "You are rkInfinity\'s friendly and helpful assistant. Your name is Infinity. You are an expert in SEO, digital marketing, and web development. Answer questions about RK-Infinity\'s services, help users track their projects with their unique ID, and provide concise, informative, and friendly responses. Keep your answers under 50 words unless asked for more detail."
        };

        // Call the Gemini Pro model via Cloudflare AI
        const response = await ai.run(
          '@cf/google/gemini-pro',
          {
            messages: [systemPrompt, ...messages],
          }
        );

        // Return the AI's response
        return new Response(JSON.stringify({ reply: response.response }), {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });

      } catch (error) {
        console.error("Error processing chat request:", error);
        return new Response(JSON.stringify({ error: "Something went wrong!" }), {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      }
    }

    // Default response for other routes
    return new Response("RK Worker is Live! Use /api/chat", {
      status: 200,
      headers: { ...corsHeaders },
    });
  },
};
