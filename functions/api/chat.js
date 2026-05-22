import { createClient } from "@supabase/supabase-js";
import { isBengali } from "./src/utils.js";
import { handleProjectTracking } from "./src/project-tracker.js";
import { handleAiFallback } from "./src/ai-fallback.js";

// Function to get a Supabase client
const getSupabaseClient = (env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase environment variables are not set.");
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
};

async function runChatUnsafe({ messages, session_id, user_name }, env) {
    const lastUserMessage = messages[messages.length - 1]?.content ?? "";
    const supabase = getSupabaseClient(env);
    const userIsBengali = isBengali(lastUserMessage);
    const language = userIsBengali ? 'Bengali' : 'English';

    // 1. Attempt to handle as a project tracking query
    const projectResult = await handleProjectTracking(lastUserMessage, supabase, userIsBengali);
    if (projectResult) {
        return projectResult;
    }

    // 2. If not a project query, fall back to the general AI
    return await handleAiFallback(messages, env, language);
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
            content: "A server error occurred. Please try again later.",
            source: "error",
        };
        return new Response(JSON.stringify(errorResult), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};