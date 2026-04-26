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
        {/* Circuit board background — deeply subdued, etched-copper feel */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-center bg-cover opacity-[0.07] md:opacity-[0.09] [filter:saturate(0.35)_brightness(0.55)_contrast(1.1)] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"
          style={{ backgroundImage: `url(${heroCircuit})` }}
        />
        {/* Heavy dark overlay for text contrast */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background" />
        {/* Faint grid accent */}
        <div aria-hidden="true" className="absolute inset-0 grid-bg opacity-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-mono uppercase tracking-wider text-primary mb-6">
              <Sparkles size={12} /> Available for new projects · 2026
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
              Hi, I'm <span className="text-gradient neon-text">RK</span>
              <br />
              <span className="text-foreground/90">I am a </span>
              <TypingText words={["SEO Specialist", "Digital Marketer", "Content Creator", "Writer"]} />
            </h1>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Building infinite possibilities at the intersection of search, code, and story.
              I help brands rank, scale, and connect.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/services" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3.5 font-semibold text-primary-foreground hover:opacity-90 transition pulse-glow">
                Explore Services <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3.5 font-semibold hover:border-primary/40 transition">
                Let's Talk
              </Link>
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

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="glass rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold">Ready to build something <span className="text-gradient">infinite</span>?</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">A free 30-minute consultation to map your next breakthrough.</p>
            <Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3.5 font-semibold text-primary-foreground">
              Start the conversation <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
