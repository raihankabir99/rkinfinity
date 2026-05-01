import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { TypingText } from "@/components/TypingText";
import { ArrowRight, Sparkles, Code2, TrendingUp, Search } from "lucide-react";
import heroCircuit from "@/assets/hero-circuit.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "rkInfinity — SEO Expert · Digital Marketer · Web Developer" },
      { name: "description", content: "Premium digital craftsmanship by RK. SEO, growth marketing, and engineering for ambitious brands." },
      { property: "og:title", content: "rkInfinity — Digital Excellence" },
      { property: "og:description", content: "SEO Expert · Digital Marketer · Web Developer · Story Writer." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <PageShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Circuit board gears — deep metallic gold + dark forest green blend */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-center bg-cover opacity-[0.18] md:opacity-[0.22] [filter:sepia(0.6)_hue-rotate(5deg)_saturate(1.4)_brightness(0.7)_contrast(1.15)] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"
          style={{ backgroundImage: `url(${heroCircuit})` }}
        />
        {/* Forest green tint layer blended over the gears */}
        <div
          aria-hidden="true"
          className="absolute inset-0 mix-blend-color"
          style={{
            background:
              "radial-gradient(ellipse at center, oklch(0.32 0.08 150 / 0.55) 0%, oklch(0.18 0.06 130 / 0.35) 45%, transparent 80%)",
          }}
        />
        {/* Dark overlay for text contrast */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/60 to-background" />
        {/* Faint grid accent */}
        <div aria-hidden="true" className="absolute inset-0 grid-bg opacity-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-mono uppercase tracking-wider text-primary mb-6">
              <Sparkles size={12} /> Available for new projects · 2026
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
              Hi, I'm <span className="text-gradient neon-text">RK</span>
            </h1>
            <div
              className="mt-2 text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] flex flex-wrap items-baseline justify-center gap-x-3"
              style={{ minHeight: "calc(2 * 0.95em)" }}
            >
              <span className="text-foreground/90">I am a</span>
              <TypingText words={["SEO Specialist", "Digital Marketer", "AI-Powered Web Creator", "Content Strategist"]} speed={110} pause={1800} />
            </div>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Building infinite possibilities at the intersection of search, code, and story.
              I help brands rank, scale, and connect.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
              <Link to="/tools" className="group btn-gold btn-pill pulse-glow">
                Explore Tools <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </Link>
              <Link to="/contact" className="btn-metal-pill">
                Get in Touch
              </Link>
              <a
                href="https://trello.com/b/8BdFkKJ4/my-trello-board"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-metal-pill"
              >
                Track My Project
              </a>
              <a
                href="https://api.whatsapp.com/send?phone=966540742748&text=TrackMyProject"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold btn-pill"
                style={{ color: "#000" }}
              >
                Track with RK
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <SectionHeader eyebrow="What I do" title="Three crafts. One vision." sub="Search, code, and story — woven into measurable growth." />
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Search, t: "SEO Engineering", d: "Technical SEO, content architecture, and ranking systems built to compound." },
            { icon: TrendingUp, t: "Growth Marketing", d: "Performance campaigns, funnels, and analytics that turn traffic into revenue." },
            { icon: Code2, t: "Web Development", d: "Lightning-fast modern web apps engineered for scale and conversion." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="glass rounded-2xl p-8 hover:border-primary/40 transition group">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary mb-5 group-hover:scale-110 transition">
                <Icon size={22} />
              </div>
              <h3 className="text-xl font-bold mb-2">{t}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA moved into Footer for consistency */}
    </PageShell>
  );
}
