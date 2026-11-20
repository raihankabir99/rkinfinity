import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ArrowRight, ArrowUpRight, Compass, Globe2, Heart, Lightbulb } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — rkInfinity" },
      { name: "description", content: "Meet Raihan Kabir Ovi, the person behind rkInfinity." },
      { property: "og:title", content: "About rkInfinity" },
      { property: "og:description", content: "Meet RK — the mind behind the brand." },
    ],
  }),
  component: About,
});

const principles = [
  {
    icon: Compass,
    title: "Start with clarity",
    detail: "Understand the people, context, and goals before choosing a direction.",
  },
  {
    icon: Lightbulb,
    title: "Make it useful",
    detail: "Pair thoughtful strategy with practical, well-crafted digital work.",
  },
  {
    icon: Heart,
    title: "Keep learning",
    detail: "Treat every project as a chance to learn, improve, and make the next step better.",
  },
];

function About() {
  return (
    <PageShell>
      <section className="section-shell pb-16 pt-12 sm:pb-24 sm:pt-16">
        <ScrollReveal>
          <p className="eyebrow">A little about me</p>
          <h1 className="section-title mt-4 max-w-4xl text-5xl sm:text-6xl lg:text-7xl">
            Curiosity, turned into <span className="hero-accent">digital craft.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            I’m Raihan Kabir Ovi—an SEO and digital marketing learner building practical skills
            across search, analytics, and modern web development.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.2fr_.8fr] lg:gap-6">
          <ScrollReveal className="h-full">
            <article className="glass relative h-full overflow-hidden rounded-3xl p-6 sm:p-9 lg:p-11">
              <div
                className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-[color:var(--gold)]/[.06] blur-3xl"
                aria-hidden="true"
              />
              <div className="relative flex items-center gap-4">
                <img
                  src="/assets/about-me.png"
                  alt="Portrait of Raihan Kabir Ovi"
                  className="size-16 shrink-0 rounded-2xl object-cover ring-1 ring-white/15 sm:size-20"
                />
                <div>
                  <p className="text-xs uppercase tracking-[.18em] text-[color:var(--gold-bright)]">
                    The person behind rkInfinity
                  </p>
                  <p className="mt-1 font-medium text-white">
                    Raihan Kabir Ovi <span className="text-white/35">·</span> Bangladesh
                  </p>
                </div>
              </div>
              <h2 className="relative mt-8 max-w-2xl text-2xl font-medium leading-tight tracking-tight text-white sm:text-4xl">
                Building experience one project, experiment, and story at a time.
              </h2>
              <p className="relative mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                Since 2025, I’ve been developing hands-on experience in technical SEO, analytics,
                and web development. I enjoy connecting the details—from how a site is discovered to
                how it feels to use.
              </p>
              <p className="relative mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                Outside of digital work, I write short fiction and essays. Story is a reminder that
                technology is most meaningful when it speaks to people.
              </p>
              <a
                href="https://www.linkedin.com/in/raihan-kabir-ovi99/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link relative mt-7 inline-flex items-center gap-2"
              >
                Connect on LinkedIn <ArrowUpRight size={15} />
              </a>
            </article>
          </ScrollReveal>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {principles.map(({ icon: Icon, title, detail }, index) => (
              <ScrollReveal key={title} delay={index * 80} className="h-full">
                <article className="glass flex h-full gap-4 rounded-2xl p-5 sm:p-6 lg:items-start">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[color:var(--gold)]/20 bg-[color:var(--gold)]/[.07] text-[color:var(--gold-bright)]">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-medium text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/50">{detail}</p>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/[.07] bg-white/[.018] py-16 sm:py-20">
        <div className="section-shell grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="eyebrow">The work</p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-white sm:text-3xl">
              Small, thoughtful steps add up.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
              Explore selected projects and the services I’m building experience in.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/portfolio" className="btn-gold btn-pill group">
              Explore the work{" "}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/contact" className="hero-secondary-link min-h-11">
              Get in touch <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <div className="section-shell py-7 text-center text-xs text-white/40">
        <Globe2 className="mr-2 inline-block size-4 align-middle" aria-hidden="true" />
        Working remotely, with a global perspective.
      </div>
    </PageShell>
  );
}
