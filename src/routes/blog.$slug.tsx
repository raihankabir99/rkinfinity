import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import { BlogTranslator } from "@/components/BlogTranslator";
import { Clock, ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — rkInfinity Blog` },
      { name: "description", content: "Long-form essay on rkInfinity." },
    ],
  }),
  component: PostPage,
  errorComponent: ({ error }) => (
    <PageShell>
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Post unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Link to="/blog" className="mt-6 inline-block text-primary hover:underline">
          ← Back to blog
        </Link>
      </div>
    </PageShell>
  ),
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <Link to="/blog" className="mt-6 inline-block text-primary hover:underline">
          ← Back to blog
        </Link>
      </div>
    </PageShell>
  ),
});

interface FullPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  read_minutes: number;
  cover_url: string | null;
  created_at: string;
}

function PostPage() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<FullPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (!mounted) return;
      if (!data) {
        setMissing(true);
      } else {
        setPost(data as FullPost);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </PageShell>
    );
  }

  if (missing || !post) {
    throw notFound();
  }

  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft size={14} /> Back to blog
        </Link>

        <div className="flex items-center gap-3 mb-4 text-xs font-mono uppercase tracking-wider">
          <span className="text-primary">{post.category}</span>
          <span className="text-muted-foreground flex items-center gap-1">
            <Clock size={12} /> {post.read_minutes} min read
          </span>
          <span className="text-muted-foreground">
            {new Date(post.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">{post.title}</h1>

        {post.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">{post.excerpt}</p>
        )}

        {post.cover_url && (
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full rounded-2xl mb-10 border border-white/5"
          />
        )}

        <div className="prose prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed">
          {post.content}
        </div>
      </article>
    </PageShell>
  );
}
