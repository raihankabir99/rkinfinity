import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import { Mail, Loader2, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/leads")({
  head: () => ({
    meta: [{ title: "Leads — rkInfinity Admin" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: LeadsPage,
});

interface LeadRow {
  id: string;
  name: string | null;
  email: string | null;
  message: string | null;
  source: string | null;
  created_at: string;
}

function LeadsPage() {
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState<LeadRow[]>([]);
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
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    setRefreshing(false);
    if (error) toast.error(error.message);
    if (data) setRows(data as LeadRow[]);
  };

  useEffect(() => {
    if (!isAdmin) return;
    const ch = supabase
      .channel("admin-leads")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads" }, (payload) => {
        setRows((prev) => [payload.new as LeadRow, ...prev].slice(0, 500));
        toast.success("New lead!");
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [isAdmin]);

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
      <section className="mx-auto max-w-6xl px-4 py-10">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
              <Mail size={14} /> Inbox
            </div>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl">
              <span className="text-white">All </span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Leads
              </span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{rows.length} total submissions</p>
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

        <div className="space-y-3">
          {rows.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-12">No leads yet.</p>
          )}
          {rows.map((r) => (
            <div key={r.id} className="glass rounded-2xl border border-white/5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div>
                  <div className="font-semibold text-foreground">{r.name || "Anonymous"}</div>
                  {r.email && (
                    <a href={`mailto:${r.email}`} className="text-xs text-primary hover:underline">
                      {r.email}
                    </a>
                  )}
                </div>
                <div className="text-right">
                  {r.source && (
                    <span className="inline-block rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-secondary mb-1">
                      {r.source}
                    </span>
                  )}
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              {r.message && (
                <p className="text-sm text-foreground/80 whitespace-pre-wrap border-t border-white/5 pt-3 mt-2">
                  {r.message}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
