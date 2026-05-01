import { useEffect, useRef, useState } from "react";
import { X, Send, Loader2, Mic, MicOff } from "lucide-react";
import robotLogo from "@/assets/chatbot-robot.png";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi! I'm rkInfinity's assistant 🤖✨ Ask me anything about SEO, digital marketing, web dev, or RK's services. You can also track your project here using your unique ID. No login needed — just type away.",
};

// Detect a project ID pattern (e.g. RK-1234, PRJ-ABCD, or 6+ alphanumerics with a dash)
const PROJECT_ID_RE = /\b([A-Z]{2,5}-[A-Z0-9]{3,10}|#?\d{4,8})\b/i;

function detectProjectId(text: string): string | null {
  const m = text.match(PROJECT_ID_RE);
  if (!m) return null;
  // Avoid false positives on plain years like "2026"
  if (/^\d{4}$/.test(m[0]) && Number(m[0]) >= 1900 && Number(m[0]) <= 2100) return null;
  return m[0].replace(/^#/, "");
}

// SpeechRecognition typing
interface SRInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: (e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void;
  onerror: (e: unknown) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}
type SRCtor = new () => SRInstance;

function getSR(): SRCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recogRef = useRef<SRInstance | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const toggleMic = () => {
    const SRClass = getSR();
    if (!SRClass) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Voice input isn't supported in this browser. Try Chrome or Edge on desktop/Android." },
      ]);
      return;
    }
    if (listening && recogRef.current) {
      recogRef.current.stop();
      return;
    }
    const r = new SRClass();
    r.lang = "en-US";
    r.interimResults = false;
    r.continuous = false;
    r.onresult = (e) => {
      const transcript = Array.from({ length: e.results.length }, (_, i) => e.results[i][0].transcript).join(" ");
      setInput((prev) => (prev ? prev + " " + transcript : transcript).trim());
    };
    r.onerror = () => setListening(false);
    r.onend = () => {
      setListening(false);
      recogRef.current = null;
    };
    recogRef.current = r;
    setListening(true);
    try {
      r.start();
    } catch {
      setListening(false);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");

    // Project ID short-circuit — answer locally without an AI call
    const pid = detectProjectId(text);
    const mentionsTrack = /\btrack(ing)?\b|\bstatus\b|\bproject id\b/i.test(text);
    if (pid && mentionsTrack) {
      const reply = `Got it — your project ID is **${pid}**. To track its status:\n\n1. Visit the [Contact page](/contact) and mention your ID, or\n2. Email RK directly with the ID in the subject line.\n\nYou'll get an update within 24 hours. ✨`;
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Network error");
      setMessages((m) => [...m, { role: "assistant", content: data.content }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `Hmm, I hit a snag (${e instanceof Error ? e.message : "unknown"}). Please try again in a moment.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Launcher — robot logo bottom-right (sits above the WA button) */}
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

      {/* Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[70] w-[min(380px,calc(100vw-2rem))] h-[min(560px,calc(100vh-3rem))] rounded-2xl flex flex-col overflow-hidden bg-black border border-[color:var(--gold)]/60 shadow-[0_0_40px_oklch(0.78_0.14_85/0.45)] animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[color:var(--gold)]/30 bg-gradient-to-r from-black via-[oklch(0.08_0.005_80)] to-black">
            <img src={robotLogo} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-[color:var(--gold)]/60" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold">
                <span className="text-white">rk</span><span className="text-gradient">Infinity</span> Assistant
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[color:var(--gold-bright)]">Online · Anonymous OK</div>
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

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 text-sm">
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

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="border-t border-[color:var(--gold)]/30 p-3 flex gap-2 items-center"
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
              title={listening ? "Stop listening" : "Voice input"}
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
