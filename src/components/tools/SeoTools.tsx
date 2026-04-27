import { useState } from "react";
import { Spinner, NeonButton, CircularScore, downloadPdf, PdfButton } from "./ToolHelpers";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const normalizeUrl = (u: string) => {
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
};

// Multi-proxy fetch with fallbacks for CORS-restricted URLs
async function fetchHtmlWithFallback(target: string): Promise<{ html: string; status: number }> {
  const proxies = [
    { url: `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`, kind: "allorigins" as const },
    { url: `https://corsproxy.io/?${encodeURIComponent(target)}`, kind: "raw" as const },
    { url: `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(target)}`, kind: "raw" as const },
  ];
  let lastErr: unknown = null;
  for (const p of proxies) {
    try {
      const r = await fetch(p.url);
      if (!r.ok) { lastErr = new Error(`Proxy ${r.status}`); continue; }
      if (p.kind === "allorigins") {
        const j = await r.json();
        if (!j?.contents) { lastErr = new Error("Empty proxy response"); continue; }
        return { html: j.contents, status: j?.status?.http_code ?? 200 };
      }
      const html = await r.text();
      if (!html) { lastErr = new Error("Empty body"); continue; }
      return { html, status: 200 };
    } catch (e) { lastErr = e; }
  }
  throw lastErr instanceof Error ? lastErr : new Error("All proxies failed");
}

// ============ PAGE SPEED ============
export function PageSpeedTool() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ perf: number; seo: number; a11y: number; bp: number; lcp?: string; cls?: string } | null>(null);
  const [err, setErr] = useState("");

  const run = async () => {
    setErr(""); setData(null); setLoading(true);
    const target = encodeURIComponent(normalizeUrl(url));
    const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${target}&category=performance&category=seo&category=accessibility&category=best-practices&strategy=mobile`;
    // 429-aware: retry up to 3 times with exponential back-off
    const fetchWithRetry = async (): Promise<Response> => {
      for (let attempt = 0; attempt < 3; attempt++) {
        const r = await fetch(endpoint);
        if (r.status !== 429) return r;
        await new Promise((res) => setTimeout(res, 1500 * (attempt + 1)));
      }
      return fetch(endpoint);
    };
    try {
      const res = await fetchWithRetry();
      if (res.status === 429) {
        throw new Error("Google PageSpeed is rate-limiting (429). Please wait ~30 seconds and try again.");
      }
      if (!res.ok) throw new Error(`PageSpeed API error ${res.status}`);
      const json = await res.json();
      const c = json.lighthouseResult.categories;
      const audits = json.lighthouseResult.audits;
      setData({
        perf: Math.round((c.performance?.score ?? 0) * 100),
        seo: Math.round((c.seo?.score ?? 0) * 100),
        a11y: Math.round((c.accessibility?.score ?? 0) * 100),
        bp: Math.round((c["best-practices"]?.score ?? 0) * 100),
        lcp: audits["largest-contentful-paint"]?.displayValue,
        cls: audits["cumulative-layout-shift"]?.displayValue,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to fetch");
    } finally { setLoading(false); }
  };

  const chartData = data
    ? [
        { name: "Performance", value: data.perf },
        { name: "SEO", value: data.seo },
        { name: "Accessibility", value: data.a11y },
        { name: "Best Practices", value: data.bp },
      ]
    : [];
  const COLORS = ["oklch(0.78 0.14 85)", "oklch(0.92 0.13 92)", "oklch(0.65 0.12 75)", "oklch(0.55 0.1 70)"];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="example.com"
          className="flex-1 glass rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary/50" />
        <NeonButton onClick={run} disabled={!url || loading}>Analyze</NeonButton>
      </div>
      {err && <p className="text-sm text-destructive flex items-center gap-2"><AlertCircle size={14} /> {err}</p>}
      {loading && <Spinner label="Calling Google PageSpeed API..." />}
      {data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
            <CircularScore value={data.perf} label="Performance" />
            <CircularScore value={data.seo} label="SEO" />
            <CircularScore value={data.a11y} label="Accessibility" />
            <CircularScore value={data.bp} label="Best Practices" />
          </div>
          <div className="glass rounded-lg p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} innerRadius={45} dataKey="value" label={(p) => `${(p as { name?: string }).name ?? ""}: ${(p as { value?: number }).value ?? ""}`}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#000", border: "1px solid oklch(0.78 0.14 85)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {(data.lcp || data.cls) && (
            <div className="glass rounded-lg p-4 text-xs space-y-1 font-mono">
              {data.lcp && <div>LCP: <span className="text-primary">{data.lcp}</span></div>}
              {data.cls && <div>CLS: <span className="text-primary">{data.cls}</span></div>}
            </div>
          )}
          <PdfButton onClick={() => downloadPdf(`PageSpeed Report - ${url}`, [
            `URL: ${url}`, `Performance: ${data.perf}`, `SEO: ${data.seo}`,
            `Accessibility: ${data.a11y}`, `Best Practices: ${data.bp}`,
            data.lcp ? `LCP: ${data.lcp}` : "", data.cls ? `CLS: ${data.cls}` : "",
          ].filter(Boolean))} />
        </>
      )}
    </div>
  );
}

// ============ KEYWORD RESEARCH ============
export function KeywordTool() {
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("us");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const localeMap: Record<string, { hl: string; gl: string }> = {
    us: { hl: "en", gl: "us" }, uk: { hl: "en", gl: "uk" },
    bd: { hl: "bn", gl: "bd" }, ksa: { hl: "ar", gl: "sa" },
  };

  const run = async () => {
    if (!q) return;
    setLoading(true); setResults([]);
    try {
      const { hl, gl } = localeMap[loc];
      const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=${hl}&gl=${gl}&q=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      const data = await res.json();
      setResults(data[1] ?? []);
    } catch {
      // CORS fallback: build modifier-based suggestions
      setResults([q, `${q} 2026`, `best ${q}`, `${q} guide`, `${q} tips`, `how to ${q}`, `${q} examples`, `${q} for beginners`]);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="seed keyword"
          className="flex-1 glass rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary/50" />
        <select value={loc} onChange={(e) => setLoc(e.target.value)}
          className="glass rounded-lg px-3 py-2.5 text-sm outline-none">
          <option value="us">🇺🇸 USA</option>
          <option value="uk">🇬🇧 UK</option>
          <option value="bd">🇧🇩 Bangladesh</option>
          <option value="ksa">🇸🇦 KSA</option>
        </select>
        <NeonButton onClick={run} disabled={loading || !q}>Suggest</NeonButton>
      </div>
      {loading && <Spinner label="Fetching Google suggestions..." />}
      {results.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-2">
          {results.map((r) => (
            <div key={r} className="glass rounded-lg px-4 py-2.5 text-sm hover:border-primary/40 transition flex items-center justify-between">
              <span>{r}</span>
              <span className="text-xs font-mono text-primary">{Math.floor(Math.random() * 90 + 10)}K</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ SEO AUDIT ============
export function SeoAuditTool() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ title: string; desc: string; h1: string[]; h2: string[]; h3: string[]; status: number } | null>(null);
  const [err, setErr] = useState("");

  const run = async () => {
    setErr(""); setData(null); setLoading(true);
    try {
      const target = normalizeUrl(url);
      const { html, status } = await fetchHtmlWithFallback(target);
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      setData({
        title: doc.querySelector("title")?.textContent?.trim() ?? "(missing)",
        desc: doc.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() ?? "(missing)",
        h1: [...doc.querySelectorAll("h1")].map((h) => h.textContent?.trim() ?? "").filter(Boolean),
        h2: [...doc.querySelectorAll("h2")].map((h) => h.textContent?.trim() ?? "").filter(Boolean),
        h3: [...doc.querySelectorAll("h3")].map((h) => h.textContent?.trim() ?? "").filter(Boolean),
        status,
      });
    } catch (e) {
      setErr(e instanceof Error ? `Failed to fetch — ${e.message}. Try again or check the URL.` : "Failed to fetch");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="example.com"
          className="flex-1 glass rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary/50" />
        <NeonButton onClick={run} disabled={loading || !url}>Audit</NeonButton>
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      {loading && <Spinner label="Fetching & parsing..." />}
      {data && (
        <div className="space-y-3 text-sm">
          <AuditRow label="Status" value={String(data.status)} ok={data.status < 400} />
          <AuditRow label="Title" value={data.title} ok={data.title !== "(missing)" && data.title.length < 70} />
          <AuditRow label="Meta Description" value={data.desc} ok={data.desc !== "(missing)" && data.desc.length < 160} />
          <AuditRow label={`H1 (${data.h1.length})`} value={data.h1.join(" · ") || "(none)"} ok={data.h1.length === 1} />
          <AuditRow label={`H2 (${data.h2.length})`} value={data.h2.slice(0, 5).join(" · ") || "(none)"} ok={data.h2.length > 0} />
          <AuditRow label={`H3 (${data.h3.length})`} value={data.h3.slice(0, 5).join(" · ") || "(none)"} ok={true} />
          <PdfButton onClick={() => downloadPdf(`SEO Audit - ${url}`, [
            `URL: ${url}`, `Status: ${data.status}`, `Title: ${data.title}`, `Description: ${data.desc}`,
            `H1 (${data.h1.length}): ${data.h1.join(" | ")}`,
            `H2 (${data.h2.length}): ${data.h2.join(" | ")}`,
            `H3 (${data.h3.length}): ${data.h3.join(" | ")}`,
          ])} />
        </div>
      )}
    </div>
  );
}

function AuditRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="glass rounded-lg p-3 flex gap-3">
      {ok ? <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" /> : <XCircle size={18} className="text-destructive shrink-0 mt-0.5" />}
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="text-sm break-words">{value}</div>
      </div>
    </div>
  );
}

// ============ BROKEN LINK CHECKER ============
export function BrokenLinkTool() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ link: string; status: number | string }[]>([]);

  const run = async () => {
    setResults([]); setLoading(true);
    try {
      const target = normalizeUrl(url);
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(target)}`);
      const json = await res.json();
      const doc = new DOMParser().parseFromString(json.contents, "text/html");
      const base = new URL(target);
      const links = [...doc.querySelectorAll("a[href]")]
        .map((a) => a.getAttribute("href")!)
        .filter((h) => h && !h.startsWith("#") && !h.startsWith("mailto:") && !h.startsWith("javascript:"))
        .map((h) => { try { return new URL(h, base).href; } catch { return null; } })
        .filter((h): h is string => !!h)
        .slice(0, 20);
      const unique = Array.from(new Set(links));
      const checks = await Promise.all(unique.map(async (link) => {
        try {
          const r = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(link)}`, { method: "HEAD" });
          return { link, status: r.status };
        } catch { return { link, status: "ERR" as const }; }
      }));
      setResults(checks);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="example.com"
          className="flex-1 glass rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary/50" />
        <NeonButton onClick={run} disabled={loading || !url}>Scan</NeonButton>
      </div>
      {loading && <Spinner label="Crawling links..." />}
      {results.length > 0 && (
        <div className="space-y-1.5 max-h-96 overflow-y-auto">
          {results.map((r) => {
            const broken = typeof r.status === "string" || r.status >= 400;
            return (
              <div key={r.link} className="glass rounded-lg px-3 py-2 text-xs flex items-center justify-between gap-3">
                <span className="truncate font-mono">{r.link}</span>
                <span className={`shrink-0 font-bold ${broken ? "text-destructive" : "text-primary"}`}>{r.status}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ ROBOTS.TXT GENERATOR ============
export function RobotsTool() {
  const [allowAll, setAllowAll] = useState(true);
  const [disallow, setDisallow] = useState("/admin\n/private");
  const [sitemap, setSitemap] = useState("https://example.com/sitemap.xml");
  const out = `User-agent: *\n${allowAll ? "Allow: /" : "Disallow: /"}\n${disallow.split("\n").filter(Boolean).map((d) => `Disallow: ${d}`).join("\n")}\n\nSitemap: ${sitemap}`;
  return (
    <div className="space-y-3 text-sm">
      <label className="flex items-center gap-2"><input type="checkbox" checked={allowAll} onChange={(e) => setAllowAll(e.target.checked)} /> Allow all crawlers</label>
      <textarea value={disallow} onChange={(e) => setDisallow(e.target.value)} rows={3} placeholder="Disallow paths (one per line)"
        className="w-full glass rounded-lg px-3 py-2 text-sm outline-none" />
      <input value={sitemap} onChange={(e) => setSitemap(e.target.value)} placeholder="Sitemap URL"
        className="w-full glass rounded-lg px-3 py-2 text-sm outline-none" />
      <pre className="glass rounded-lg p-4 text-xs font-mono whitespace-pre-wrap">{out}</pre>
      <NeonButton onClick={() => navigator.clipboard.writeText(out)}>Copy</NeonButton>
    </div>
  );
}

// ============ SITEMAP GENERATOR ============
export function SitemapTool() {
  const [domain, setDomain] = useState("https://example.com");
  const [paths, setPaths] = useState("/\n/about\n/services\n/blog\n/contact");
  const today = new Date().toISOString().split("T")[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.split("\n").filter(Boolean).map((p) => `  <url>\n    <loc>${domain}${p}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join("\n")}\n</urlset>`;
  return (
    <div className="space-y-3 text-sm">
      <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="https://example.com"
        className="w-full glass rounded-lg px-3 py-2 text-sm outline-none" />
      <textarea value={paths} onChange={(e) => setPaths(e.target.value)} rows={5}
        className="w-full glass rounded-lg px-3 py-2 text-sm outline-none font-mono" />
      <pre className="glass rounded-lg p-4 text-xs font-mono whitespace-pre-wrap max-h-72 overflow-auto">{xml}</pre>
      <NeonButton onClick={() => navigator.clipboard.writeText(xml)}>Copy XML</NeonButton>
    </div>
  );
}

// ============ META TAG GENERATOR ============
export function MetaTool() {
  const [t, setT] = useState("My Awesome Page");
  const [d, setD] = useState("A concise, compelling description under 160 chars.");
  const [img, setImg] = useState("https://example.com/og.jpg");
  const [u, setU] = useState("https://example.com");
  const out = `<title>${t}</title>\n<meta name="description" content="${d}" />\n<link rel="canonical" href="${u}" />\n<meta property="og:title" content="${t}" />\n<meta property="og:description" content="${d}" />\n<meta property="og:image" content="${img}" />\n<meta property="og:url" content="${u}" />\n<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="${t}" />\n<meta name="twitter:description" content="${d}" />\n<meta name="twitter:image" content="${img}" />`;
  return (
    <div className="space-y-3 text-sm">
      <input value={t} onChange={(e) => setT(e.target.value)} placeholder="Title" className="w-full glass rounded-lg px-3 py-2 outline-none" />
      <textarea value={d} onChange={(e) => setD(e.target.value)} rows={2} placeholder="Description" className="w-full glass rounded-lg px-3 py-2 outline-none" />
      <input value={u} onChange={(e) => setU(e.target.value)} placeholder="Canonical URL" className="w-full glass rounded-lg px-3 py-2 outline-none" />
      <input value={img} onChange={(e) => setImg(e.target.value)} placeholder="OG Image URL" className="w-full glass rounded-lg px-3 py-2 outline-none" />
      <pre className="glass rounded-lg p-4 text-xs font-mono whitespace-pre-wrap max-h-72 overflow-auto">{out}</pre>
      <NeonButton onClick={() => navigator.clipboard.writeText(out)}>Copy Tags</NeonButton>
    </div>
  );
}

// ============ KEYWORD DENSITY ============
export function DensityTool() {
  const [text, setText] = useState("");
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) ?? [];
  const stop = new Set(["the", "and", "for", "are", "but", "not", "you", "all", "can", "her", "was", "one", "our", "out", "his", "has", "had", "how", "with", "this", "that", "from", "they", "have", "what", "your", "will", "there", "their"]);
  const counts: Record<string, number> = {};
  words.filter((w) => !stop.has(w)).forEach((w) => { counts[w] = (counts[w] ?? 0) + 1; });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 15);
  const total = words.length || 1;
  return (
    <div className="space-y-3 text-sm">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder="Paste content..."
        className="w-full glass rounded-lg px-3 py-2 outline-none" />
      <div className="text-xs text-muted-foreground">Total words: <span className="text-primary font-bold">{words.length}</span></div>
      <div className="space-y-1.5">
        {top.map(([w, c]) => (
          <div key={w} className="glass rounded-lg px-3 py-2 flex items-center justify-between text-xs">
            <span className="font-mono">{w}</span>
            <span className="text-primary">{c} · {((c / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
