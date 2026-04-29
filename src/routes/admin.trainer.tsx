import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import { Brain, Loader2, Plus, Trash2, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/trainer")({
  head: () => ({
    meta: [
      { title: "Bot Trainer — rkInfinity" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: TrainerPage,
});

interface TrainingRow {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

function TrainerPage() {
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState<TrainingRow[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

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
      .from("bot_training")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    if (data) setRows(data as TrainingRow[]);
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("bot_training")
      .insert({ question: question.trim(), answer: answer.trim() });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setQuestion("");
    setAnswer("");
    toast.success("Saved to bot training");
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this Q&A pair?")) return;
    const { error } = await supabase.from("bot_training").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      setRows((r) => r.filter((x) => x.id !== id));
      toast.success("Deleted");
    }
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
          <Link to="/" className="mt-6 inline-block text-primary hover:underline">← Back home</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-4 py-10">
        <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
            <Brain size={14} /> Trainer
          </div>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">
            <span className="text-white">Bot </span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Training</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add Q&amp;A pairs. The chatbot checks these first before falling back to the AI.
          </p>
        </div>

        <form onSubmit={add} className="glass rounded-2xl border border-white/5 p-5 space-y-3 mb-8">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Question / keyword
            </label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. pricing, services, what is rkinfinity"
              maxLength={300}
              className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Answer
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              placeholder="The exact reply the bot should send."
              maxLength={2000}
              className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !question.trim() || !answer.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add training
          </button>
        </form>

        <div className="space-y-3">
          {rows.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No training yet. Add your first Q&amp;A above.
            </p>
          )}
          {rows.map((r) => (
            <div key={r.id} className="glass rounded-xl border border-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-primary mb-1">Q</div>
                  <div className="text-sm font-semibold text-foreground">{r.question}</div>
                  <div className="text-[10px] uppercase tracking-wider text-secondary mt-3 mb-1">A</div>
                  <div className="text-sm text-foreground/80 whitespace-pre-wrap">{r.answer}</div>
                </div>
                <button
                  onClick={() => remove(r.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
