import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  Code2,
  ExternalLink,
  Layers3,
  Search,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "rkInfinity — Digital Growth Made Smarter" },
      {
        name: "description",
        content:
          "SEO, digital growth, and AI-powered web experiences for ambitious businesses. Discover RK's services and selected work.",
      },
      { property: "og:title", content: "rkInfinity — Digital Growth Made Smarter" },
      {
        property: "og:description",
        content: "SEO, digital growth, and AI-powered web experiences for ambitious businesses.",
      },
    ],
  }),
  component: Home,
});

const services = [
  {
    icon: Search,
    number: "01",
    title: "Search, built to compound.",
    name: "SEO & organic growth",
    description:
      "Technical foundations, thoughtful content strategy, and search visibility designed to earn the right attention over time.",
    points: ["Technical SEO", "Keyword & content strategy", "Site audits"],
  },
  {
    icon: Target,
    number: "02",
    title: "Turn attention into action.",
    name: "Digital marketing",
    description:
      "A clearer digital presence, purposeful campaigns, and measurement that helps you make the next decision with confidence.",
    points: ["Growth strategy", "Social media marketing", "Analytics & reporting"],
  },
  {
    icon: Code2,
    number: "03",
    title: "Make the experience count.",
    name: "Web & AI experiences",
    description:
      "Modern, responsive digital experiences—designed around your customers and engineered to support the way your business works.",
    points: ["Web design & development", "AI-powered web creation", "Digital automation"],
  },
];

const projects = [
  {
    title: "ZOAL Enterprise Platform",
    type: "E-commerce · Business platform",
    description:
      "A platform spanning storefront experiences, content management, product operations, and administration.",
    stack: "React · TypeScript · Supabase",
    href: "https://github.com/AL-ZOAL/zoal-website",
    accent: "project-orbit",
    mark: "Z",
  },
  {
    title: "Art-to-Product",
    type: "Web development · Product",
    description:
      "A digital workflow exploring the journey from creative artwork to a product experience.",
    stack: "Web development · UI/UX · E-commerce",
    href: "https://github.com/raihankabir99/art-to-product",
    accent: "project-field",
    mark: "A",
  },
  {
    title: "T-shirt Website",
    type: "E-commerce · Storefront",
    description: "A responsive, storefront-focused experience for a T-shirt brand.",
    stack: "Next.js · E-commerce · Responsive UI",
    href: "https://github.com/raihankabir99/tshirtwebsite1v0",
    accent: "project-thread",
    mark: "T",
  },
];

const steps = [
  { number: "01", title: "Discover", detail: "Understand your business, audience, and goals." },
  {
    number: "02",
    title: "Shape the plan",
    detail: "Set a thoughtful direction and a practical roadmap.",
  },
  {
    number: "03",
    title: "Build & launch",
    detail: "Bring the experience to life with care and craft.",
  },
  { number: "04", title: "Learn & grow", detail: "Measure what matters and keep improving." },
];

function Home() {
  return (
    <PageShell>
      <section className="home-hero relative isolate overflow-hidden">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-16 lg:min-h-[660px] lg:grid-cols-[1.05fr_.95fr] lg:gap-8 lg:px-10 lg:py-20">
          <div className="relative z-10 max-w-3xl">
            <ScrollReveal>
              <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3.5 py-2 text-[11px] font-medium uppercase tracking-[.18em] text-white/65">
                <span className="size-1.5 rounded-full bg-[color:var(--gold)] shadow-[0_0_12px_var(--gold)]" />
                rkInfinity <span className="text-white/25">/</span> Digital growth made smarter
              </p>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <h1 className="max-w-3xl text-[clamp(3.3rem,8.4vw,7.25rem)] font-semibold leading-[.91] tracking-[-.075em] text-white">
                Good work.
                <br />
                <span className="hero-accent">Real momentum.</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
                Search, strategy, and technology—brought together to help your business move forward
                online.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={280}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link to="/contact" className="btn-gold btn-pill group min-h-12 px-6">
                  Tell me about your project
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link to="/portfolio" className="hero-secondary-link group min-h-12">
                  See selected work{" "}
                  <ArrowUpRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={360}>
              <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-5 text-xs text-white/45 sm:mt-16">
                <span className="inline-flex items-center gap-2">
                  <span className="size-1 rounded-full bg-[color:var(--gold)]" /> Independent
                  digital practice
                </span>
                <span>Working remotely, worldwide</span>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={180} className="relative mx-auto w-full max-w-[580px] lg:max-w-none">
            <div className="hero-art-frame relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111512]">
              <img
                src="/assets/hero-circuit.png"
                alt="Gold and green circuit pathways on a dark field"
                fetchPriority="high"
                className="aspect-[1.1/1] w-full object-cover opacity-[.84] sm:aspect-[1.2/1] lg:aspect-[.96/1]"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#090b09]/90 via-transparent to-[#090b09]/10"
                aria-hidden="true"
              />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 sm:inset-x-7 sm:bottom-7">
                <div>
                  <p className="text-[10px] uppercase tracking-[.2em] text-white/50">
                    The rkInfinity approach
                  </p>
                  <p className="mt-1 text-lg font-medium tracking-tight text-white sm:text-xl">
                    Strategy meets execution.
                  </p>
                </div>
                <div className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 bg-black/30 text-[color:var(--gold-bright)] backdrop-blur-sm">
                  <Sparkles size={18} aria-hidden="true" />
                </div>
              </div>
            </div>
            <div className="hero-art-caption mt-4 flex items-center justify-between text-[10px] uppercase tracking-[.16em] text-white/35">
              <span>Search · Digital · Technology</span>
              <span>Strategy / build / learn</span>
            </div>
          </ScrollReveal>
        </div>
        <a href="#services" aria-label="Scroll to services" className="hero-scroll hidden lg:grid">
          <ArrowDown size={15} />
        </a>
      </section>

      <section id="services" className="section-shell scroll-mt-28 py-24 sm:py-32">
        <ScrollReveal>
          <div className="section-intro mb-12 grid gap-5 sm:mb-16 md:grid-cols-[1fr_.65fr] md:items-end">
            <div>
              <p className="eyebrow">What I bring to the table</p>
              <h2 className="section-title mt-4 max-w-2xl">
                One connected approach to growing online.
              </h2>
            </div>
            <div className="md:pb-1">
              <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                The best results happen when discovery, customer experience, and technology work as
                one—not as separate tasks.
              </p>
              <Link to="/services" className="text-link mt-5 inline-flex items-center gap-2">
                Explore all services <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
        <div className="grid gap-3 md:grid-cols-3">
          {services.map(({ icon: Icon, number, title, name, description, points }, index) => (
            <ScrollReveal key={name} delay={index * 100} className="h-full">
              <article className="service-panel group flex h-full flex-col rounded-2xl border border-white/[.09] bg-white/[.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-[color:var(--gold)]/35 hover:bg-white/[.04] sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl border border-[color:var(--gold)]/20 bg-[color:var(--gold)]/[.07] text-[color:var(--gold-bright)]">
                    <Icon size={19} />
                  </span>
                  <span className="font-mono text-xs text-white/30">{number}</span>
                </div>
                <h3 className="mt-9 text-xl font-medium leading-snug tracking-tight text-white sm:text-2xl">
                  {title}
                </h3>
                <p className="mt-2 text-xs font-medium uppercase tracking-[.12em] text-[color:var(--gold-bright)]/80">
                  {name}
                </p>
                <p className="mt-4 flex-1 text-sm leading-6 text-white/55">{description}</p>
                <ul className="mt-6 flex flex-col gap-2 border-t border-white/[.08] pt-5">
                  {points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-xs text-white/55">
                      <Check size={13} className="text-[color:var(--gold)]" />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="portfolio-band border-y border-white/[.07] bg-white/[.018] py-24 sm:py-32">
        <div className="section-shell">
          <ScrollReveal>
            <div className="mb-12 flex flex-col justify-between gap-5 sm:mb-14 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">A few things I’ve made</p>
                <h2 className="section-title mt-4">Selected work.</h2>
              </div>
              <Link to="/portfolio" className="text-link inline-flex items-center gap-2">
                Browse the portfolio <ArrowRight size={15} />
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid gap-4 lg:grid-cols-3">
            {projects.map((project, index) => (
              <ScrollReveal key={project.title} delay={index * 90} className="h-full">
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-card group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[.09] bg-[#0c0e0c] transition duration-300 hover:-translate-y-1 hover:border-[color:var(--gold)]/35"
                >
                  <div
                    className={`project-art ${project.accent} relative grid aspect-[1.65/1] place-items-center overflow-hidden`}
                    aria-hidden="true"
                  >
                    <div className="project-art-lines" />
                    <span className="project-monogram">{project.mark}</span>
                    <span className="absolute bottom-4 left-5 font-mono text-[10px] uppercase tracking-[.16em] text-white/45">
                      0{index + 1} <span className="px-1 text-white/20">/</span> {project.type}
                    </span>
                    <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-white/15 bg-black/30 text-white/65 transition group-hover:border-[color:var(--gold)]/50 group-hover:text-[color:var(--gold-bright)]">
                      <ExternalLink size={15} />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="text-lg font-medium tracking-tight text-white">
                      {project.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-white/55">
                      {project.description}
                    </p>
                    <p className="mt-5 border-t border-white/[.08] pt-4 text-[10px] uppercase tracking-[.12em] text-white/35">
                      {project.stack}
                    </p>
                  </div>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-24 sm:py-32">
        <div className="grid gap-12 md:grid-cols-[.8fr_1.2fr] md:gap-20">
          <ScrollReveal>
            <p className="eyebrow">How we work</p>
            <h2 className="section-title mt-4">
              Clear thinking.
              <br />
              Considered making.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">
              A straightforward process, shaped around your goals and the people you want to reach.
            </p>
            <Link to="/about" className="text-link mt-6 inline-flex items-center gap-2">
              Meet RK <ArrowRight size={15} />
            </Link>
          </ScrollReveal>
          <div className="process-list">
            {steps.map((step, index) => (
              <ScrollReveal key={step.number} delay={index * 70}>
                <div className="process-row grid grid-cols-[2.5rem_1fr] gap-4 border-t border-white/10 py-5 sm:grid-cols-[3rem_1fr_auto] sm:items-center sm:gap-5 sm:py-6">
                  <span className="font-mono text-xs text-[color:var(--gold)]">{step.number}</span>
                  <div>
                    <h3 className="text-base font-medium text-white sm:text-lg">{step.title}</h3>
                    <p className="mt-1 text-sm text-white/45">{step.detail}</p>
                  </div>
                  <Workflow size={17} className="hidden text-white/25 sm:block" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell pb-24 sm:pb-32">
        <ScrollReveal>
          <div className="home-cta relative overflow-hidden rounded-[1.75rem] border border-white/10 px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
            <div
              className="home-cta-glow pointer-events-none absolute inset-0"
              aria-hidden="true"
            />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow">A good place to start</p>
                <h2 className="mt-4 text-3xl font-medium leading-tight tracking-[-.04em] text-white sm:text-5xl">
                  Have a challenge worth solving?
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
                  Share what you’re working on. We can figure out the right next step together.
                </p>
              </div>
              <Link to="/contact" className="btn-gold btn-pill group min-h-12 shrink-0 px-6">
                Start a conversation{" "}
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="border-t border-white/[.07] bg-[#0b0c0b] py-16 sm:py-20">
        <div className="section-shell grid gap-10 md:grid-cols-[.8fr_1.2fr] md:gap-20">
          <ScrollReveal>
            <p className="eyebrow">A few useful answers</p>
            <h2 className="section-title mt-4">Good to know.</h2>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <Accordion type="single" collapsible className="divide-y divide-white/10">
              <AccordionItem value="q1" className="border-0">
                <AccordionTrigger className="py-5 text-left text-sm font-medium text-white hover:no-underline sm:text-base">
                  What does RKInfinity work on?
                </AccordionTrigger>
                <AccordionContent className="max-w-xl pb-5 text-sm leading-6 text-white/55">
                  SEO and organic growth, digital marketing, web design and development, and
                  AI-powered web experiences. The right mix depends on your goals.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2" className="border-0">
                <AccordionTrigger className="py-5 text-left text-sm font-medium text-white hover:no-underline sm:text-base">
                  How do we get started?
                </AccordionTrigger>
                <AccordionContent className="max-w-xl pb-5 text-sm leading-6 text-white/55">
                  Send a note through the contact page with a little context about your project.
                  From there, we can talk through the scope and a sensible next step.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3" className="border-0">
                <AccordionTrigger className="py-5 text-left text-sm font-medium text-white hover:no-underline sm:text-base">
                  Can I follow a project’s progress?
                </AccordionTrigger>
                <AccordionContent className="max-w-xl pb-5 text-sm leading-6 text-white/55">
                  Use the project tracking link to open the project board, or message RK on WhatsApp
                  for help with a project update.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollReveal>
        </div>
      </section>

      <div className="section-shell flex flex-wrap items-center justify-between gap-4 border-t border-white/[.07] py-6 text-xs text-white/40">
        <span>Useful tools for your next move.</span>
        <div className="flex flex-wrap items-center gap-5">
          <Link to="/tools" className="inline-flex items-center gap-2 transition hover:text-white">
            <Layers3 size={14} /> Explore tools
          </Link>
          <Link to="/story" className="inline-flex items-center gap-2 transition hover:text-white">
            <BarChart3 size={14} /> Read the story
          </Link>
          <a
            href="https://trello.com/b/8BdFkKJ4/my-trello-board"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition hover:text-white"
          >
            Track a project <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </PageShell>
  );
}
