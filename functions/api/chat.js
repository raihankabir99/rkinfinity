import { GoogleGenerativeAI } from "@google/generative-ai";

// Placeholder for Supabase client, assuming it's configured elsewhere
// and available in the environment.
const supabaseAdmin = {
    from: (tableName) => ({
        select: (...args) => ({ 
            ilike: () => ({ maybeSingle: async () => ({ data: null }) }),
            order: () => ({ limit: async () => ({ data: [] }) }),
            limit: async () => ({ data: [] })
        }),
        insert: async () => ({}),
    })
};


export interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatInput {
  messages: ChatMsg[];
  session_id?: string;
  user_name?: string;
}

// --- Business Logic --- //

const NAV_INTENTS = [
  { rx: /\b(service|seo|marketing|web ?dev|development|offer)/i, path: "/services", label: "Services" },
  { rx: /\b(tool|free tool|generator|calculator)/i, path: "/tools", label: "Tools" },
  { rx: /\b(blog|article|post|read)/i, path: "/blog", label: "Blog" },
  { rx: /\b(contact|hire|reach|email|phone|whatsapp|book)/i, path: "/contact", label: "Contact" },
  { rx: /\b(about|who is rk|story|background)/i, path: "/about", label: "About" },
  { rx: /\b(kpi|stats|analytics|performance|metrics)/i, path: "/admin/analytics", label: "Analytics" },
];

const PROJECT_RX = /\b([A-Z]{2,5}-[A-Z0-9]{3,10})\b/i;
const PROJECT_TRACKING_RX = /\b(track|status|progress|update|kaj|kototok|amader|কাজ|কতটুক|koto|dur|kivabe|cholche|obostha)\b/i;

// --- Utility Functions --- //

async function persistMessage(session_id, role, content, env) {
  // Implement Supabase client initialization if needed
}


// --- Main Chat Logic --- //

async function runChatUnsafe({ messages, session_id, user_name }, env) {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  // 1. Project tracking
  const pid = lastUser.match(PROJECT_RX)?.[1].toUpperCase();
  if (pid || PROJECT_TRACKING_RX.test(lastUser)) {
      if (pid) {
        // const { data: proj } = await getSupabaseClient(env).from("projects").select("project_id, client_name, status, progress, tracking_url").ilike("project_id", pid).maybeSingle();
        const reply = `I will look up project ${pid} now.`
        return { content: reply, source: "project" };
      } else {
          return { content: "I can help with that. What is the project ID?", source: "project" };
      }
  }

  // 2. AI Fallback
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("AI not configured. Missing GEMINI_API_KEY");
    return { content: "Sorry, AI is not set up right now.", source: "error" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const primer = `You are RK's friendly assistant for rkInfinity.`;
  const history = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const result = await model.generateContent([primer, ...history.map(h => h.parts[0].text)]);
  return { content: result.response.text(), source: "ai" };
}

export const onRequestPost = async ({ request, env }) => {
    try {
        const input = await request.json();
        const result = await runChatUnsafe(input, env);
        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (e) {
        console.error("Unhandled error in onRequestPost:", e);
        const errorResult = {
            content: "Sorry, I hit a snag. Please try again in a moment.",
            source: "error",
        };
        return new Response(JSON.stringify(errorResult), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};