import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import {
  BookOpen,
  Loader2,
  Plus,
  Trash2,
  ShieldCheck,
  ArrowLeft,
  Pencil,
  X,
  Save,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge Base — rkInfinity Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: KbPage,
});

interface KbRow {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

function KbPage() {
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState<KbRow[]>([]);
  const [loading, setLoading] = useState(false);

  // form state (used for both create and edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    try {
      let text = "";
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        const pdfjs = await import("pdfjs-dist");
        // Use bundled worker
        const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        const buf = await file.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: buf }).promise;
        const parts: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const tc = await page.getTextContent();
          parts.push(tc.items.map((it) => ("str" in it ? it.str : "")).join(" "));
        }
        text = parts.join("\n\n");
      } else {
        text = await file.text();
      }
      text = text.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
      if (!text) { toast.error("No text extracted"); return; }
      if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ""));
      setContent(text.slice(0, 8000));
      toast.success(`Extracted ${text.length.toLocaleString()} characters`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to parse file");
    } finally {
      setParsing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

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
    setLoading(true);
    const { data, error } = await supabase
      .from("knowledge_base")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(500);
    setLoading(false);
    if (error) toast.error(error.message);
    if (data) setRows(data as KbRow[]);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setTagsInput("");
  };

  const startEdit = (r: KbRow) => {
    setEditingId(r.id);
    setTitle(r.title);
    setContent(r.content);
    setTagsInput(r.tags.join(", "));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const payload = { title: title.trim(), content: content.trim(), tags };

    const { error } = editingId
      ? await supabase.from("knowledge_base").update(payload).eq("id", editingId)
      : await supabase.from("knowledge_base").insert(payload);

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? "Article updated" : "Article added");
    resetForm();
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    const { error } = await supabase.from("knowledge_base").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((r) => r.filter((x) => x.id !== id));
    if (editingId === id) resetForm();
    toast.success("Deleted");
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
      <section className="mx-auto max-w-5xl px-4 py-10">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
            <BookOpen size={14} /> Knowledge Base
          </div>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">
            <span className="text-white">Help </span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Articles
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Long-form context the chatbot can pull from. Title is the topic, content is the answer.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="glass rounded-2xl border border-white/5 p-5 space-y-3 mb-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {editingId ? "Edit article" : "New article"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X size={12} /> Cancel edit
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-[color:var(--gold)]/40 bg-[color:var(--gold)]/5 px-3 py-2">
            <p className="text-xs text-muted-foreground">
              <span className="text-[color:var(--gold-bright)] font-semibold">Train from a document</span> — upload a PDF, TXT, or MD file to auto-fill the content below.
            </p>
            <input ref={fileRef} type="file" accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown" onChange={onFile} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={parsing}
              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--gold)]/60 bg-black px-3 py-1.5 text-xs font-semibold text-[color:var(--gold-bright)] hover:bg-[color:var(--gold)]/10 disabled:opacity-50"
            >
              {parsing ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {parsing ? "Parsing…" : "Upload PDF / Text"}
            </button>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How long does SEO take?"
              maxLength={200}
              className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="The detailed answer or article body."
              maxLength={8000}
              className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Tags <span className="opacity-60">(comma-separated)</span>
            </label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="seo, pricing, process"
              maxLength={300}
              className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !title.trim() || !content.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : editingId ? (
              <Save size={14} />
            ) : (
              <Plus size={14} />
            )}
            {editingId ? "Update article" : "Add article"}
          </button>
        </form>

        <div className="space-y-3">
          {loading && (
            <div className="text-center text-sm text-muted-foreground py-6">
              <Loader2 className="inline animate-spin mr-2" size={14} />
              Loading…
            </div>
          )}
          {!loading && rows.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No knowledge yet. Add your first article above.
            </p>
          )}
          {rows.map((r) => (
            <div key={r.id} className="glass rounded-xl border border-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
                  <p className="text-xs text-foreground/70 mt-1.5 line-clamp-3 whitespace-pre-wrap">
                    {r.content}
                  </p>
                  {r.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {r.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => startEdit(r)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-primary hover:bg-primary/10"
                    aria-label="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
