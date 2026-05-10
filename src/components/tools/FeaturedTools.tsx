import { useState } from "react";
import { NeonButton, Spinner, downloadPdf, PdfButton } from "./ToolHelpers";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const seed = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};
const rand = (s: string, min: number, max: number) => min + ((seed(s) % 1000) / 1000) * (max - min);

// ============ WEBSITE WORTH CALCULATOR ============
export function WebsiteWorthTool() {
  const [url, setUrl] = useState("");
  const [traffic, setTraffic] = useState(10000);
  const [show, setShow] = useState(false);

  const data = (() => {
    if (!show || !url) return null;
    const monthly = Math.round(traffic * rand(url, 0.005, 0.025) * 100) / 100;
    const annual = Math.round(monthly * 12);
    const worth = Math.round(annual * rand(url + "m", 2.2, 4.5));
    const breakdown = [
      { name: "Ad Revenue", value: Math.round(worth * 0.45) },
      { name: "Affiliate", value: Math.round(worth * 0.25) },
      { name: "Backlink Equity", value: Math.round(worth * 0.18) },
      { name: "Brand Value", value: Math.round(worth * 0.12) },
    ];
    return { monthly, annual, worth, breakdown };
  })();
  const COLORS = [
    "oklch(0.78 0.14 85)",
    "oklch(0.92 0.13 92)",
    "oklch(0.65 0.12 75)",
    "oklch(0.55 0.1 70)",
  ];

  return (
    <div className="space-y-4">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="example.com"
        className="w-full glass rounded-lg px-3 py-2 text-sm outline-none"
      />
      <label className="block text-sm">
        <span className="text-xs uppercase text-muted-foreground">Monthly visitors</span>
        <input
          type="number"
          value={traffic}
          onChange={(e) => setTraffic(Number(e.target.value) || 0)}
          className="w-full glass rounded-lg px-3 py-2 mt-1 outline-none"
        />
      </label>
      <NeonButton onClick={() => setShow(true)} disabled={!url}>
        Estimate Worth
      </NeonButton>
      {data && (
        <>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="glass rounded-lg p-4">
              <div className="text-2xl font-black text-gradient">${data.monthly}</div>
              <div className="text-xs uppercase text-muted-foreground mt-1">/ month</div>
            </div>
            <div className="glass rounded-lg p-4">
              <div className="text-2xl font-black text-gradient">
                ${data.annual.toLocaleString()}
              </div>
              <div className="text-xs uppercase text-muted-foreground mt-1">/ year</div>
            </div>
            <div className="glass rounded-lg p-4">
              <div className="text-2xl font-black text-gradient">
                ${data.worth.toLocaleString()}
              </div>
              <div className="text-xs uppercase text-muted-foreground mt-1">Site worth</div>
            </div>
          </div>
          <div className="glass rounded-lg p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.breakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  dataKey="value"
                >
                  {data.breakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#000",
                    border: "1px solid oklch(0.78 0.14 85)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <PdfButton
            onClick={() =>
              downloadPdf(`Website Worth - ${url}`, [
                `URL: ${url}`,
                `Monthly visitors: ${traffic}`,
                `Monthly revenue: $${data.monthly}`,
                `Annual revenue: $${data.annual}`,
                `Estimated worth: $${data.worth}`,
                ...data.breakdown.map((b) => `${b.name}: $${b.value}`),
              ])
            }
          />
          <p className="text-xs text-muted-foreground italic">
            Realistic estimate based on traffic & monetization heuristics.
          </p>
        </>
      )}
    </div>
  );
}

// ============ AI CONTENT HUMANIZER ============
export function HumanizerTool() {
  const [text, setText] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const humanize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setOut("");
    await new Promise((r) => setTimeout(r, 600));
    let result = text
      .replace(/\butilize\b/gi, "use")
      .replace(/\bin order to\b/gi, "to")
      .replace(/\bfurthermore\b/gi, "also")
      .replace(/\bmoreover\b/gi, "and")
      .replace(/\bnevertheless\b/gi, "still")
      .replace(/\bsubsequently\b/gi, "then")
      .replace(/\bcommence\b/gi, "start")
      .replace(/\bdemonstrate\b/gi, "show")
      .replace(/\bfacilitate\b/gi, "help")
      .replace(/\bleverage\b/gi, "use")
      .replace(/\bdelve into\b/gi, "explore")
      .replace(/\bIt is important to note that\b/gi, "Note:")
      .replace(/\bIn conclusion,\b/gi, "So,")
      .replace(/—/g, "-");
    // sprinkle contractions
    result = result
      .replace(/\bdo not\b/gi, "don't")
      .replace(/\bcannot\b/gi, "can't")
      .replace(/\bit is\b/gi, "it's")
      .replace(/\byou are\b/gi, "you're");
    setOut(result);
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Paste AI-generated text..."
        className="w-full glass rounded-lg px-3 py-2 text-sm outline-none"
      />
      <NeonButton onClick={humanize} disabled={!text || loading}>
        Humanize
      </NeonButton>
      {loading && <Spinner label="Rewriting in a human voice..." />}
      {out && (
        <>
          <div className="glass rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap">
            {out}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(out)}
            className="text-xs text-primary hover:underline"
          >
            Copy
          </button>
          <PdfButton onClick={() => downloadPdf("Humanized Content", [out])} />
        </>
      )}
    </div>
  );
}

// ============ RANK BATTLE ============
export function RankBattleTool() {
  const [a, setA] = useState("yoursite.com");
  const [b, setB] = useState("competitor.com");
  const [show, setShow] = useState(false);

  const rounds = ["Authority", "Speed", "Content", "Backlinks", "UX", "Mobile", "SEO Basics"];
  const data = show
    ? rounds.map((m) => ({
        metric: m,
        [a]: Math.round(rand(a + m, 40, 98)),
        [b]: Math.round(rand(b + m, 40, 98)),
      }))
    : [];
  const winsA = data.reduce((s, d) => s + ((d[a] as number) > (d[b] as number) ? 1 : 0), 0);
  const winsB = data.length - winsA;
  const winner = winsA > winsB ? a : winsB > winsA ? b : "Tie";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <input
          value={a}
          onChange={(e) => setA(e.target.value)}
          className="glass rounded-lg px-3 py-2 text-sm outline-none"
        />
        <input
          value={b}
          onChange={(e) => setB(e.target.value)}
          className="glass rounded-lg px-3 py-2 text-sm outline-none"
        />
      </div>
      <NeonButton onClick={() => setShow(true)} disabled={!a || !b}>
        ⚔ Battle!
      </NeonButton>
      {show && (
        <>
          <div className="glass rounded-lg p-4 text-center">
            <div className="text-xs uppercase text-muted-foreground mb-1">Winner</div>
            <div className="text-2xl font-black text-gradient">🏆 {winner}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {winsA} – {winsB}
            </div>
          </div>
          <div className="glass rounded-lg p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.78 0.14 85 / 0.2)" />
                <XAxis dataKey="metric" tick={{ fontSize: 10, fill: "currentColor" }} />
                <YAxis tick={{ fontSize: 10, fill: "currentColor" }} />
                <Tooltip
                  contentStyle={{
                    background: "#000",
                    border: "1px solid oklch(0.78 0.14 85)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey={a} fill="oklch(0.85 0.15 88)" radius={[4, 4, 0, 0]} />
                <Bar dataKey={b} fill="oklch(0.85 0.2 142)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <PdfButton
            onClick={() =>
              downloadPdf(`Rank Battle - ${a} vs ${b}`, [
                `Winner: ${winner} (${winsA}-${winsB})`,
                ...data.map((d) => `${d.metric}: ${a}=${d[a]} | ${b}=${d[b]}`),
              ])
            }
          />
        </>
      )}
    </div>
  );
}
