import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { Search, TrendingUp, Code2, PenTool, Megaphone, BarChart3, Check } from "lucide-react";

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

const services = [
  { icon: Search, t: "Technical SEO Audits", d: "Deep crawl analysis, schema, and core web vitals optimization.", items: ["Site architecture", "Schema markup", "Core Web Vitals"] },
  { icon: TrendingUp, t: "Growth Marketing", d: "Paid + organic systems engineered for compounding ROAS.", items: ["Funnel design", "PPC management", "CRO"] },
  { icon: Code2, t: "Web Development", d: "Modern, blazing-fast React & Next-gen apps.", items: ["React / TypeScript", "Headless CMS", "Edge deployments"] },
  { icon: PenTool, t: "Content Strategy", d: "Editorial systems that rank, convert, and resonate.", items: ["Topic clusters", "Editorial calendars", "Brand voice"] },
  { icon: Megaphone, t: "Brand & Launch", d: "Positioning and go-to-market that lands with impact.", items: ["Naming", "Positioning", "Launch campaigns"] },
  { icon: BarChart3, t: "Analytics & Reporting", d: "Dashboards that turn noise into next-step decisions.", items: ["GA4 setup", "Looker Studio", "Attribution"] },
];

function Services() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader eyebrow="Services" title="Everything you need to scale." sub="From the first audit to the millionth visitor — one craftsman, one bill." />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, t, d, items }) => (
            <div key={t} className="glass rounded-2xl p-7 hover:border-primary/40 transition group relative overflow-hidden">
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/15 transition" />
              <div className="relative">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary mb-5">
                  <Icon size={22} />
                </div>
                <h3 className="text-xl font-bold mb-2">{t}</h3>
                <p className="text-sm text-muted-foreground mb-5">{d}</p>
                <ul className="space-y-2">
                  {items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check size={14} className="text-primary shrink-0" /> {it}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
