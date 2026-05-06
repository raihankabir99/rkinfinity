import { useEffect, useRef, useState } from "react";
import { X, Send, Loader2, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import robotLogo from "@/assets/chatbot-robot.png";
import chatbotBg from "@/assets/chatbot-bg.png";
import { chatFn } from "@/lib/chat.functions";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const SESSION_KEY = "rk_chat_session";
const NAME_KEY = "rk_chat_name";

const NEW_GREETING =
  "Hi! I'm rkInfinity's assistant 🤖✨ Ask me anything about SEO, digital marketing, web dev, or RK's services. You can also track your project here using your unique ID — just type away.";

function getOrCreateSession(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function detectDevice(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}

function captureName(text: string): string | null {
  const m = text.match(/(?:my name is|i am|i'm|this is)\s+([A-Z][a-zA-Z]{1,30})/i);
  return m ? m[1] : null;
}

// SpeechRecognition typing
interface SRResultAlt { transcript: string }
interface SRResult { 0: SRResultAlt; isFinal: boolean }
interface SREvent { results: ArrayLike<SRResult> & { length: number }; resultIndex: number }
interface SRErrorEvent { error: string }
interface SRInstance {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: (e: SREvent) => void; onerror: (e: SRErrorEvent) => void; onend: () => void;
  start: () => void; stop: () => void; abort: () => void;
}
type SRCtor = new () => SRInstance;
function getSR(): SRCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [userName, setUserName] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recogRef = useRef<SRInstance | null>(null);
  const bootstrappedRef = useRef(false);

  // Bootstrap: session + history + greeting
  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    const sid = getOrCreateSession();
    setSessionId(sid);

    (async () => {
      // Upsert chat user
      const cachedName = localStorage.getItem(NAME_KEY);
      if (cachedName) setUserName(cachedName);

      try {
        const { data: existing } = await supabase
          .from("chat_users")
          .select("user_name")
          .eq("session_id", sid)
          .maybeSingle();

        const name = existing?.user_name ?? cachedName ?? null;
        if (name && !cachedName) localStorage.setItem(NAME_KEY, name);
        if (name) setUserName(name);

        await supabase.from("chat_users").upsert(
          {
            session_id: sid,
            user_name: name,
            device: detectDevice(),
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: "session_id" }
        );

        // Load history
        const { data: hist } = await supabase
          .from("chat_messages")
          .select("role, content, created_at")
          .eq("session_id", sid)
          .order("created_at", { ascending: true })
          .limit(50);

        const past: Msg[] =
          (hist ?? [])
            .filter((m) => m.role === "user" || m.role === "assistant" || m.role === "admin")
            .map((m) => ({
              role: m.role === "user" ? "user" : "assistant",
              content: m.content,
            }));

        if (past.length) {
          setMessages(past);
        } else {
          const greet = name
            ? `Welcome back, ${name}! 👋 What can I help you with today?`
            : NEW_GREETING;
          setMessages([{ role: "assistant", content: greet }]);
        }
      } catch (err) {
        console.warn("chat bootstrap failed", err);
        setMessages([{ role: "assistant", content: NEW_GREETING }]);
      }
    })();
  }, []);

  // Realtime: admin replies
  useEffect(() => {
    if (!sessionId) return;
    const ch = supabase
      .channel(`chat-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const row = payload.new as { role: string; content: string };
          if (row.role === "admin") {
            setMessages((m) => [...m, { role: "assistant", content: `💬 ${row.content}` }]);
          }
        }
      )
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [sessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const baseInputRef = useRef<string>("");

  const toggleMic = () => {
    const SRClass = getSR();
    if (!SRClass) { toast.error("Voice input isn't supported. Try Chrome or Edge."); return; }
    if (listening && recogRef.current) { recogRef.current.stop(); return; }
    const r = new SRClass();
    r.lang = "en-US"; r.interimResults = true; r.continuous = false;
    baseInputRef.current = input ? input.trim() + " " : "";
    r.onresult = (e) => {
      let finalText = ""; let interimText = "";
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        const chunk = res[0]?.transcript ?? "";
        if (res.isFinal) finalText += chunk + " "; else interimText += chunk;
      }
      setInput((baseInputRef.current + finalText + interimText).replace(/\s+/g, " ").trimStart());
      if (finalText.trim()) {
        try { r.stop(); } catch { /* noop */ }
        const toSend = (baseInputRef.current + finalText).replace(/\s+/g, " ").trim();
        setTimeout(() => { setInput(toSend); void send(toSend); }, 100);
      }
    };
    r.onerror = (e) => {
      setListening(false);
      const code = e?.error ?? "error";
      toast.error(code === "no-speech" ? "I didn't catch that." : `Voice error: ${code}`);
      try { r.abort(); } catch { /* noop */ }
    };
    r.onend = () => { setListening(false); recogRef.current = null; };
    recogRef.current = r;
    setListening(true);
    try { r.start(); } catch { setListening(false); toast.error("Couldn't start microphone."); }
  };

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");

    // Capture name on the fly
    const captured = captureName(text);
    if (captured && !userName) {
      setUserName(captured);
      localStorage.setItem(NAME_KEY, captured);
      try {
        await supabase
          .from("chat_users")
          .update({ user_name: captured })
          .eq("session_id", sessionId);
      } catch { /* noop */ }
    }

    setLoading(true);
    try {
      const data = await chatFn({
        data: { messages: next, session_id: sessionId, user_name: userName ?? captured ?? undefined },
      });
      // Manual mode: don't render the placeholder twice
      if (data.source !== "manual") {
        setMessages((m) => [...m, { role: "assistant", content: data.content }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.content }]);
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Hmm, I hit a snag (${e instanceof Error ? e.message : "unknown"}). Please try again in a moment.` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-24 right-6 z-[60] grid h-16 w-16 place-items-center rounded-full overflow-hidden border-2 border-[color:var(--gold)] shadow-[0_0_24px_oklch(0.78_0.14_85/0.55)] hover:scale-105 transition bg-black"
        >
          <img src={robotLogo} alt="rkInfinity chatbot" className="h-full w-full object-cover" />
        </button>
      )}

      {open && (
        <div
          className="fixed bottom-6 right-6 z-[70] w-[min(380px,calc(100vw-2rem))] h-[min(560px,calc(100vh-3rem))] rounded-2xl flex flex-col overflow-hidden border border-[color:var(--gold)]/60 shadow-[0_0_40px_oklch(0.78_0.14_85/0.45)] animate-fade-in relative bg-black"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.7)), url(${chatbotBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative flex items-center gap-3 px-4 py-3 border-b border-[color:var(--gold)]/30 bg-black/55 backdrop-blur-sm">
            <img src={robotLogo} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-[color:var(--gold)]/60" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold">
                <span className="text-white">rk</span><span className="text-gradient">Infinity</span> Assistant
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[color:var(--gold-bright)]">
                {userName ? `Signed in as ${userName}` : "Online · Anonymous OK"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/5 text-muted-foreground"
            >
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-3 py-4 space-y-3 text-sm text-white">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm px-3.5 py-2.5 bg-[color:var(--gold)]/15 text-foreground border border-[color:var(--gold)]/30"
                      : "max-w-[85%] rounded-2xl rounded-bl-sm px-3.5 py-2.5 bg-white/5 text-foreground/95 border border-white/10"
                  }
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm px-3.5 py-2.5 bg-white/5 border border-white/10 text-muted-foreground inline-flex items-center gap-2 text-xs">
                  <Loader2 size={14} className="animate-spin" /> thinking…
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="relative border-t border-[color:var(--gold)]/30 p-3 flex gap-2 items-center bg-black/55 backdrop-blur-sm"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening…" : "Type or speak your message…"}
              className="flex-1 bg-black border border-[color:var(--gold)]/40 rounded-full px-4 py-2.5 text-sm outline-none focus:border-[color:var(--gold-bright)] placeholder:text-muted-foreground"
              aria-label="Message"
            />
            <button
              type="button"
              onClick={toggleMic}
              aria-label={listening ? "Stop listening" : "Start voice input"}
              className={`grid h-10 w-10 place-items-center rounded-full border transition ${
                listening
                  ? "bg-[color:var(--gold)]/20 border-[color:var(--gold-bright)] text-[color:var(--gold-bright)] animate-pulse"
                  : "bg-black border-[color:var(--gold)]/50 text-[color:var(--gold)] hover:border-[color:var(--gold-bright)] hover:text-[color:var(--gold-bright)]"
              }`}
            >
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send"
              className="grid h-10 w-10 place-items-center rounded-full text-black disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--gradient-gold)" }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
