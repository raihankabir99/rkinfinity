import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

async function persistMessage(session_id: string | undefined, role: "user" | "assistant", content: string) {
  if (!session_id) return;
  try {
    await supabaseAdmin.from("chat_messages").insert({ session_id, role, content });
  } catch (e) {
    console.error("chat_messages insert failed", e);
  }
}

// --- Main Chat Logic --- //

async function runChatUnsafe({ messages, session_id, user_name }: ChatInput) {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  await persistMessage(session_id, "user", lastUser);

  // 1. Manual mode check
  if (session_id) {
    const { data: cu } = await supabaseAdmin.from("chat_users").select("mode").eq("session_id", session_id).maybeSingle();
    if (cu?.mode === "manual") {
      return { content: "👋 An RK team member is jumping in — one moment…", source: "manual" as const };
    }
  }

  // 2. Project tracking
  const pid = lastUser.match(PROJECT_RX)?.[1].toUpperCase();
  if (pid || PROJECT_TRACKING_RX.test(lastUser)) {
    if (pid) {
      const { data: proj } = await supabaseAdmin.from("projects").select("project_id, client_name, status, progress, tracking_url").ilike("project_id", pid).maybeSingle();
      const reply = proj
        ? `**Project ${proj.project_id}** — ${proj.client_name ?? "Client"}\nStatus: **${proj.status}** · Progress: **${proj.progress}%**${proj.tracking_url ? `\n\n[Open tracker →](${proj.tracking_url})` : ""}`
        : `I couldn't find project **${pid}**. Double-check the ID or [contact RK](/contact) for help.`;
      return { content: reply, source: "project" as const };
    } else {
      return { content: "I can help with that. What is the project ID you would like me to check?", source: "project" as const };
    }
  }

  // 3. Smart navigation
  const nav = NAV_INTENTS.find(i => i.rx.test(lastUser));
  if (nav && /show|where|find|page|link|take me|go to|see|open/i.test(lastUser)) {
    return { content: `Sure! Check out the **${nav.label}** page → [${nav.path}](${nav.path}) ✨`, source: "nav" as const };
  }

  // 4. Trained answers
  const { data: trainedData } = await supabaseAdmin.from("bot_training").select("question, answer").order("created_at", { ascending: false }).limit(200);
  if (trainedData) {
    const q = lastUser.toLowerCase();
    for (const row of trainedData as Array<{ question: string; answer: string }>) {
      const k = (row.question ?? "").toLowerCase().trim();
      if (!k) continue;
      if (q.includes(k) || k.includes(q)) return { content: row.answer, source: "trained" as const };
    }
  }

  // 5. Knowledge base search
  const words = lastUser.toLowerCase().split(/\W+/).filter(w => w.length > 3).slice(0, 5);
  if (words.length) {
    const { data: kbData } = await supabaseAdmin.from("knowledge_base").select("title, content").limit(50);
    if (kbData) {
      let best: { score: number; row: { title: string; content: string } } | null = null;
      for (const row of kbData as Array<{ title: string; content: string }>) {
        const blob = `${row.title} ${row.content}`.toLowerCase();
        const score = words.reduce((s, w) => s + (blob.includes(w) ? 1 : 0), 0);
        if (score >= 2 && (!best || score > best.score)) best = { score, row };
      }
      if (best) {
        const snippet = best.row.content.slice(0, 600);
        const content = `${snippet}${best.row.content.length > 600 ? "…" : ""}`;
        return { content, source: "kb" as const };
      }
    }
  }

  // 6. AI Fallback
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("AI not configured. Missing GEMINI_API_KEY");
    return { content: "Sorry, I'm having a little trouble thinking right now. Please try again in a moment.", source: "ai" as const };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const primer = `You are RK's friendly assistant for rkInfinity — RK is an SEO Specialist, Digital Marketer, Content Creator and Story Writer. Be warm, concise, and helpful. You can suggest these pages: /services, /tools, /blog, /about, /contact. Keep replies short (2-4 sentences) and use markdown sparingly.`;
  const history = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const result = await model.generateContent([primer, ...history]);
  return { content: result.response.text(), source: "ai" as const };
}

export async function runChat(input: ChatInput) {
  try {
    const result = await runChatUnsafe(input);
    if (result.source !== 'manual') {
        await persistMessage(input.session_id, "assistant", result.content);
    }
    return result;
  } catch (e) {
    console.error("Unhandled error in runChat:", e);
    const errorContent = "Sorry, I'm having a little trouble thinking right now. Please try again in a moment.";
    await persistMessage(input.session_id, "assistant", errorContent);
    return { content: errorContent, source: "error" as const };
  }
}
