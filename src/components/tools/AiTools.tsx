import { useState } from "react";
import { NeonButton, Spinner } from "./ToolHelpers";

const fakeDelay = () => new Promise<void>((r) => setTimeout(r, 600));

// ============ BLOG INTRO ============
export function BlogIntroTool() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<string[]>([]);
  const run = async () => {
    setLoading(true);
    setOut([]);
    await fakeDelay();
    setOut([
      `Let's be honest: most articles about ${topic} are forgettable. They rehash the same five tips and call it a day. This isn't one of those. In the next few minutes, you'll get a battle-tested framework I've used to ship results — not theory.`,
      `Imagine cutting your time spent on ${topic} in half while doubling the output. Sounds like a stretch? It's not. Below is the exact playbook I wish someone had handed me three years ago.`,
      `${topic.charAt(0).toUpperCase() + topic.slice(1)} feels overwhelming until you see it broken down. Today we'll strip away the noise and walk through the essentials — no fluff, just the moves that actually move the needle.`,
    ]);
    setLoading(false);
  };
  return (
    <div className="space-y-3">
      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Blog topic..."
        className="w-full glass rounded-lg px-3 py-2 text-sm outline-none"
      />
      <NeonButton onClick={run} disabled={!topic || loading}>
        Generate 3 Variations
      </NeonButton>
      {loading && <Spinner label="Crafting intros..." />}
      {out.map((o, i) => (
        <div key={i} className="glass rounded-lg p-4 text-sm leading-relaxed">
          <div className="text-xs uppercase text-primary mb-2 font-mono">Variation {i + 1}</div>
          {o}
          <button
            onClick={() => navigator.clipboard.writeText(o)}
            className="block mt-2 text-xs text-primary hover:underline"
          >
            Copy
          </button>
        </div>
      ))}
    </div>
  );
}

// ============ YOUTUBE SCRIPT ============
export function YoutubeScriptTool() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState("");
  const run = async () => {
    setLoading(true);
    setOut("");
    await fakeDelay();
    setOut(
      `🎬 HOOK (0:00–0:15)\nStop scrolling. If you care about ${topic}, the next 60 seconds will save you weeks of trial and error.\n\n📍 INTRO (0:15–0:45)\nWelcome back. Today we're breaking down ${topic} into three actionable steps — no fluff, no filler.\n\n💡 BODY (0:45–4:30)\nStep 1: Understand the fundamentals of ${topic}.\nStep 2: Apply the 80/20 rule — focus on what moves the needle.\nStep 3: Iterate based on real data, not assumptions.\n\n🎯 CTA (4:30–5:00)\nIf this helped, smash that like button and subscribe. Drop your biggest question about ${topic} in the comments — I read every single one.\n\nSee you in the next video!`,
    );
    setLoading(false);
  };
  return (
    <div className="space-y-3">
      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Video topic..."
        className="w-full glass rounded-lg px-3 py-2 text-sm outline-none"
      />
      <NeonButton onClick={run} disabled={!topic || loading}>
        Generate Script
      </NeonButton>
      {loading && <Spinner label="Writing script..." />}
      {out && (
        <pre className="glass rounded-lg p-4 text-xs whitespace-pre-wrap font-sans leading-relaxed">
          {out}
        </pre>
      )}
    </div>
  );
}

// ============ SUMMARIZER ============
export function SummarizerTool() {
  const [text, setText] = useState("");
  const [out, setOut] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    setOut([]);
    await fakeDelay();
    const sents = text.match(/[^.!?]+[.!?]+/g) ?? [text];
    const scored = sents.map((s) => ({ s: s.trim(), score: s.length + s.split(" ").length * 2 }));
    scored.sort((a, b) => b.score - a.score);
    setOut(scored.slice(0, 5).map((s) => "• " + s.s));
    setLoading(false);
  };
  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Paste long text..."
        className="w-full glass rounded-lg px-3 py-2 text-sm outline-none"
      />
      <NeonButton onClick={run} disabled={!text || loading}>
        Summarize
      </NeonButton>
      {loading && <Spinner />}
      {out.length > 0 && (
        <div className="glass rounded-lg p-4 space-y-1.5 text-sm">
          {out.map((o, i) => (
            <div key={i}>{o}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ HASHTAG GENERATOR ============
export function HashtagTool() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [out, setOut] = useState<string[]>([]);
  const run = () => {
    const base = topic.toLowerCase().replace(/\s+/g, "");
    const sets: Record<string, string[]> = {
      instagram: [
        `#${base}`,
        `#${base}love`,
        `#${base}gram`,
        `#${base}daily`,
        `#instagood`,
        `#explore`,
        `#viral`,
        `#trending`,
        `#${base}life`,
        `#${base}community`,
        `#photooftheday`,
        `#reels`,
      ],
      twitter: [`#${base}`, `#${base}Tips`, `#${base}2026`, `#TechTwitter`, `#BuildInPublic`],
      linkedin: [
        `#${base}`,
        `#${base}Strategy`,
        `#Leadership`,
        `#GrowthMindset`,
        `#${base}Insights`,
        `#FutureOfWork`,
      ],
      tiktok: [
        `#${base}`,
        `#${base}tok`,
        `#fyp`,
        `#foryoupage`,
        `#viral`,
        `#${base}challenge`,
        `#trending2026`,
      ],
    };
    setOut(sets[platform] || []);
  };
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic..."
          className="flex-1 glass rounded-lg px-3 py-2 text-sm outline-none"
        />
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="glass rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="instagram">Instagram</option>
          <option value="twitter">Twitter/X</option>
          <option value="linkedin">LinkedIn</option>
          <option value="tiktok">TikTok</option>
        </select>
        <NeonButton onClick={run} disabled={!topic}>
          Generate
        </NeonButton>
      </div>
      {out.length > 0 && (
        <>
          <div className="glass rounded-lg p-4 flex flex-wrap gap-2 text-sm text-primary">
            {out.map((t) => (
              <span key={t} className="font-mono">
                {t}
              </span>
            ))}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(out.join(" "))}
            className="text-xs text-primary hover:underline"
          >
            Copy all
          </button>
        </>
      )}
    </div>
  );
}
