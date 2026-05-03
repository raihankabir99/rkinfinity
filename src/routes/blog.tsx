import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { CommentForm } from "@/components/CommentForm";
import { BlogTranslator } from "@/components/BlogTranslator";
import { Clock, ArrowUpRight, Loader2 } from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — rkInfinity" },
      { name: "description", content: "Essays on SEO, marketing, code, and storytelling." },
      { property: "og:title", content: "rkInfinity Blog" },
      { property: "og:description", content: "Long-form thinking on the modern web." },
    ],
  }),
  component: Blog,
});

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  read_minutes: number;
  cover_url: string | null;
  created_at: string;
}

function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id,slug,title,excerpt,category,read_minutes,cover_url,created_at")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(60);
      if (!mounted) return;
      setPosts((data as Post[]) ?? []);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader
          eyebrow="Journal"
          title="Essays & field notes."
          sub="Long-form thinking on the work — and the world it lives in."
        />

        <BlogTranslator>
          {loading && (
            <div className="text-center py-16">
              <Loader2 className="inline animate-spin text-primary" size={20} />
            </div>
          )}

          {!loading && posts.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-16">
              No posts yet — check back soon.
            </p>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p, i) => (
              <Link
                key={p.id}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="glass rounded-2xl p-7 hover:border-primary/40 transition cursor-pointer group block"
              >
                <div className="flex items-center justify-between mb-4 text-xs font-mono uppercase tracking-wider">
                  <span className="text-primary">{p.category}</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock size={12} /> {p.read_minutes} min
                  </span>
                </div>
                <h3 className="text-xl font-bold leading-snug mb-3 group-hover:text-gradient">
                  {p.title}
                </h3>
                {p.excerpt && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{p.excerpt}</p>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground" data-no-translate>
                    Article #{(i + 1).toString().padStart(2, "0")}
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition"
                  />
                </div>
              </Link>
            ))}
          </div>
        </BlogTranslator>
      </section>
      <CommentForm />
    </PageShell>
  );
}
