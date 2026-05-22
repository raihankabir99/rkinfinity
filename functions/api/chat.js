import { createClient } from "@supabase/supabase-js";

// Function to get a Supabase client
const getSupabaseClient = (env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase environment variables are not set.");
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
};

const PROJECT_RX = /\b([A-Z]{2,5}-[A-Z0-9]{3,10})\b/i;
const PROJECT_TRACKING_RX = /\b(track|status|progress|update|kaj|kototok|amader|কাজ|কতটুক|koto|dur|kivabe|cholche|obostha)\b/i;

async function runChatUnsafe({ messages, session_id, user_name }, env) {
    const lastUserMessage = messages[messages.length - 1]?.content ?? "";
    const supabase = getSupabaseClient(env);

    // 1. Project tracking
    const pid = lastUserMessage.match(PROJECT_RX)?.[1].toUpperCase();
    if (pid || PROJECT_TRACKING_RX.test(lastUserMessage)) {
        if (pid) {
            const { data: proj } = await supabase.from("projects").select("project_id, client_name, status, progress, tracking_url").ilike("project_id", pid).maybeSingle();
            if (proj) {
                 const reply = `Got it. Project ${proj.project_id} for ${proj.client_name} is currently ${proj.status} (${proj.progress}% complete). You can view details here: ${proj.tracking_url}`;
                 return { content: reply, source: "project" };
            } else {
                 return { content: `Sorry, I couldn\'t find a project with the ID ${pid}. Please double-check the ID.`, source: "project" };
            }
        } else {
            return { content: "I can help with that. What is your project ID?", source: "project" };
        }
    }
    
    // 2. AI Fallback (using direct fetch as recommended by Cloudflare)
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("AI not configured. Missing GEMINI_API_KEY environment variable.");
        return { content: "Sorry, the AI is not configured correctly.", source: "error" };
    }

    try {
        const primer = `You are rkInfinity\'s friendly AI assistant. Be warm, concise, and helpful. Keep replies short.`;

        const historyForApi = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        const body = {
             contents: historyForApi,
             system_instruction: {
                parts: [{ text: primer }]
            }
        };

        const apiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            }
        );
        
        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            console.error("Gemini API request failed:", apiResponse.status, errorBody);
            return { content: `Sorry, I'm having trouble connecting to the AI. (Error: ${apiResponse.status})`, source: "error" };
        }

        const data = await apiResponse.json();

        if (!data.candidates || data.candidates.length === 0) {
            console.error("Gemini API Error: No candidates in response", JSON.stringify(data));
            if (data.promptFeedback && data.promptFeedback.blockReason) {
                return { content: `My response was blocked because: ${data.promptFeedback.blockReason}. Please try rephrasing.`, source: "error" };
            }
            return { content: "Sorry, I received an empty response from the AI. Please try again.", source: "error" };
        }
        
        const responseText = data.candidates[0]?.content?.parts?.[0]?.text || "Sorry, I couldn\'t come up with a response.";
        return { content: responseText, source: "ai" };

    } catch (e) {
        console.error("Error during AI generation:", e.message);
        return { content: "Sorry, I had trouble generating a response. Please try again.", source: "error" };
    }
}

export const onRequestPost = async ({ request, env }) => {
    try {
        const input = await request.json();
        
        if (!input || !Array.isArray(input.messages)) {
            return new Response(JSON.stringify({ content: "Invalid request format.", source: "error" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const result = await runChatUnsafe(input, env);

        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (e) {
        console.error("Unhandled error in onRequestPost:", e.message);
        const errorResult = {
            content: "Sorry, a server error occurred. Please try again later.",
            source: "error",
        };
        return new Response(JSON.stringify(errorResult), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};