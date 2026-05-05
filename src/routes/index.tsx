import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { TypingText } from "@/components/TypingText";
import { ArrowRight, Sparkles, Code2, TrendingUp, Search, KeyRound, Wrench, LinkIcon, FileText, FileCheck2, ClipboardCheck, Clock, ArrowUpRight, Star } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
              <span className="text-gradient neon-text">Hi, I'm RK</span>
            </h1>
            <div
              className="mt-2 font-black tracking-tight leading-[1.05] flex flex-nowrap items-baseline justify-center gap-x-3 mx-auto"
              style={{ fontSize: "clamp(1.75rem, 5.5vw, 4.5rem)", whiteSpace: "nowrap", maxWidth: "100%" }}
            >
              <TypingText words={["SEO Specialist", "Digital Marketer", "AI-Powered Web Creator", "Content Strategist"]} speed={110} pause={1800} />
            </div>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Building infinite possibilities at the intersection of search, code, and story.
              I help brands rank, scale, and connect.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 md:gap-5">
              <Link to="/tools" className="group btn-gold btn-pill pulse-glow">
                Explore Tools <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
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
            { icon: Code2, t: "AI-Powered Web Creation", d: "Modern, AI-driven websites built for speed and conversion using latest technologies." },
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

      {/* SEO SERVICES GRID */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Full-stack <span className="text-gradient">SEO</span> services.
            </h2>
            <p className="mt-2 text-muted-foreground text-sm md:text-base">Six pillars. One compounding system.</p>
          </div>
          <Link to="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--gold)] hover:text-[color:var(--gold-bright)] transition">
            View all services <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: KeyRound, t: "Keyword Research", d: "Intent-mapped keyword universes that target real revenue." },
            { icon: Wrench, t: "Technical SEO", d: "Crawl, schema, and Core Web Vitals tuned to perfection." },
            { icon: LinkIcon, t: "Link Building", d: "Editorial links from publications your buyers already read." },
            { icon: FileText, t: "Content Strategy", d: "Topic clusters and editorial calendars that earn authority." },
            { icon: FileCheck2, t: "On-Page SEO", d: "Headings, internal links, and entity coverage that rank." },
            { icon: ClipboardCheck, t: "SEO Audits", d: "Deep, prioritized audits with a roadmap you can ship." },
          ].map(({ icon: Icon, t, d }) => (
            <Link
              key={t}
              to="/services"
              className="glass rounded-2xl p-6 hover:border-primary/40 transition group block"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-[color:var(--gold)] mb-4 group-hover:scale-110 transition">
                <Icon size={20} />
              </div>
              <h3 className="text-lg font-bold mb-1.5">{t}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{d}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* LATEST INSIGHTS */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[color:var(--gold)]">Latest Insights</span>
            <h2 className="mt-2 text-4xl md:text-5xl font-black tracking-tight">
              From the <span className="text-gradient">blog</span>.
            </h2>
          </div>
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--gold)] hover:text-[color:var(--gold-bright)] transition">
            All posts <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { t: "The Compounding SEO Playbook", d: "How to build a content engine that earns itself a 10x return over 24 months.", c: "SEO", r: "8 min" },
            { t: "Why I Stopped Optimizing for Algorithms", d: "And started writing for humans. The data, the philosophy, and the unexpected results.", c: "Story", r: "6 min" },
            { t: "Edge-First Web Apps in 2026", d: "A field guide to building React applications that load in under 200ms — anywhere.", c: "Code", r: "12 min" },
          ].map((p, i) => (
            <Link
              key={p.t}
              to="/blog"
              className="glass rounded-2xl p-7 hover:border-primary/40 transition group block bg-black/60"
            >
              <div className="flex items-center justify-between mb-4 text-xs font-mono uppercase tracking-wider">
                <span className="text-[color:var(--gold)]">{p.c}</span>
                <span className="text-muted-foreground inline-flex items-center gap-1"><Clock size={12} /> {p.r}</span>
              </div>
              <h3 className="text-xl font-bold leading-snug mb-3 group-hover:text-gradient">{p.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{p.d}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Article #{(i + 1).toString().padStart(2, "0")}</span>
                <ArrowUpRight size={16} className="text-[color:var(--gold)] group-hover:translate-x-1 group-hover:-translate-y-1 transition" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <SectionHeader eyebrow="Testimonials" title="Voices of trust." sub="What clients say after working with RK." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { n: "Sarah Mitchell", r: "Founder, Bloomly", img: "https://i.pravatar.cc/120?img=47", t: "RK rebuilt our SEO from the ground up. Organic traffic 4x in 5 months." },
            { n: "Daniel Park", r: "CMO, NorthEdge", img: "https://i.pravatar.cc/120?img=12", t: "A rare blend of strategy and execution. The AI-powered site is buttery fast." },
            { n: "Aisha Rahman", r: "CEO, LumeWorks", img: "https://i.pravatar.cc/120?img=32", t: "Clear communication, premium delivery. Worth every penny." },
            { n: "Marco Silva", r: "Owner, Atlas&Co", img: "https://i.pravatar.cc/120?img=15", t: "He treats your brand like it's his own. Results that compound." },
          ].map((x) => (
            <div key={x.n} className="glass rounded-2xl p-6 hover:border-primary/40 transition flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <img src={x.img} alt={x.n} className="h-12 w-12 rounded-full object-cover ring-2 ring-[color:var(--gold)]/60" />
                <div>
                  <div className="font-bold text-sm">{x.n}</div>
                  <div className="text-xs text-muted-foreground">{x.r}</div>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3 text-[color:var(--gold)]">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">"{x.t}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20">
        <SectionHeader eyebrow="FAQ" title="Frequently asked." sub="Quick answers to what people ask most." />
        <Accordion type="single" collapsible className="glass rounded-2xl px-6">
          <AccordionItem value="q1" className="border-[color:var(--gold)]/15">
            <AccordionTrigger className="text-left">What services do you offer?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              SEO, Digital Marketing, and AI-Powered Web Creation — end-to-end strategy, build, and growth.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2" className="border-[color:var(--gold)]/15">
            <AccordionTrigger className="text-left">How long does SEO take to show results?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Typically 3–6 months for meaningful, compounding results. Quick wins can land sooner.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q3" className="border-none">
            <AccordionTrigger className="text-left">Can I track my project?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes — share your project ID via the chatbot or contact page for a live status update.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

    </PageShell>
  );
}
