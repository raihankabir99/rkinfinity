import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { Clock, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — RK Infinity" },
      { name: "description", content: "Essays on SEO, marketing, code, and storytelling." },
      { property: "og:title", content: "RK Infinity Blog" },
      { property: "og:description", content: "Long-form thinking on the modern web." },
    ],
  }),
  component: Blog,
});

const posts = [
  { t: "The Compounding SEO Playbook", d: "How to build a content engine that earns itself a 10x return over 24 months.", c: "SEO", r: "8 min" },
  { t: "Why I Stopped Optimizing for Algorithms", d: "And started writing for humans. The data, the philosophy, and the unexpected results.", c: "Story", r: "6 min" },
  { t: "Edge-First Web Apps in 2026", d: "A field guide to building React applications that load in under 200ms — anywhere.", c: "Code", r: "12 min" },
  { t: "From Audit to Authority in 90 Days", d: "A real client case study with the full audit, fixes, and the rankings that followed.", c: "SEO", r: "10 min" },
  { t: "The Story Behind Every Conversion", d: "Why narrative drives every metric you actually care about.", c: "Marketing", r: "5 min" },
  { t: "Building RK Infinity: Year One", d: "Lessons, numbers, and the quiet weeks nobody talks about.", c: "Story", r: "7 min" },
];

function Blog() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader eyebrow="Journal" title="Essays & field notes." sub="Long-form thinking on the work — and the world it lives in." />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p, i) => (
            <article key={p.t} className="glass rounded-2xl p-7 hover:border-primary/40 transition cursor-pointer group">
              <div className="flex items-center justify-between mb-4 text-xs font-mono uppercase tracking-wider">
                <span className="text-primary">{p.c}</span>
                <span className="text-muted-foreground flex items-center gap-1"><Clock size={12} /> {p.r}</span>
              </div>
              <h3 className="text-xl font-bold leading-snug mb-3 group-hover:text-gradient">{p.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{p.d}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Article #{(i + 1).toString().padStart(2, "0")}</span>
                <ArrowUpRight size={16} className="text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
