import { useMemo, useState } from "react";
import { NeonButton, downloadPdf, PdfButton } from "./ToolHelpers";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

const seed = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};
const rand = (s: string, min: number, max: number) => min + ((seed(s) % 1000) / 1000) * (max - min);

// ============ COMPETITOR COMPARISON ============
export function CompetitorTool() {
  const [a, setA] = useState("yoursite.com");
  const [b, setB] = useState("competitor.com");
  const data = useMemo(() => {
    const metrics = ["Traffic", "Keywords", "Backlinks", "Domain Auth", "Page Speed"];
    return metrics.map((m) => ({
      metric: m,
      [a]: Math.round(rand(a + m, 30, 95)),
      [b]: Math.round(rand(b + m, 30, 95)),
    }));
  }, [a, b]);
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
      <div className="glass rounded-lg p-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="metric" tick={{ fontSize: 11, fill: "currentColor" }} />
            <YAxis tick={{ fontSize: 11, fill: "currentColor" }} />
            <Tooltip
              contentStyle={{
                background: "rgba(0,0,0,0.9)",
                border: "1px solid hsl(var(--primary))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey={a} fill="oklch(0.88 0.28 142)" radius={[4, 4, 0, 0]} />
            <Bar dataKey={b} fill="oklch(0.85 0.18 195)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground italic">
        Realistic mock data — for UI demo. Connect a real API key for production.
      </p>
      <PdfButton
        onClick={() =>
          downloadPdf(`Competitor Comparison`, [
            `${a} vs ${b}`,
            ...data.map((d) => `${d.metric}: ${a}=${d[a]} | ${b}=${d[b]}`),
          ])
        }
      />
    </div>
  );
}

// ============ BACKLINK OVERVIEW ============
export function BacklinkTool() {
  const [url, setUrl] = useState("");
  const [show, setShow] = useState(false);
  const data = useMemo(() => {
    if (!url) return null;
    const da = Math.round(rand(url + "da", 20, 85));
    const refs = Math.round(rand(url + "ref", 50, 5000));
    const total = Math.round(rand(url + "tot", 500, 50000));
    return { da, refs, total };
  }, [url]);
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com"
          className="flex-1 glass rounded-lg px-3 py-2 text-sm outline-none"
        />
        <NeonButton onClick={() => setShow(true)} disabled={!url}>
          Check
        </NeonButton>
      </div>
      {show && data && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <DAGauge value={data.da} />
            <Stat label="Referring Domains" value={data.refs.toLocaleString()} />
            <Stat label="Total Backlinks" value={data.total.toLocaleString()} />
          </div>
          <p className="text-xs text-muted-foreground italic">Realistic mock data — for UI demo.</p>
          <PdfButton
            onClick={() =>
              downloadPdf(`Backlink Overview - ${url}`, [
                `Domain: ${url}`,
                `Domain Authority: ${data.da}`,
                `Referring Domains: ${data.refs}`,
                `Total Backlinks: ${data.total}`,
              ])
            }
          />
        </>
      )}
    </div>
  );
}

function DAGauge({ value }: { value: number }) {
  return (
    <div className="glass rounded-lg p-4 text-center">
      <div className="relative h-20 w-20 mx-auto">
        <svg viewBox="0 0 100 100" className="-rotate-90">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            opacity="0.2"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="oklch(0.88 0.28 142)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 40}
            strokeDashoffset={2 * Math.PI * 40 * (1 - value / 100)}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-xl font-black text-primary">
          {value}
        </div>
      </div>
      <div className="text-xs uppercase mt-2 text-muted-foreground">Domain Auth</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-lg p-4 text-center">
      <div className="text-2xl font-black text-gradient">{value}</div>
      <div className="text-xs uppercase mt-2 text-muted-foreground">{label}</div>
    </div>
  );
}

// ============ ROI CALCULATOR ============
export function ROITool() {
  const [spend, setSpend] = useState(1000);
  const [revenue, setRevenue] = useState(3500);
  const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;
  const profit = revenue - spend;
  return (
    <div className="space-y-4 text-sm">
      <Field label="Marketing Spend ($)" value={spend} onChange={setSpend} />
      <Field label="Revenue Generated ($)" value={revenue} onChange={setRevenue} />
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-lg p-4 text-center">
          <div className="text-3xl font-black text-gradient">{roi.toFixed(1)}%</div>
          <div className="text-xs uppercase text-muted-foreground mt-1">ROI</div>
        </div>
        <div className="glass rounded-lg p-4 text-center">
          <div className="text-3xl font-black text-gradient">${profit.toLocaleString()}</div>
          <div className="text-xs uppercase text-muted-foreground mt-1">Profit</div>
        </div>
      </div>
    </div>
  );
}

// ============ CPC CALCULATOR ============
export function CPCTool() {
  const [budget, setBudget] = useState(500);
  const [clicks, setClicks] = useState(250);
  const [conv, setConv] = useState(5);
  const cpc = clicks > 0 ? budget / clicks : 0;
  const conversions = (clicks * conv) / 100;
  const cpa = conversions > 0 ? budget / conversions : 0;
  return (
    <div className="space-y-4 text-sm">
      <Field label="Ad Budget ($)" value={budget} onChange={setBudget} />
      <Field label="Expected Clicks" value={clicks} onChange={setClicks} />
      <Field label="Conversion Rate (%)" value={conv} onChange={setConv} />
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-lg p-4 text-center">
          <div className="text-2xl font-black text-gradient">${cpc.toFixed(2)}</div>
          <div className="text-xs uppercase text-muted-foreground mt-1">CPC</div>
        </div>
        <div className="glass rounded-lg p-4 text-center">
          <div className="text-2xl font-black text-gradient">{conversions.toFixed(0)}</div>
          <div className="text-xs uppercase text-muted-foreground mt-1">Conversions</div>
        </div>
        <div className="glass rounded-lg p-4 text-center">
          <div className="text-2xl font-black text-gradient">${cpa.toFixed(2)}</div>
          <div className="text-xs uppercase text-muted-foreground mt-1">CPA</div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full glass rounded-lg px-3 py-2 mt-1 outline-none focus:border-primary/50"
      />
    </label>
  );
}
