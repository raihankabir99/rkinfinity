import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { BookOpen, Rocket, Lightbulb, Trophy, Pen, Sparkles } from "lucide-react";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "Story — rkInfinity" },
      { name: "description", content: "The journey of RK — from curious coder to multi-disciplinary craftsman." },
      { property: "og:title", content: "RK's Story" },
      { property: "og:description", content: "A timeline of curiosity, code, and craft." },
    ],
  }),
  component: Story,
});

const timeline = [
  { y: "2017", icon: Lightbulb, t: "The First Spark", d: "Built my first WordPress site for a local business. Watched it rank #1 in 90 days. Hooked." },
  { y: "2019", icon: BookOpen, t: "Deep Dive into SEO", d: "Spent two years obsessing over crawlers, schema, and core web vitals. Audited 100+ sites." },
  { y: "2021", icon: Pen, t: "Found My Voice", d: "Started writing — short stories, essays, technical deep-dives. Discovered story is the algorithm beneath every algorithm." },
  { y: "2023", icon: Rocket, t: "rkInfinity is Born", d: "Launched the studio. Three crafts, one philosophy: ship things that compound." },
  { y: "2025", icon: Trophy, t: "240+ Clients Later", d: "From solo founders to Series-B startups. Every project a chapter in the same book." },
  { y: "Today", icon: Sparkles, t: "What's Next", d: "Building tools, mentoring creators, and writing the next story — yours, maybe." },
];

function Story() {
  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-4 py-12">
        <SectionHeader eyebrow="The Journey" title="Every line of code began as a story." sub="A timeline of curiosity, craft, and quiet obsession." />

        <div className="relative">
          {/* center line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent" />

          <div className="space-y-12">
            {timeline.map((item, i) => {
              const Icon = item.icon;
              const left = i % 2 === 0;
              return (
                <div key={item.y} className={`relative md:flex items-center ${left ? "" : "md:flex-row-reverse"}`}>
                  {/* dot */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 grid h-8 w-8 place-items-center rounded-full bg-background border-2 border-primary z-10">
                    <Icon size={14} className="text-primary" />
                  </div>

                  <div className={`md:w-1/2 pl-14 md:pl-0 ${left ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <div className="glass rounded-2xl p-6 hover:border-primary/40 transition">
                      <div className="text-xs font-mono text-primary tracking-widest mb-2">{item.y}</div>
                      <h3 className="text-xl font-bold mb-2">{item.t}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.d}</p>
                    </div>
                  </div>
                  <div className="hidden md:block md:w-1/2" />
                </div>
              );
            })}
          </div>
        </div>

        {/* PERSONAL NOTE */}
        <div className="mt-20 glass rounded-3xl p-10 md:p-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10" />
          <div className="relative">
            <Pen className="text-primary mb-4" />
            <blockquote className="text-2xl md:text-3xl font-light leading-relaxed italic">
              "I write code the way I write stories — with intention, rhythm, and an obsession for the
              quiet detail that changes everything."
            </blockquote>
            <div className="mt-6 text-sm font-mono text-muted-foreground">— RK</div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
