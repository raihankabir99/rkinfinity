import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import {
  Newspaper,
  Loader2,
  Plus,
  Trash2,
  ShieldCheck,
  ArrowLeft,
  Pencil,
  X,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/blog")({
  head: () => ({
    meta: [
      { title: "Blog CMS — rkInfinity Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: BlogAdminPage,
});

interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  read_minutes: number;
  cover_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function BlogAdminPage() {
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("SEO");
  const [readMinutes, setReadMinutes] = useState(5);
  const [coverUrl, setCoverUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

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
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setLoading(false);
    if (error) toast.error(error.message);
    if (data) setRows(data as PostRow[]);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCategory("SEO");
    setReadMinutes(5);
    setCoverUrl("");
    setPublished(true);
    setSlugTouched(false);
  };

  const startEdit = (r: PostRow) => {
    setEditingId(r.id);
    setTitle(r.title);
    setSlug(r.slug);
    setExcerpt(r.excerpt ?? "");
    setContent(r.content);
    setCategory(r.category);
    setReadMinutes(r.read_minutes);
    setCoverUrl(r.cover_url ?? "");
    setPublished(r.published);
    setSlugTouched(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onTitleChange = (v: string) => {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !slug.trim()) return;
    setSaving(true);
    const payload = {
      slug: slugify(slug),
      title: title.trim(),
      excerpt: excerpt.trim() || null,
      content: content.trim(),
      category: category.trim() || "General",
      read_minutes: Math.max(1, Math.min(99, Number(readMinutes) || 5)),
      cover_url: coverUrl.trim() || null,
      published,
    };
    const { error } = editingId
      ? await supabase.from("blog_posts").update(payload).eq("id", editingId)
      : await supabase.from("blog_posts").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? "Post updated" : "Post added");
    resetForm();
    void load();
  };

  const togglePublish = async (r: PostRow) => {
    const { error } = await supabase
      .from("blog_posts")
      .update({ published: !r.published })
      .eq("id", r.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, published: !r.published } : x)));
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post permanently?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
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
            <Newspaper size={14} /> Blog CMS
          </div>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">
            <span className="text-white">Blog </span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Posts
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add, edit, publish, and delete posts. Published posts appear on /blog.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="glass rounded-2xl border border-white/5 p-5 space-y-3 mb-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{editingId ? "Edit post" : "New post"}</h2>
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

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                maxLength={200}
                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                Slug
              </label>
              <input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                placeholder="auto-generated-from-title"
                maxLength={80}
                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Excerpt <span className="opacity-60">(short summary for the card)</span>
            </label>
            <input
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              maxLength={300}
              className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Content (Markdown supported)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              maxLength={20000}
              className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none resize-none font-mono"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
              >
                {["SEO", "Marketing", "Code", "Story", "AI", "General"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                Read time (minutes)
              </label>
              <input
                type="number"
                value={readMinutes}
                min={1}
                max={99}
                onChange={(e) => setReadMinutes(Number(e.target.value))}
                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                Cover URL <span className="opacity-60">(optional)</span>
              </label>
              <input
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://…"
                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Published (visible on /blog)
          </label>

          <button
            type="submit"
            disabled={saving || !title.trim() || !content.trim() || !slug.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : editingId ? (
              <Save size={14} />
            ) : (
              <Plus size={14} />
            )}
            {editingId ? "Update post" : "Add post"}
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
              No posts yet. Write your first one above.
            </p>
          )}
          {rows.map((r) => (
            <div key={r.id} className="glass rounded-xl border border-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {r.category}
                    </span>
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        r.published
                          ? "bg-secondary/15 text-secondary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {r.published ? "Published" : "Draft"}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">/{r.slug}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
                  {r.excerpt && (
                    <p className="text-xs text-foreground/70 mt-1.5 line-clamp-2">{r.excerpt}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => togglePublish(r)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-white/5"
                    aria-label={r.published ? "Unpublish" : "Publish"}
                    title={r.published ? "Unpublish" : "Publish"}
                  >
                    {r.published ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
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
