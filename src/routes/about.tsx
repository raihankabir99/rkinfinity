import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { Award, Coffee, Globe, Heart } from "lucide-react";
import aboutMe from "@/assets/about-me.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — rkInfinity" },
      { name: "description", content: "Meet RK — SEO strategist, marketer, developer, and story writer." },
      { property: "og:title", content: "About rkInfinity" },
      { property: "og:description", content: "Meet RK — the mind behind the brand." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader eyebrow="About" title="The mind behind the brand" sub="Curious by nature, methodical by craft." />

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="flex items-start gap-5 mb-6">
              <img
                src={aboutMe}
                alt="RK portrait"
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-[color:var(--gold)]/60 shadow-[0_0_24px_oklch(0.78_0.14_85/0.35)] shrink-0"
              />
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-primary mb-1">Hello, I'm RK</div>
                <div className="text-sm text-muted-foreground">Raihan Kabir Ovi · Bangladesh</div>
              </div>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold leading-tight">
              I build <span className="text-gradient">digital systems</span> that grow on their own.
            </h3>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              I'm an SEO and digital marketing learner turning curiosity into craft. Since 2025 I've been
              building real-world skills across technical SEO, analytics, and modern web development —
              one project, one experiment, one story at a time.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              When I'm not auditing crawl budgets or shipping React, I'm writing — short fiction, essays,
              and the occasional newsletter. Story is the original algorithm.
            </p>
          </div>

          <div className="lg:col-span-5 grid gap-4">
            {[
              { icon: Award, t: "Since 2025", d: "Building expertise" },
              { icon: Globe, t: "Remote-First", d: "Global mindset" },
              { icon: Coffee, t: "∞ Espressos", d: "Fuel for the craft" },
              { icon: Heart, t: "1 Mission", d: "Build infinite value" },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="glass rounded-2xl p-5 flex items-center gap-4 hover:border-primary/40 transition">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                  <Icon size={20} />
                </div>
                <div>
                  <div className="font-bold">{t}</div>
                  <div className="text-xs text-muted-foreground">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SKILL BARS */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          {[
            { l: "Technical SEO", v: 96 },
            { l: "React / TypeScript", v: 92 },
            { l: "Growth Marketing", v: 90 },
            { l: "Content & Storytelling", v: 88 },
          ].map((s) => (
            <div key={s.l}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">{s.l}</span>
                <span className="text-primary font-mono">{s.v}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${s.v}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
