import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  ArrowRight,
  BarChart3,
  Check,
  Code2,
  FileSearch,
  PenTool,
  Search,
  Share2,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — rkInfinity" },
      {
        name: "description",
        content:
          "Explore SEO, digital marketing, content, analytics, and web development services from rkInfinity.",
      },
      { property: "og:title", content: "Services — rkInfinity" },
      {
        property: "og:description",
        content: "SEO, digital marketing, and web development services.",
      },
    ],
  }),
  component: Services,
});

const offerings = [
  {
    icon: Search,
    title: "SEO & search",
    description: "Strengthen the foundations that help people find and understand your site.",
    items: [
      "Technical SEO audits",
      "Keyword research & strategy",
      "On-page optimization",
      "Search visibility",
    ],
  },
  {
    icon: TrendingUp,
    title: "Growth marketing",
    description: "Bring strategy, campaigns, and measurement together around your goals.",
    items: [
      "Marketing strategy",
      "Campaign planning",
      "Conversion optimization",
      "Performance reporting",
    ],
  },
  {
    icon: Share2,
    title: "Social media",
    description: "Build a consistent digital presence with useful, audience-aware content.",
    items: ["Social content strategy", "Content calendar", "Community growth", "Campaign analysis"],
  },
  {
    icon: PenTool,
    title: "Content & storytelling",
    description: "Create clear content that serves your audience and supports your brand.",
    items: ["Content strategy", "Website copy", "Blog articles", "Brand storytelling"],
  },
  {
    icon: BarChart3,
    title: "Analytics & insights",
    description: "Make site and campaign data easier to understand and act on.",
    items: [
      "Analytics setup",
      "Performance tracking",
      "Competitor research",
      "Reporting dashboards",
    ],
  },
  {
    icon: Code2,
    title: "Web & AI experiences",
    description: "Design and build responsive web experiences shaped around real needs.",
    items: [
      "Web design & development",
      "AI-assisted web creation",
      "UX/UI review",
      "Digital automation",
    ],
  },
];

const process = [
  {
    number: "01",
    title: "Discover",
    description: "Understand the context, audience, and outcome you’re working toward.",
  },
  {
    number: "02",
    title: "Plan",
    description: "Agree on a focused direction and practical next steps.",
  },
  {
    number: "03",
    title: "Create",
    description: "Bring the chosen strategy or experience to life with care.",
  },
  {
    number: "04",
    title: "Improve",
    description: "Review what’s working and decide what to refine next.",
  },
];

function Services() {
  return (
    <PageShell>
      <section className="section-shell pb-16 pt-12 sm:pb-24 sm:pt-16">
        <ScrollReveal>
          <p className="eyebrow">What I can help with</p>
          <h1 className="section-title mt-4 max-w-4xl text-5xl sm:text-6xl lg:text-7xl">
            Thoughtful work for a <span className="hero-accent">stronger digital presence.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            A connected set of digital capabilities—from search and content to marketing and web
            experiences. We can shape the right scope around your goals.
          </p>
        </ScrollReveal>
        <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {offerings.map(({ icon: Icon, title, description, items }, index) => (
            <ScrollReveal key={title} delay={index * 65} className="h-full">
              <article className="service-panel group flex h-full flex-col rounded-2xl border border-white/[.09] bg-white/[.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-[color:var(--gold)]/35 hover:bg-white/[.04] sm:p-7">
                <span className="grid size-11 place-items-center rounded-xl border border-[color:var(--gold)]/20 bg-[color:var(--gold)]/[.07] text-[color:var(--gold-bright)]">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <h2 className="mt-7 text-xl font-medium tracking-tight text-white">{title}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-white/55">{description}</p>
                <ul className="mt-6 flex flex-col gap-2 border-t border-white/[.08] pt-5">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-white/55">
                      <Check
                        size={13}
                        className="shrink-0 text-[color:var(--gold)]"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="border-y border-white/[.07] bg-white/[.018] py-20 sm:py-28">
        <div className="section-shell">
          <ScrollReveal>
            <p className="eyebrow">A simple way forward</p>
            <h2 className="section-title mt-4 max-w-2xl">From first conversation to next steps.</h2>
          </ScrollReveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((step, index) => (
              <ScrollReveal key={step.number} delay={index * 70}>
                <article className="h-full border-t border-white/15 pt-5">
                  <span className="font-mono text-xs text-[color:var(--gold)]">{step.number}</span>
                  <h3 className="mt-5 text-lg font-medium text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/50">{step.description}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-20 sm:py-28">
        <ScrollReveal>
          <div className="home-cta relative overflow-hidden rounded-[1.75rem] border border-white/10 px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
            <div
              className="home-cta-glow pointer-events-none absolute inset-0"
              aria-hidden="true"
            />
            <div className="relative flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow">Let’s talk</p>
                <h2 className="mt-4 text-3xl font-medium leading-tight tracking-[-.04em] text-white sm:text-5xl">
                  Have a project in mind?
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
                  Share a little about what you’re working on, and we can find a useful place to
                  begin.
                </p>
              </div>
              <Link
                to="/contact"
                hash="contact-form"
                className="btn-gold btn-pill group min-h-12 shrink-0"
              >
                Start a conversation{" "}
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </PageShell>
  );
}
