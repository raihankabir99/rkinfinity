import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import {
  Search, TrendingUp, Code2, PenTool, Megaphone, BarChart3, Check,
  Share2, FileSearch, Target, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — rkInfinity" },
      { name: "description", content: "SEO, digital marketing, and web development services that compound." },
      { property: "og:title", content: "Services — rkInfinity" },
      { property: "og:description", content: "Premium SEO, marketing, and engineering services." },
    ],
  }),
  component: Services,
});

const featuredServices = [
  {
    icon: Search,
    iconAlt: "SEO optimization icon",
    t: "SEO Optimization",
    d: "Comprehensive search engine optimization to improve your website visibility and organic rankings.",
    items: ["Technical SEO Audit", "On-Page Optimization", "Keyword Research & Strategy", "Link Building", "Local SEO", "Performance Monitoring"],
  },
  {
    icon: TrendingUp,
    iconAlt: "Digital marketing growth icon",
    t: "Digital Marketing",
    d: "Data-driven digital marketing strategies that drive traffic, engagement, and conversions.",
    items: ["Marketing Strategy Development", "Campaign Management", "Analytics & Reporting", "Conversion Optimization", "A/B Testing", "ROI Analysis"],
  },
  {
    icon: PenTool,
    iconAlt: "Content creation pen icon",
    t: "Content Creation",
    d: "Engaging, SEO-friendly content that resonates with your audience and drives action.",
    items: ["Blog Posts & Articles", "Website Copy", "Social Media Content", "Email Newsletters", "Product Descriptions", "Brand Storytelling"],
  },
  {
    icon: BarChart3,
    iconAlt: "Analytics insights chart icon",
    t: "Analytics & Insights",
    d: "Deep dive into your data to uncover opportunities and optimize performance.",
    items: ["Google Analytics Setup", "Custom Dashboard Creation", "Performance Tracking", "Competitor Analysis", "User Behavior Analysis", "Monthly Reports"],
  },
  {
    icon: FileSearch,
    iconAlt: "Website audit magnifier icon",
    t: "Website Audit",
    d: "Comprehensive analysis of your website to identify issues and opportunities.",
    items: ["Technical Health Check", "SEO Audit", "UX/UI Review", "Speed Optimization", "Mobile Responsiveness", "Security Assessment"],
  },
  {
    icon: Share2,
    iconAlt: "Social media network icon",
    t: "Social Media Marketing",
    d: "Strategic social media management to build your brand and engage your audience.",
    items: ["Strategy Development", "Content Calendar", "Community Management", "Paid Advertising", "Influencer Outreach", "Performance Analytics"],
  },
];

const services = [
  { icon: Search, t: "Technical SEO Audits", d: "Deep crawl analysis, schema, and core web vitals optimization.", items: ["Site architecture", "Schema markup", "Core Web Vitals"] },
  { icon: TrendingUp, t: "Growth Marketing", d: "Paid + organic systems engineered for compounding ROAS.", items: ["Funnel design", "PPC management", "CRO"] },
  { icon: Code2, t: "Web Development", d: "Modern, blazing-fast React & Next-gen apps.", items: ["React / TypeScript", "Headless CMS", "Edge deployments"] },
  { icon: PenTool, t: "Content Strategy", d: "Editorial systems that rank, convert, and resonate.", items: ["Topic clusters", "Editorial calendars", "Brand voice"] },
  { icon: Megaphone, t: "Brand & Launch", d: "Positioning and go-to-market that lands with impact.", items: ["Naming", "Positioning", "Launch campaigns"] },
  { icon: BarChart3, t: "Analytics & Reporting", d: "Dashboards that turn noise into next-step decisions.", items: ["GA4 setup", "Looker Studio", "Attribution"] },
];

const processSteps = [
  { n: "01", t: "Discovery", d: "Understanding your business, goals, and target audience." },
  { n: "02", t: "Strategy", d: "Developing a customized plan tailored to your needs." },
  { n: "03", t: "Execution", d: "Implementing the strategy with precision and care." },
  { n: "04", t: "Optimization", d: "Continuous monitoring and improvement for best results." },
];

function Services() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader eyebrow="Services" title="Everything you need to scale." sub="From the first audit to the millionth visitor — one craftsman, one bill." />

        {/* Featured 6 services */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {featuredServices.map(({ icon: Icon, iconAlt, t, d, items }) => (
            <article key={t} className="glass rounded-2xl p-7 hover:border-primary/40 transition group relative overflow-hidden">
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/15 transition" />
              <div className="relative">
                <div
                  role="img"
                  aria-label={iconAlt}
                  className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary mb-5"
                >
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t}</h3>
                <p className="text-sm text-muted-foreground mb-5">{d}</p>
                <ul className="space-y-2">
                  {items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check size={14} className="text-primary shrink-0" aria-hidden="true" /> {it}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        {/* Existing additional capabilities */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, t, d, items }) => (
            <div key={t} className="glass rounded-2xl p-7 hover:border-primary/40 transition group relative overflow-hidden">
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/15 transition" />
              <div className="relative">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary mb-5">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t}</h3>
                <p className="text-sm text-muted-foreground mb-5">{d}</p>
                <ul className="space-y-2">
                  {items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check size={14} className="text-primary shrink-0" aria-hidden="true" /> {it}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* My Process */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-black tracking-tight text-gradient"
            style={{ textShadow: "0 0 30px oklch(0.78 0.14 85 / 0.4)" }}
          >
            My Process
          </h2>
          <p className="mt-3 text-muted-foreground text-sm md:text-base">A clear, proven path from idea to outcome.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-3 relative">
          {processSteps.map((step, i) => (
            <div key={step.n} className="relative">
              <div className="rounded-2xl border border-[color:var(--gold)]/40 bg-black/60 backdrop-blur p-6 h-full hover:border-[color:var(--gold-bright)] hover:shadow-[0_0_24px_oklch(0.78_0.14_85/0.35)] transition">
                <div className="text-3xl font-black text-[color:var(--gold)] mb-3">{step.n}</div>
                <h3 className="text-lg font-bold text-white mb-2">{step.t}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{step.d}</p>
              </div>
              {i < processSteps.length - 1 && (
                <ArrowRight
                  aria-hidden="true"
                  className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 text-[color:var(--gold)]/70"
                  size={22}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div
          className="relative overflow-hidden rounded-3xl border border-[color:var(--gold)]/30 p-10 md:p-16 text-center"
          style={{
            background:
              "radial-gradient(ellipse at top, oklch(0.78 0.14 85 / 0.18) 0%, oklch(0.08 0.005 80) 55%, #000 100%)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
            style={{ background: "radial-gradient(circle at 50% 0%, oklch(0.78 0.14 85 / 0.25), transparent 60%)" }}
          />
          <div className="relative">
            <div
              className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[color:var(--gold)]/60 bg-black/60 text-[color:var(--gold)] mb-6 shadow-[0_0_30px_oklch(0.78_0.14_85/0.45)]"
              role="img"
              aria-label="Target bullseye icon"
            >
              <Target size={28} aria-hidden="true" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white">Ready to Start Your Project?</h2>
            <p className="mt-4 text-white/70 max-w-xl mx-auto">
              Let's discuss how I can help you achieve your digital goals. Get in touch for a free consultation.
            </p>
            <div className="mt-8">
              <Link
                to="/contact"
                hash="contact-form"
                className="btn-gold btn-pill inline-flex"
              >
                Get In Touch <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
