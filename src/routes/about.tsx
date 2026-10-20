import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { Award, CalendarDays, Coffee, ExternalLink, Globe, Heart, Github, Linkedin, Mail, X } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — rkInfinity" },
      {
        name: "description",
        content: "Meet RK — SEO strategist, marketer, developer, and story writer.",
      },
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
        <SectionHeader
          eyebrow="About"
          title="The mind behind the brand"
          sub="Curious by nature, methodical by craft."
        />

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="flex items-start gap-5 mb-6">
              <img
                src="/assets/about-me.png"
                alt="RK portrait"
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-[color:var(--gold)]/60 shadow-[0_0_24px_oklch(0.78_0.14_85/0.35)] shrink-0"
              />
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-primary mb-1">
                  Hello, I'm RK
                </div>
                <div className="text-sm text-muted-foreground">Raihan Kabir Ovi · Bangladesh</div>
              </div>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold leading-tight">
              I build <span className="text-gradient">digital systems</span> that grow on their own.
            </h3>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              I'm an SEO and digital marketing learner turning curiosity into craft. Since 2025 I've
              been building real-world skills across technical SEO, analytics, and modern web
              development — one project, one experiment, one story at a time.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              When I'm not auditing crawl budgets or shipping React, I'm writing — short fiction,
              essays, and the occasional newsletter. Story is the original algorithm.
            </p>
          </div>

          <div className="lg:col-span-5 grid gap-4">
            {[
              { icon: Award, t: "Since 2025", d: "Building expertise" },
              { icon: Globe, t: "Remote-First", d: "Global mindset" },
              { icon: Coffee, t: "∞ Espressos", d: "Fuel for the craft" },
              { icon: Heart, t: "1 Mission", d: "Build infinite value" },
            ].map(({ icon: Icon, t, d }) => (
              <div
                key={t}
                className="glass rounded-2xl p-5 flex items-center gap-4 hover:border-primary/40 transition"
              >
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
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${s.v}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Personal profile card, placed immediately above the site footer */}
      <ProfileCard />

      {/* Designed & Developed credit */}
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 text-center">
        <p className="text-sm md:text-base text-muted-foreground tracking-wide">
          Designed &amp; Developed by{" "}
          <a
            href="https://www.linkedin.com/in/raihan-kabir-ovi99/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[color:var(--gold)] hover:underline underline-offset-4 transition-colors"
          >
            Raihan Kabir
          </a>
        </p>
      </div>
    </PageShell>
  );
}

function ProfileCard() {
  const [contactOpen, setContactOpen] = useState(false);
  const profileUrl = "https://gravatar.com/genuinebeard10e7e84f4?utm_source=profile-card";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 pt-2" aria-label="Personal profile">
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-[color:var(--gold)]/25 bg-card/70 shadow-xl backdrop-blur-xl">
        <div className="h-1 bg-gradient-to-r from-transparent via-[color:var(--gold)] to-transparent" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" aria-label="Open Gravatar profile">
              <img src="https://2.gravatar.com/avatar/ade85d17ad7bbf431ae698eb862fe5a1ec94fe63ba60b5c4ca9c32ecc7745fa2?s=256&d=initials" alt="Raihan Kabir" loading="lazy" className="h-24 w-24 rounded-2xl border border-[color:var(--gold)]/50 object-cover shadow-lg" />
            </a>
            <div className="min-w-0 flex-1">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.24em] text-primary">Independent creator</p>
              <h3 className="text-2xl font-bold sm:text-3xl">Raihan Kabir</h3>
              <p className="mt-1 text-sm text-muted-foreground">AI Web Developer &amp; Digital Marketer · Self-Employed</p>
              <p className="mt-1 text-xs text-muted-foreground">Chattogram, Bangladesh</p>
            </div>
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="hidden items-center gap-2 rounded-full border border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary sm:inline-flex">Gravatar <ExternalLink size={13} /></a>
          </div>
          <p className="mt-6 text-sm leading-7 text-muted-foreground">Passionate web developer, digital marketing enthusiast, and tech explorer. Building modern web applications, learning SEO and computer science, and turning ideas into useful projects every day.</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" aria-label="Gravatar" className="grid h-10 w-10 place-items-center rounded-xl border border-border text-muted-foreground transition hover:border-primary/50 hover:text-primary"><img src="https://s.gravatar.com/icons/gravatar.svg" alt="" className="h-5 w-5" loading="lazy" /></a>
            <a href="https://www.linkedin.com/in/raihan-kabir-ovi99/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="grid h-10 w-10 place-items-center rounded-xl border border-border text-muted-foreground transition hover:border-primary/50 hover:text-primary"><Linkedin size={18} /></a>
            <a href="https://github.com/raihankabir99" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="grid h-10 w-10 place-items-center rounded-xl border border-border text-muted-foreground transition hover:border-primary/50 hover:text-primary"><Github size={18} /></a>
            <button type="button" onClick={() => setContactOpen((open) => !open)} aria-expanded={contactOpen} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">{contactOpen ? <X size={16} /> : <Mail size={16} />}{contactOpen ? "Close contact" : "Contact"}</button>
          </div>
          {contactOpen && <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
            <a href="https://calendar.app.google/yvBi41w8GXyym3ph8" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-border p-4 transition hover:border-primary/50"><CalendarDays size={20} className="shrink-0 text-primary" /><span className="min-w-0"><span className="block text-sm font-semibold">Book a time</span><span className="block break-all text-xs text-muted-foreground">Google Calendar appointment</span></span><ExternalLink size={13} className="ml-auto shrink-0" /></a>
            <a href="https://rkinfinity.pages.dev/contact" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-border p-4 transition hover:border-primary/50"><Mail size={20} className="shrink-0 text-primary" /><span className="min-w-0"><span className="block text-sm font-semibold">Contact form</span><span className="block break-all text-xs text-muted-foreground">Send a message via rkInfinity</span></span><ExternalLink size={13} className="ml-auto shrink-0" /></a>
          </div>}
        </div>
      </div>
    </section>
  );
}
