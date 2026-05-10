import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import {
  MessageSquare,
  Loader2,
  ShieldCheck,
  ArrowLeft,
  Bot,
  User as UserIcon,
  Send,
  Bell,
  BellOff,
} from "lucide-react";
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

interface MsgRow {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "admin";
  content: string;
  created_at: string;
}
interface ChatUserRow {
  session_id: string;
  user_name: string | null;
  country: string | null;
  city: string | null;
  device: string | null;
  mode: "ai" | "manual";
  last_seen_at: string;
  created_at: string;
}

function ChatsPage() {
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [msgs, setMsgs] = useState<MsgRow[]>([]);
  const [users, setUsers] = useState<Record<string, ChatUserRow>>({});
  const [active, setActive] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [notif, setNotif] = useState(false);
  const focusRef = useRef(true);

  useEffect(() => {
    const onFocus = () => {
      focusRef.current = true;
    };
    const onBlur = () => {
      focusRef.current = false;
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

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
      if (ok) void loadAll();
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const loadAll = async () => {
    const [{ data: m }, { data: u }] = await Promise.all([
      supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase
        .from("chat_users")
        .select("*")
        .order("last_seen_at", { ascending: false })
        .limit(500),
    ]);
    if (m) setMsgs(m as MsgRow[]);
    if (u) {
      const map: Record<string, ChatUserRow> = {};
      for (const r of u as ChatUserRow[]) map[r.session_id] = r;
      setUsers(map);
    }
  };

  // Realtime + push notifications
  useEffect(() => {
    if (!isAdmin) return;
    const ch = supabase
      .channel("admin-chats-v2")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const row = payload.new as MsgRow;
          setMsgs((prev) => [row, ...prev].slice(0, 1000));
          if (
            row.role === "user" &&
            notif &&
            !focusRef.current &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            const u = users[row.session_id];
            new Notification(`New message from ${u?.user_name ?? "visitor"}`, {
              body: row.content.slice(0, 120),
              icon: "/favicon.png",
            });
          }
        },
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_users" }, (payload) => {
        const row = payload.new as ChatUserRow;
        if (row?.session_id) setUsers((u) => ({ ...u, [row.session_id]: row }));
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [isAdmin, notif, users]);

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      toast.error("Notifications unsupported");
      return;
    }
    if (Notification.permission === "granted") {
      setNotif(true);
      toast.success("Notifications on");
      return;
    }
    const p = await Notification.requestPermission();
    if (p === "granted") {
      setNotif(true);
      toast.success("Notifications enabled");
    } else toast.error("Permission denied");
  };

  const sessions = useMemo(() => {
    const map = new Map<string, MsgRow[]>();
    for (const r of msgs) {
      const k = r.session_id || "(none)";
      const arr = map.get(k) ?? [];
      arr.push(r);
      map.set(k, arr);
    }
    return Array.from(map.entries())
      .map(([sid, arr]) => ({
        sid,
        msgs: arr.slice().sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at)),
        last: arr[0],
      }))
      .sort((a, b) => +new Date(b.last.created_at) - +new Date(a.last.created_at));
  }, [msgs]);

  const activeMsgs = useMemo(
    () => sessions.find((s) => s.sid === active)?.msgs ?? [],
    [sessions, active],
  );
  const activeUser = active ? users[active] : null;

  const toggleMode = async () => {
    if (!active || !activeUser) return;
    const nextMode: "ai" | "manual" = activeUser.mode === "manual" ? "ai" : "manual";
    const { error } = await supabase
      .from("chat_users")
      .update({ mode: nextMode })
      .eq("session_id", active);
    if (error) toast.error(error.message);
    else {
      setUsers((u) => ({ ...u, [active]: { ...activeUser, mode: nextMode } }));
      toast.success(`Switched to ${nextMode.toUpperCase()} mode`);
    }
  };

  const sendReply = async () => {
    if (!active || !reply.trim()) return;
    const text = reply.trim();
    setReply("");
    const { error } = await supabase.from("chat_messages").insert({
      session_id: active,
      role: "admin",
      content: text,
    });
    if (error) toast.error(error.message);
  };

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
          <Link to="/" className="mt-6 inline-block text-primary hover:underline">
            ← Back home
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
              <MessageSquare size={14} /> Inbox
            </div>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl">
              <span className="text-white">Live </span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Chats
              </span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {sessions.length} sessions · {msgs.length} messages · realtime
            </p>
          </div>
          <button
            onClick={enableNotifications}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)]/40 px-3 py-1.5 text-xs hover:bg-white/5"
          >
            {notif ? <Bell size={14} /> : <BellOff size={14} />}
            {notif ? "Notifications on" : "Enable notifications"}
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="glass rounded-2xl border border-white/5 p-3 max-h-[70vh] overflow-y-auto">
            {sessions.length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No conversations yet.
              </p>
            )}
            {sessions.map((s) => {
              const u = users[s.sid];
              const isReturning =
                u && new Date(u.created_at).getTime() < Date.now() - 24 * 60 * 60 * 1000;
              return (
                <button
                  key={s.sid}
                  onClick={() => setActive(s.sid)}
                  className={`w-full text-left rounded-xl px-3 py-2.5 mb-1 transition ${
                    active === s.sid
                      ? "bg-primary/15 border border-primary/40"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-primary truncate">
                      {u?.user_name ?? `Visitor ${s.sid.slice(0, 6)}`}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {fmtTime(s.last.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 mt-1 truncate">
                    {s.last.content || "—"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">{s.msgs.length} msgs</span>
                    {u?.city && (
                      <span className="text-[10px] text-muted-foreground">
                        · {u.city}
                        {u.country ? `, ${u.country}` : ""}
                      </span>
                    )}
                    {u?.device && (
                      <span className="text-[10px] text-muted-foreground">· {u.device}</span>
                    )}
                    <span
                      className={`ml-auto text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        u?.mode === "manual"
                          ? "bg-accent/20 text-accent"
                          : "bg-primary/15 text-primary"
                      }`}
                    >
                      {u?.mode ?? "ai"}
                    </span>
                    {isReturning && <span className="text-[10px] text-emerald-400">returning</span>}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="glass rounded-2xl border border-white/5 flex flex-col max-h-[70vh]">
            {!active && (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Select a session to view the conversation.
              </p>
            )}
            {active && (
              <>
                <div className="border-b border-white/5 p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">
                      {activeUser?.user_name ?? "Anonymous visitor"}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {active.slice(0, 16)}…
                    </div>
                  </div>
                  <button
                    onClick={toggleMode}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      activeUser?.mode === "manual"
                        ? "bg-accent/20 border-accent text-accent"
                        : "bg-primary/10 border-primary/40 text-primary"
                    }`}
                  >
                    {activeUser?.mode === "manual"
                      ? "Manual mode (you reply)"
                      : "AI mode (auto-reply)"}
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {activeMsgs.map((m) => (
                    <div
                      key={m.id}
                      className={`flex gap-2 ${m.role === "user" ? "" : "justify-end"}`}
                    >
                      {m.role === "user" && (
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary/15 text-secondary">
                          <UserIcon size={12} />
                        </span>
                      )}
                      <div
                        className={`rounded-2xl px-3 py-2 text-sm max-w-[80%] whitespace-pre-wrap ${
                          m.role === "user"
                            ? "rounded-tl-sm bg-secondary/10 border border-secondary/20"
                            : m.role === "admin"
                              ? "rounded-tr-sm bg-accent/15 border border-accent/40"
                              : "rounded-tr-sm bg-primary/10 border border-primary/30"
                        }`}
                      >
                        {m.content}
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {fmtTime(m.created_at)} · {m.role}
                        </div>
                      </div>
                      {m.role !== "user" && (
                        <span
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                            m.role === "admin"
                              ? "bg-accent/20 text-accent"
                              : "bg-primary/15 text-primary"
                          }`}
                        >
                          <Bot size={12} />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void sendReply();
                  }}
                  className="border-t border-white/5 p-3 flex gap-2"
                >
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type a reply…"
                    className="flex-1 bg-background/50 border border-white/10 rounded-full px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={!reply.trim()}
                    className="grid h-10 w-10 place-items-center rounded-full text-black disabled:opacity-50"
                    style={{ background: "var(--gradient-gold)" }}
                  >
                    <Send size={16} />
                  </button>
                </form>
              </>
            )}
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
