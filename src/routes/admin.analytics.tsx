import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import {
  BarChart3,
  Loader2,
  ShieldCheck,
  ArrowLeft,
  Globe,
  Users,
  FileText,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — rkInfinity Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AnalyticsPage,
});

interface VisitorRow {
  id: string;
  session_id: string | null;
  path: string | null;
  country: string | null;
  city: string | null;
  referrer: string | null;
  created_at: string;
}

function AnalyticsPage() {
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState<VisitorRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const load = async () => {
    setRefreshing(true);
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("visitor_tracking")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1000);
    setRefreshing(false);
    if (error) toast.error(error.message);
    if (data) setRows(data as VisitorRow[]);
  };

  const stats = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const inWindow = (ms: number) => rows.filter((r) => now - +new Date(r.created_at) < ms);
    const last24 = inWindow(day);
    const last7 = inWindow(7 * day);

    const topCount = (key: keyof VisitorRow, src: VisitorRow[] = rows) => {
      const map = new Map<string, number>();
      for (const r of src) {
        const v = (r[key] as string | null) || "—";
        map.set(v, (map.get(v) ?? 0) + 1);
      }
      return Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    };

    // Daily series last 14 days
    const days: { label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - i);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const c = rows.filter((r) => {
        const t = +new Date(r.created_at);
        return t >= +start && t < +end;
      }).length;
      days.push({ label: `${start.getMonth() + 1}/${start.getDate()}`, count: c });
    }

    return {
      total: rows.length,
      pv24: last24.length,
      pv7: last7.length,
      sessions24: new Set(last24.map((r) => r.session_id)).size,
      sessions7: new Set(last7.map((r) => r.session_id)).size,
      topPaths: topCount("path"),
      topCountries: topCount("country"),
      topReferrers: topCount("referrer"),
      days,
    };
  }, [rows]);

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

  const maxDay = Math.max(1, ...stats.days.map((d) => d.count));

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
              <BarChart3 size={14} /> Insights
            </div>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl">
              <span className="text-white">Site </span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Analytics
              </span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Last 30 days · {rows.length} pageviews
            </p>
          </div>
          <button
            onClick={load}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/60 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Kpi icon={<Users size={16} />} label="Pageviews 24h" value={stats.pv24} />
          <Kpi icon={<Users size={16} />} label="Sessions 24h" value={stats.sessions24} />
          <Kpi icon={<FileText size={16} />} label="Pageviews 7d" value={stats.pv7} />
          <Kpi icon={<Globe size={16} />} label="Sessions 7d" value={stats.sessions7} />
        </div>

        {/* Bar chart */}
        <div className="glass rounded-2xl border border-white/5 p-5 mb-6">
          <h2 className="text-sm font-semibold mb-4">Pageviews — last 14 days</h2>
          <div className="flex items-end gap-2 h-40">
            {stats.days.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-primary to-accent min-h-[2px]"
                  style={{ height: `${(d.count / maxDay) * 100}%` }}
                  title={`${d.count} pageviews`}
                />
                <span className="text-[9px] text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <TopList title="Top pages" rows={stats.topPaths} />
          <TopList title="Top countries" rows={stats.topCountries} />
          <TopList title="Top referrers" rows={stats.topReferrers} />
        </div>
      </section>
    </PageShell>
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="glass rounded-2xl border border-white/5 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary">
          {icon}
        </span>
      </div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
    </div>
  );
}

function TopList({ title, rows }: { title: string; rows: [string, number][] }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <div className="glass rounded-2xl border border-white/5 p-5">
      <h2 className="text-sm font-semibold mb-4">{title}</h2>
      {rows.length === 0 && <p className="text-xs text-muted-foreground">No data.</p>}
      <ul className="space-y-2">
        {rows.map(([name, count]) => (
          <li key={name} className="text-xs">
            <div className="flex justify-between mb-1">
              <span className="truncate text-foreground/90 max-w-[70%]">{name}</span>
              <span className="font-mono text-primary">{count}</span>
            </div>
            <div className="h-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
