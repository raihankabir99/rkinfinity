import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { verifyAdminSession } from "@/lib/admin-session";
import { AdminShell } from "@/admin/AdminShell";
import {
  Activity,
  Users,
  AlertTriangle,
  MessageSquare,
  Mail,
  Globe,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Pulse Admin — rkInfinity" },
      { name: "description", content: "rkInfinity real-time admin dashboard" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

interface Visitor {
  id: string;
  session_id: string | null;
  path: string | null;
  country: string | null;
  city: string | null;
  user_agent: string | null;
  created_at: string;
}
interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  message: string | null;
  source: string | null;
  created_at: string;
}
interface SiteError {
  id: string;
  message: string | null;
  path: string | null;
  level: string | null;
  created_at: string;
}
interface ChatLog {
  id: string;
  user_message: string | null;
  bot_reply: string | null;
  created_at: string;
}

function AdminPage() {
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [visitorMetrics, setVisitorMetrics] = useState({ pageviews24h: 0, uniqueSessions24h: 0 });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [errors, setErrors] = useState<SiteError[]>([]);
  const [chats, setChats] = useState<ChatLog[]>([]);

  // Auth + role check
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate({ to: "/login" });
        return;
      }
      const ok = await verifyAdminSession(sess.session.access_token);
      if (!mounted) return;
      setIsAdmin(ok);
      setAuthChecking(false);
      if (!ok) toast.error("Admin access required");
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const loadAll = async () => {
    setRefreshing(true);
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const allVisitors: Visitor[] = [];
      const pageSize = 1000;
      for (let from = 0; ; from += pageSize) {
        const { data, error } = await supabase
          .from("visitor_tracking")
          .select("id, session_id, path, country, city, user_agent, created_at")
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .range(from, from + pageSize - 1);
        if (error) throw error;
        const page = (data ?? []) as Visitor[];
        allVisitors.push(...page);
        if (page.length < pageSize) break;
      }

      const [l, e, c] = await Promise.all([
        supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(25),
        supabase.from("site_errors").select("*").order("created_at", { ascending: false }).limit(25),
        supabase.from("chat_logs").select("*").order("created_at", { ascending: false }).limit(25),
      ]);
      if (l.error) throw l.error;
      if (e.error) throw e.error;
      if (c.error) throw c.error;

      setVisitors(allVisitors.slice(0, 50));
      setVisitorMetrics({
        pageviews24h: allVisitors.length,
        uniqueSessions24h: new Set(allVisitors.map((visitor) => visitor.session_id).filter(Boolean)).size,
      });
      setLeads((l.data ?? []) as Lead[]);
      setErrors((e.data ?? []) as SiteError[]);
      setChats((c.data ?? []) as ChatLog[]);
    } catch (error) {
      console.error("Admin dashboard refresh failed", error);
      toast.error("Dashboard data could not be fully refreshed. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    void loadAll();

    // Realtime: visitor_tracking inserts
    const channel = supabase
      .channel("admin-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "visitor_tracking" },
        (payload) => {
          setVisitors((prev) => [payload.new as Visitor, ...prev].slice(0, 50));
        },
      )
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads" }, (payload) => {
        setLeads((prev) => [payload.new as Lead, ...prev].slice(0, 25));
        toast.success("New lead received");
      })
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "site_errors" },
        (payload) => {
          setErrors((prev) => [payload.new as SiteError, ...prev].slice(0, 25));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const stats = useMemo(() => ({
    pageviews24h: visitorMetrics.pageviews24h,
    uniqueSessions: visitorMetrics.uniqueSessions24h,
    leads: leads.length,
    errors: errors.length,
  }), [visitorMetrics, leads, errors]);

  if (authChecking) {
    return (
      <AdminShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AdminShell>
    );
  }

  if (!isAdmin) {
    return (
      <AdminShell>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account does not have the admin role. Contact the site owner.
          </p>
          <Link to="/" className="mt-6 inline-block text-primary hover:underline">
            ← Back home
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
              <Activity size={14} /> Pulse
            </div>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl">
              <span className="text-white">Admin </span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time visitors, leads, errors and chat activity
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/trainer"
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/60 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition"
            >
              Train bot
            </Link>
            <Link
              to="/admin/knowledge"
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/60 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition"
            >
              Knowledge
            </Link>
            <Link
              to="/admin/blog"
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/60 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition"
            >
              Blog CMS
            </Link>
            <Link
              to="/admin/chats"
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/60 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition"
            >
              Chats
            </Link>
            <Link
              to="/admin/leads"
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/60 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition"
            >
              Leads
            </Link>
            <Link
              to="/admin/analytics"
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/60 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition"
            >
              Analytics
            </Link>
            <button
              onClick={loadAll}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/60 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/login" });
              }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard icon={<Users size={18} />} label="Pageviews (24h)" value={stats.pageviews24h} />
          <KpiCard
            icon={<Globe size={18} />}
            label="Unique sessions"
            value={stats.uniqueSessions}
          />
          <KpiCard icon={<Mail size={18} />} label="Recent leads" value={stats.leads} />
          <KpiCard
            icon={<AlertTriangle size={18} />}
            label="Recent errors"
            value={stats.errors}
            accent="destructive"
          />
        </div>

        {/* Two-column tables */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="Live visitors" icon={<Activity size={16} />} live>
            <Table
              empty="No visits yet."
              rows={visitors.slice(0, 15).map((v) => ({
                key: v.id,
                cells: [
                  fmtTime(v.created_at),
                  v.path ?? "/",
                  [v.city, v.country].filter(Boolean).join(", ") || "—",
                ],
              }))}
              headers={["Time", "Path", "Location"]}
            />
          </Panel>

          <Panel title="Recent leads" icon={<Mail size={16} />}>
            <Table
              empty="No leads yet."
              rows={leads.slice(0, 10).map((l) => ({
                key: l.id,
                cells: [fmtTime(l.created_at), l.name ?? "—", l.email ?? "—"],
              }))}
              headers={["Time", "Name", "Email"]}
            />
          </Panel>

          <Panel title="Site errors" icon={<AlertTriangle size={16} />}>
            <Table
              empty="No errors logged."
              rows={errors.slice(0, 10).map((e) => ({
                key: e.id,
                cells: [fmtTime(e.created_at), e.path ?? "—", truncate(e.message ?? "", 60)],
              }))}
              headers={["Time", "Path", "Message"]}
            />
          </Panel>

          <Panel title="Chatbot conversations" icon={<MessageSquare size={16} />}>
            <Table
              empty="No chat activity."
              rows={chats.slice(0, 10).map((c) => ({
                key: c.id,
                cells: [
                  fmtTime(c.created_at),
                  truncate(c.user_message ?? "", 50),
                  truncate(c.bot_reply ?? "", 50),
                ],
              }))}
              headers={["Time", "User", "Bot"]}
            />
          </Panel>
        </div>
      </section>
    </AdminShell>
  );
}

function KpiCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: "destructive";
}) {
  return (
    <div className="glass relative overflow-hidden rounded-2xl border border-white/5 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span
          className={`grid h-8 w-8 place-items-center rounded-full ${
            accent === "destructive"
              ? "bg-destructive/15 text-destructive"
              : "bg-primary/15 text-primary"
          }`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 text-3xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function Panel({
  title,
  icon,
  live,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  live?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl border border-white/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="text-primary">{icon}</span>
          {title}
        </h2>
        {live && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
            Live
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Table({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: { key: string; cells: (string | number)[] }[];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-xs text-muted-foreground">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-muted-foreground">
            {headers.map((h) => (
              <th key={h} className="py-2 pr-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.key}
              className="border-b border-white/5 last:border-none hover:bg-primary/5 transition"
            >
              {r.cells.map((c, i) => (
                <td key={i} className="py-2 pr-3 text-foreground/90">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
