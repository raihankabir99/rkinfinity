// functions/api/chat.js

// This function handles pre-flight CORS requests from the browser for security.
export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*", // Or specify your site's domain
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// This function handles the actual chat message when it's sent.
export async function onRequestPost(context) {
  try {
    // Get the user's message from the request
    const body = await context.request.json();
    const userMessage = body.message; // Ensure your frontend sends a 'message' property

    if (!userMessage) {
      return new Response(JSON.stringify({ error: "Message is missing" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" }
      });
    }

    // Get the Gemini API key from your Cloudflare Pages settings
    const apiKey = context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not set" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" }
      });
    }

    // Call the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: userMessage }],
          }],
        }),
      }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API Error:", errorText);
        return new Response(JSON.stringify({ error: "Failed to get response from AI" }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" }
        });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't get a response.";

    // Send the AI's reply back to the frontend
    return new Response(JSON.stringify({ reply }), {
      headers: { 
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*" 
      }
    });

  } catch (e) {
    console.error("Error in chat function:", e);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" }
    });
  }
}