import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/server/supabase-admin";

const MsgSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1).max(8000),
});
const ChatSchema = z.object({
  messages: z.array(MsgSchema).min(1).max(50),
});

type Msg = z.infer<typeof MsgSchema>;

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

async function logChat(userMessage: string, botReply: string) {
  try {
    await supabaseAdmin.from("chat_logs").insert({
      user_message: userMessage.slice(0, 4000),
      bot_reply: botReply.slice(0, 4000),
    });
  } catch (e) {
    console.error("chat_logs insert failed", e);
  }
}

export const chatFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatSchema.parse(input))
  .handler(async ({ data }) => {
    const messages = data.messages as Msg[];
    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

    const trained = await getTrainedAnswer(lastUser);
    if (trained) {
      await logChat(lastUser, trained);
      return { content: trained, source: "trained" as const };
    }

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("AI not configured");
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
      throw new Error(`Gateway ${res.status}: ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "Sorry, I didn't catch that.";

    await logChat(lastUser, content);

    return { content, source: "ai" as const };
  });
