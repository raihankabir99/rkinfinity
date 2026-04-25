import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Search, Gauge, FileSearch, KeyRound, Link2, FileCode2, Map, Tags,
  BarChart3, Network, Calculator, DollarSign,
  Sparkles, Youtube, FileText, Hash,
  Code2, Braces, Wand2, Binary, ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { PageSpeedTool, KeywordTool, SeoAuditTool, BrokenLinkTool, RobotsTool, SitemapTool, MetaTool, DensityTool } from "@/components/tools/SeoTools";
import { CompetitorTool, BacklinkTool, ROITool, CPCTool } from "@/components/tools/AnalyticsTools";
import { BlogIntroTool, YoutubeScriptTool, SummarizerTool, HashtagTool } from "@/components/tools/AiTools";
import { MinifierTool, JsonTool, BeautifyTool, Base64Tool } from "@/components/tools/CodingTools";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Tools Hub — rkInfinity" },
      { name: "description", content: "A curated hub of free SEO, analytics, AI, and coding tools — built by RK." },
      { property: "og:title", content: "Tools Hub — rkInfinity" },
      { property: "og:description", content: "Search 24+ free tools across SEO, analytics, AI, and coding." },
    ],
  }),
  component: ToolsHub,
});

const toolComponents: Record<string, () => ReactNode> = {
  "page-speed": () => <PageSpeedTool />,
  "keyword-research": () => <KeywordTool />,
  "seo-audit": () => <SeoAuditTool />,
  "broken-links": () => <BrokenLinkTool />,
  "robots-generator": () => <RobotsTool />,
  "sitemap-generator": () => <SitemapTool />,
  "meta-generator": () => <MetaTool />,
  "keyword-density": () => <DensityTool />,
  "competitor-comparison": () => <CompetitorTool />,
  "backlink-overview": () => <BacklinkTool />,
  "roi-calculator": () => <ROITool />,
  "cpc-calculator": () => <CPCTool />,
  "blog-intro": () => <BlogIntroTool />,
  "youtube-script": () => <YoutubeScriptTool />,
  "text-summarizer": () => <SummarizerTool />,
  "hashtag-generator": () => <HashtagTool />,
  "minifier": () => <MinifierTool />,
  "json-formatter": () => <JsonTool />,
  "code-beautifier": () => <BeautifyTool />,
  "base64": () => <Base64Tool />,
};

type Tool = { t: string; d: string; icon: LucideIcon; slug: string };
type Category = { id: string; name: string; accent: string; icon: LucideIcon; tools: Tool[] };

const categories: Category[] = [
  {
    id: "seo",
    name: "SEO Tools",
    accent: "from-primary/20 to-primary/5",
    icon: Search,
    tools: [
      { t: "Keyword Research", d: "Real keyword suggestions with search intent.", icon: KeyRound, slug: "keyword-research" },
      { t: "Page Speed", d: "Google PageSpeed API — Core Web Vitals report.", icon: Gauge, slug: "page-speed" },
      { t: "SEO Audit", d: "On-page audit for any URL in seconds.", icon: FileSearch, slug: "seo-audit" },
      { t: "Broken Link Checker", d: "Crawl any page and surface 404s instantly.", icon: Link2, slug: "broken-links" },
      { t: "Robots.txt Generator", d: "Build a clean, crawler-friendly robots.txt.", icon: FileCode2, slug: "robots-generator" },
      { t: "Sitemap Generator", d: "Generate XML sitemaps from a domain.", icon: Map, slug: "sitemap-generator" },
      { t: "Meta Tag Generator", d: "Craft perfect title, description & OG tags.", icon: Tags, slug: "meta-generator" },
      { t: "Keyword Density Checker", d: "Detect stuffing, find content gaps.", icon: BarChart3, slug: "keyword-density" },
    ],
  },
  {
    id: "analytics",
    name: "Analytics & Competitor",
    accent: "from-accent/20 to-accent/5",
    icon: BarChart3,
    tools: [
      { t: "Competitor Comparison", d: "Side-by-side metrics (realistic mock).", icon: Network, slug: "competitor-comparison" },
      { t: "Backlink Overview", d: "Domain authority + referring domains (mock).", icon: Link2, slug: "backlink-overview" },
      { t: "ROI Calculator", d: "Project return on marketing spend.", icon: Calculator, slug: "roi-calculator" },
      { t: "CPC Calculator", d: "Estimate cost-per-click & ad budgets.", icon: DollarSign, slug: "cpc-calculator" },
    ],
  },
  {
    id: "ai",
    name: "AI Tools",
    accent: "from-primary/20 to-accent/10",
    icon: Sparkles,
    tools: [
      { t: "AI Blog Intro Generator", d: "Hook-driven intros from a single topic.", icon: Sparkles, slug: "blog-intro" },
      { t: "YouTube Script Generator", d: "Full scripts with hook, body & CTA.", icon: Youtube, slug: "youtube-script" },
      { t: "Text Summarizer", d: "Compress long content into key points.", icon: FileText, slug: "text-summarizer" },
      { t: "Hashtag Generator", d: "On-trend hashtag sets per platform.", icon: Hash, slug: "hashtag-generator" },
    ],
  },
  {
    id: "code",
    name: "Coding Tools",
    accent: "from-accent/20 to-primary/10",
    icon: Code2,
    tools: [
      { t: "HTML / CSS / JS Minifier", d: "Shrink production assets in one click.", icon: Code2, slug: "minifier" },
      { t: "JSON Formatter", d: "Validate, pretty-print, and tree-view JSON.", icon: Braces, slug: "json-formatter" },
      { t: "Code Beautifier", d: "Reformat messy code with consistent style.", icon: Wand2, slug: "code-beautifier" },
      { t: "Base64 Converter", d: "Encode & decode text or files to Base64.", icon: Binary, slug: "base64" },
    ],
  },
];

function ToolsHub() {
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [openTool, setOpenTool] = useState<Tool | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return categories
      .filter((c) => activeCat === "all" || c.id === activeCat)
      .map((c) => ({
        ...c,
        tools: c.tools.filter(
          (t) => !query || t.t.toLowerCase().includes(query) || t.d.toLowerCase().includes(query)
        ),
      }))
      .filter((c) => c.tools.length > 0);
  }, [q, activeCat]);

  const totalCount = categories.reduce((sum, c) => sum + c.tools.length, 0);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader
          eyebrow="Tools Hub"
          title={`${totalCount} free tools, one workbench.`}
          sub="SEO, analytics, AI, and coding utilities — search or browse by category."
        />

        {/* SEARCH BAR */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="glass rounded-2xl flex items-center gap-3 px-5 py-4 focus-within:border-primary/50 transition">
            <Search size={20} className="text-primary shrink-0" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tools — try 'keyword', 'json', 'roi'…"
              className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
              aria-label="Search tools"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="text-xs text-muted-foreground hover:text-foreground transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <button
            onClick={() => setActiveCat("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeCat === "all"
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                : "glass hover:border-primary/40"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition inline-flex items-center gap-2 ${
                activeCat === c.id
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                  : "glass hover:border-primary/40"
              }`}
            >
              <c.icon size={14} />
              {c.name}
            </button>
          ))}
        </div>

        {/* CATEGORY SECTIONS */}
        {filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            No tools match <span className="text-foreground font-mono">"{q}"</span>. Try another keyword.
          </div>
        ) : (
          <div className="space-y-16">
            {filtered.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${cat.accent} text-primary`}>
                    <cat.icon size={18} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{cat.name}</h2>
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                      {cat.tools.length} {cat.tools.length === 1 ? "tool" : "tools"}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {cat.tools.map((tool) => {
                    const { t, d, icon: Icon } = tool;
                    return (
                      <div
                        key={t}
                        className="glass rounded-2xl p-6 hover:border-primary/40 transition group flex flex-col"
                      >
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary mb-4 group-hover:scale-110 transition">
                          <Icon size={20} />
                        </div>
                        <h3 className="text-base font-bold mb-1.5 leading-tight">{t}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">{d}</p>
                        <button
                          type="button"
                          onClick={() => setOpenTool(tool)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition w-full"
                        >
                          Launch Tool
                          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog open={!!openTool} onOpenChange={(o) => !o && setOpenTool(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border">
          {openTool && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                    <openTool.icon size={18} />
                  </div>
                  {openTool.t}
                </DialogTitle>
                <DialogDescription>{openTool.d}</DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                {toolComponents[openTool.slug]?.() ?? <p className="text-sm text-muted-foreground">Coming soon.</p>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
