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

const NAV_INTENTS: Array<{ rx: RegExp; path: string; label: string }> = [
  {
    rx: /\b(service|seo|marketing|web ?dev|development|offer)/i,
    path: "/services",
    label: "Services",
  },
  { rx: /\b(tool|free tool|generator|calculator)/i, path: "/tools", label: "Tools" },
  { rx: /\b(blog|article|post|read)/i, path: "/blog", label: "Blog" },
  { rx: /\b(contact|hire|reach|email|phone|whatsapp|book)/i, path: "/contact", label: "Contact" },
  { rx: /\b(about|who is rk|story|background)/i, path: "/about", label: "About" },
  { rx: /\b(kpi|stats|analytics|performance|metrics)/i, path: "/admin/analytics", label: "Analytics" },
];

function detectNav(text: string): { path: string; label: string } | null {
  for (const i of NAV_INTENTS) if (i.rx.test(text)) return { path: i.path, label: i.label };
  return null;
}

const PROJECT_RX = /\b([A-Z]{2,5}-[A-Z0-9]{3,10})\b/i;
function detectProjectId(text: string): string | null {
  const m = text.match(PROJECT_RX);
  return m ? m[1].toUpperCase() : null;
}

async function lookupProject(code: string) {
  const { data } = await supabaseAdmin
    .from("projects")
    .select("project_id, client_name, status, progress, tracking_url")
    .ilike("project_id", code)
    .maybeSingle();
  return data;
}

async function getTrainedAnswer(userText: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("bot_training")
    .select("question, answer")
    .order("created_at", { ascending: false })
    .limit(200);
  if (!data) return null;
  const q = userText.toLowerCase();
  for (const row of data as Array<{ question: string; answer: string }>) {
    const k = (row.question ?? "").toLowerCase().trim();
    if (!k) continue;
    if (q.includes(k) || k.includes(q)) return row.answer;
  }
  return null;
}

async function searchKnowledge(userText: string): Promise<string | null> {
  const words = userText
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3)
    .slice(0, 5);
  if (!words.length) return null;
  const { data } = await supabaseAdmin.from("knowledge_base").select("title, content").limit(50);
  if (!data) return null;
  let best: { score: number; row: { title: string; content: string } } | null = null;
  for (const row of data as Array<{ title: string; content: string }>) {
    const blob = `${row.title} ${row.content}`.toLowerCase();
    const score = words.reduce((s, w) => s + (blob.includes(w) ? 1 : 0), 0);
    if (score >= 2 && (!best || score > best.score)) best = { score, row };
  }
  if (!best) return null;
  const snippet = best.row.content.slice(0, 600);
  return `${snippet}${best.row.content.length > 600 ? "…" : ""}`;
}

async function persistMessage(
  session_id: string | undefined,
  role: "user" | "assistant",
  content: string,
) {
  if (!session_id) return;
  try {
    await supabaseAdmin.from("chat_messages").insert({ session_id, role, content });
  } catch (e) {
    console.error("chat_messages insert failed", e);
  }
}

async function legacyLog(userMessage: string, botReply: string, session_id?: string) {
  try {
    await supabaseAdmin.from("chat_logs").insert({
      session_id: session_id ?? null,
      user_message: userMessage.slice(0, 4000),
      bot_reply: botReply.slice(0, 4000),
    });
  } catch (e) {
    console.error("chat_logs insert failed", e);
  }
}

export async function runChat({ messages, session_id, user_name }: ChatInput) {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  // Persist user msg first
  await persistMessage(session_id, "user", lastUser);

  // Manual mode? Don't reply with AI — wait for admin
  if (session_id) {
    const { data: cu } = await supabaseAdmin
      .from("chat_users")
      .select("mode")
      .eq("session_id", session_id)
      .maybeSingle();
    if (cu?.mode === "manual") {
      return {
        content: "👋 An RK team member is jumping in — one moment…",
        source: "manual" as const,
      };
    }
  }

  // 1. Project tracking
  const pid = detectProjectId(lastUser);
  const PROJECT_TRACKING_RX = /track|status|progress|update|kaj|kototok|amader|কাজ|কতটুক|banglai|bon|hoice|koto|dur|kivabe|cholche|obostha/i;
  if (PROJECT_TRACKING_RX.test(lastUser)) {
      if (pid) {
        const proj = await lookupProject(pid);
        let reply: string;
        if (proj) {
          reply = `**Project ${proj.project_id}** — ${proj.client_name ?? "Client"}\\nStatus: **${proj.status}** · Progress: **${proj.progress}%**${proj.tracking_url ? `\\n\\n[Open tracker →](${proj.tracking_url})` : ""}`;
        } else {
          reply = `I couldn't find project **${pid}**. Double-check the ID or [contact RK](/contact) for help.`;
        }
        await persistMessage(session_id, "assistant", reply);
        await legacyLog(lastUser, reply, session_id);
        return { content: reply, source: "project" as const };
      } else {
        const reply = "I can help with that. What is the project ID you would like me to check?";
        await persistMessage(session_id, "assistant", reply);
        await legacyLog(lastUser, reply, session_id);
        return { content: reply, source: "project" as const };
      }
  }

  // 2. Smart navigation
  const nav = detectNav(lastUser);
  if (nav && /show|where|find|page|link|take me|go to|see|open/i.test(lastUser)) {
    const reply = `Sure! Check out the **${nav.label}** page → [${nav.path}](${nav.path}) ✨`;
    await persistMessage(session_id, "assistant", reply);
    await legacyLog(lastUser, reply, session_id);
    return { content: reply, source: "nav" as const };
  }

  // 3. Trained answers
  const trained = await getTrainedAnswer(lastUser);
  if (trained) {
    await persistMessage(session_id, "assistant", trained);
    await legacyLog(lastUser, trained, session_id);
    return { content: trained, source: "trained" as const };
  }

  // 4. Knowledge base
  const kb = await searchKnowledge(lastUser);
  if (kb) {
    await persistMessage(session_id, "assistant", kb);
    await legacyLog(lastUser, kb, session_id);
    return { content: kb, source: "kb" as const };
  }

  // 5. AI fallback
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
      console.error("AI not configured. Missing GEMINI_API_KEY");
      const content = "Sorry, I'm having a little trouble thinking right now. Please try again in a moment.";
      await persistMessage(session_id, "assistant", content);
      await legacyLog(lastUser, content, session_id);
      return { content, source: "ai" as const };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const greeting = user_name
      ? `The visitor's name is ${user_name}. Greet them by name on first reply.`
      : "";
    const primer_instruction =
        "You are RK's friendly assistant for rkInfinity — RK is an SEO Specialist, Digital Marketer, Content Creator and Story Writer. Be warm, concise, and helpful. " +
        greeting +
        " You can suggest these pages: /services, /tools, /blog, /about, /contact. Keep replies short (2-4 sentences) and use markdown sparingly.";

    const primer = [
        { role: "user", parts: [{ text: primer_instruction }] },
        { role: "model", parts: [{ text: "Understood. I'm ready to assist." }] }
    ];

    const firstUserIndex = messages.findIndex(m => m.role === 'user');
    if (firstUserIndex === -1) throw new Error("No user message in history");
    const historySlice = messages.slice(firstUserIndex);

    const history = historySlice.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const contents = [...primer, ...history];

    const result = await model.generateContent({ contents });

    const response = result.response;
    const content = response.text();

    await persistMessage(session_id, "assistant", content);
    await legacyLog(lastUser, content, session_id);
    return { content, source: "ai" as const };
  } catch(e) {
      console.error("AI fallback failed", e);
      const content = "Sorry, I'm having a little trouble thinking right now. Please try again in a moment.";
      await persistMessage(session_id, "assistant", content);
      await legacyLog(lastUser, content, session_id);
      return { content, source: "ai" as const };
  }
}
