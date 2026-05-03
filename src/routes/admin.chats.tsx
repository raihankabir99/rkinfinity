import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import { MessageSquare, Loader2, ShieldCheck, ArrowLeft, Bot, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/chats")({
  head: () => ({
    meta: [
      { title: "Live Chats — rkInfinity Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ChatsPage,
});

interface ChatRow {
  id: string;
  session_id: string | null;
  user_message: string | null;
  bot_reply: string | null;
  created_at: string;
}

function ChatsPage() {
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState<ChatRow[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate({ to: "/login" });
        return;
      }
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sess.session.user.id)
        .eq("role", "admin");
      if (!mounted) return;
      const ok = !!roleRows && roleRows.length > 0;
      setIsAdmin(ok);
      setAuthChecking(false);
      if (ok) void load();
    })();
    return () => { mounted = false; };
  }, [navigate]);

  const load = async () => {
    const { data, error } = await supabase
      .from("chat_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    if (data) setRows(data as ChatRow[]);
  };

  // Realtime
  useEffect(() => {
    if (!isAdmin) return;
    const ch = supabase
      .channel("admin-chats")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_logs" },
        (payload) => {
          setRows((prev) => [payload.new as ChatRow, ...prev].slice(0, 500));
        },
      )
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [isAdmin]);

  const sessions = useMemo(() => {
    const map = new Map<string, ChatRow[]>();
    for (const r of rows) {
      const key = r.session_id || "(no-session)";
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    }
    return Array.from(map.entries())
      .map(([sid, msgs]) => ({
        sid,
        msgs: msgs.slice().sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at)),
        last: msgs[0],
      }))
      .sort((a, b) => +new Date(b.last.created_at) - +new Date(a.last.created_at));
  }, [rows]);

  const activeMsgs = useMemo(
    () => sessions.find((s) => s.sid === activeSession)?.msgs ?? [],
    [sessions, activeSession],
  );

  if (authChecking) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </PageShell>
    );
  }
  if (!isAdmin) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold">Admin access required</h1>
          <Link to="/" className="mt-6 inline-block text-primary hover:underline">← Back home</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
            <MessageSquare size={14} /> Inbox
          </div>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">
            <span className="text-white">Live </span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Chats</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sessions.length} sessions · {rows.length} messages · realtime
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          {/* Sessions */}
          <div className="glass rounded-2xl border border-white/5 p-3 max-h-[70vh] overflow-y-auto">
            {sessions.length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">No conversations yet.</p>
            )}
            {sessions.map((s) => (
              <button
                key={s.sid}
                onClick={() => setActiveSession(s.sid)}
                className={`w-full text-left rounded-xl px-3 py-2.5 mb-1 transition ${
                  activeSession === s.sid
                    ? "bg-primary/15 border border-primary/40"
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-primary truncate">
                    {s.sid.slice(0, 12)}…
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {fmtTime(s.last.created_at)}
                  </span>
                </div>
                <p className="text-xs text-foreground/80 mt-1 truncate">
                  {s.last.user_message || s.last.bot_reply || "—"}
                </p>
                <span className="text-[10px] text-muted-foreground">{s.msgs.length} msgs</span>
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="glass rounded-2xl border border-white/5 p-5 max-h-[70vh] overflow-y-auto">
            {!activeSession && (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Select a session to view the conversation.
              </p>
            )}
            {activeSession && activeMsgs.map((m) => (
              <div key={m.id} className="mb-4 space-y-2">
                {m.user_message && (
                  <div className="flex gap-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary/15 text-secondary">
                      <UserIcon size={12} />
                    </span>
                    <div className="rounded-2xl rounded-tl-sm bg-secondary/10 border border-secondary/20 px-3 py-2 text-sm max-w-[80%]">
                      {m.user_message}
                      <div className="text-[10px] text-muted-foreground mt-1">{fmtTime(m.created_at)}</div>
                    </div>
                  </div>
                )}
                {m.bot_reply && (
                  <div className="flex gap-2 justify-end">
                    <div className="rounded-2xl rounded-tr-sm bg-primary/10 border border-primary/30 px-3 py-2 text-sm max-w-[80%] whitespace-pre-wrap">
                      {m.bot_reply}
                      <div className="text-[10px] text-muted-foreground mt-1 text-right">{fmtTime(m.created_at)}</div>
                    </div>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                      <Bot size={12} />
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return d.toLocaleDateString();
}
