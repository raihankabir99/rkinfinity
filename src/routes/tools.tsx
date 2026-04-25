import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { Wrench, Gauge, FileSearch, KeyRound, Image as ImageIcon, Link2, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Tools — rkInfinity" },
      { name: "description", content: "Free tools for SEO, marketing, and developers — built by RK." },
      { property: "og:title", content: "Free Tools — rkInfinity" },
      { property: "og:description", content: "Handcrafted utilities for the modern web professional." },
    ],
  }),
  component: Tools,
});

const tools = [
  { icon: Gauge, t: "PageSpeed Analyzer", d: "Instant Core Web Vitals snapshot for any URL.", tag: "SEO" },
  { icon: FileSearch, t: "Meta Tag Inspector", d: "Audit titles, descriptions, OG and Twitter cards.", tag: "SEO" },
  { icon: KeyRound, t: "Keyword Density", d: "Spot keyword stuffing and content opportunities.", tag: "Content" },
  { icon: ImageIcon, t: "Image Compressor", d: "Lossless WebP conversion at the edge.", tag: "Dev" },
  { icon: Link2, t: "Broken Link Checker", d: "Crawl your sitemap and surface 404s in seconds.", tag: "SEO" },
  { icon: Wrench, t: "Schema Generator", d: "Build valid JSON-LD for any rich result type.", tag: "Dev" },
];

function Tools() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader eyebrow="Toolkit" title="Free tools, built with care." sub="The same utilities I use on every client engagement — yours to use." />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map(({ icon: Icon, t, d, tag }) => (
            <div key={t} className="glass rounded-2xl p-7 hover:border-primary/40 transition cursor-pointer group">
              <div className="flex items-start justify-between mb-5">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                  <Icon size={22} />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-primary px-2 py-1 rounded-md bg-primary/10">{tag}</span>
              </div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                {t}
                <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition" />
              </h3>
              <p className="text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
