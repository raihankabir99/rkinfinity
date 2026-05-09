import { useEffect, useRef, useState } from "react";
import { X, Send, Loader2, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import robotLogo from "@/assets/chatbot-robot.png";
import chatbotBg from "@/assets/chatbot-bg.png";
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

// SpeechRecognition Types
interface SRInstance {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: (e: any) => void; onerror: (e: any) => void; onend: () => void;
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

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    const sid = getOrCreateSession();
    setSessionId(sid);

    (async () => {
      const cachedName = localStorage.getItem(NAME_KEY);
      if (cachedName) setUserName(cachedName);
      try {
        const { data: existing } = await supabase
          .from("chat_users")
          .select("user_name")
          .eq("session_id", sid)
          .maybeSingle();

        const name = existing?.user_name ?? cachedName ?? null;
        if (name) {
          setUserName(name);
          localStorage.setItem(NAME_KEY, name);
        }

        await supabase.from("chat_users").upsert(
          {
            session_id: sid,
            user_name: name,
            device: detectDevice(),
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: "session_id" }
        );

        const { data: hist } = await supabase
          .from("chat_messages")
          .select("role, content, created_at")
          .eq("session_id", sid)
          .order("created_at", { ascending: true })
          .limit(50);

        const past: Msg[] = (hist ?? [])
          .filter((m) => m.role === "user" || m.role === "assistant" || m.role === "admin")
          .map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          }));

        if (past.length) setMessages(past);
        else setMessages([{ role: "assistant", content: name ? `Welcome back, ${name}! 👋` : NEW_GREETING }]);
      } catch (err) {
        setMessages([{ role: "assistant", content: NEW_GREETING }]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    const ch = supabase.channel(`chat-${sessionId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const row = payload.new as { role: string; content: string };
          if (row.role === "admin") setMessages((m) => [...m, { role: "assistant", content: `💬 ${row.content}` }]);
        })
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [sessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const toggleMic = () => {
    const SRClass = getSR();
    if (!SRClass) { toast.error("Voice input not supported."); return; }
    if (listening && recogRef.current) { recogRef.current.stop(); return; }
    const r = new SRClass();
    r.lang = "en-US"; r.interimResults = true;
    r.onresult = (e) => {
      const text = Array.from(e.results).map((res: any) => res[0].transcript).join("");
      setInput(text);
      if (e.results[0].isFinal) { setInput(text); r.stop(); }
    };
    r.onend = () => setListening(false);
    recogRef.current = r; setListening(true); r.start();
  };

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    const captured = captureName(text);
    if (captured && !userName) {
      setUserName(captured);
      localStorage.setItem(NAME_KEY, captured);
      await supabase.from("chat_users").update({ user_name: captured }).eq("session_id", sessionId);
    }

    try {
      const response = await fetch("https://rk-infinity-api.rkinfinity.workers.dev/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: next, 
          session_id: sessionId, 
          user_name: userName ?? captured ?? "Visitor" 
        }),
      });

      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply || data.content }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Snag hit. Try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-24 right-6 z-[60] h-16 w-16 rounded-full border-2 border-[color:var(--gold)] bg-black overflow-hidden shadow-lg hover:scale-105 transition">
          <img src={robotLogo} alt="AI" className="h-full w-full object-cover" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-[70] w-[min(380px,calc(100vw-2rem))] h-[min(560px,calc(100vh-3rem))] rounded-2xl flex flex-col bg-black border border-[color:var(--gold)]/60 shadow-2xl overflow-hidden"
             style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(${chatbotBg})`, backgroundSize: 'cover' }}>
          
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[color:var(--gold)]/30 bg-black/40 backdrop-blur-md">
            <img src={robotLogo} className="h-9 w-9 rounded-full border border-[color:var(--gold)]/50" />
            <div className="flex-1 text-sm font-bold text-white">rk<span className="text-[color:var(--gold)]">Infinity</span> AI</div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground"><X size={18} /></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${m.role === "user" ? "bg-[color:var(--gold)]/20 text-white border border-[color:var(--gold)]/30" : "bg-white/10 text-gray-200 border border-white/10"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-gray-500 animate-pulse">Assistant is thinking...</div>}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-3 border-t border-[color:var(--gold)]/20 flex gap-2 bg-black/60">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything..." className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white text-sm outline-none focus:border-[color:var(--gold)]" />
            <button type="button" onClick={toggleMic} className={`p-2 rounded-full ${listening ? "bg-red-500/20 text-red-500" : "text-[color:var(--gold)]"}`}><Mic size={18} /></button>
            <button type="submit" disabled={!input.trim() || loading} className="p-2 bg-[color:var(--gold)] rounded-full text-black disabled:opacity-50"><Send size={18} /></button>
          </form>
        </div>
      )}
    </>
  );
}
