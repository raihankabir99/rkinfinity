import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { Rocket, Briefcase, TrendingUp, Pen, Facebook, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "Story — rkInfinity" },
      {
        name: "description",
        content:
          "The journey of RK — launch pad, internship, and growth in SEO and digital marketing.",
      },
      { property: "og:title", content: "RK's Story" },
      { property: "og:description", content: "From The Launch Pad to Growth & Analysis." },
    ],
  }),
  component: Story,
});

const timeline = [
  {
    y: "2025",
    icon: Rocket,
    t: "The Launch Pad",
    d: "Started learning SEO, Digital Marketing, and Coding basics — the foundation years of curiosity and craft.",
  },
  {
    y: "2026",
    icon: Briefcase,
    t: "Hands-on Experience",
    d: "Commenced internship on real-world technical SEO projects — translating theory into shipped results.",
  },
  {
    y: "2026",
    icon: TrendingUp,
    t: "Growth & Analysis",
    d: "Mastering data analysis and advanced optimization — building systems that compound over time.",
  },
];

const stories = [
  {
    title: "The Letter I Never Sent",
    teaser:
      "A short story about courage, regret, and the small words that change everything — written under a forest sky.",
  },
  {
    title: "Echoes in the Marketplace",
    teaser:
      "Where commerce meets character. A glimpse into the people behind the transactions that move our world.",
  },
  {
    title: "Midnight Algorithms",
    teaser:
      "An essay-poem on what it feels like to write code at 3 AM — when machines feel almost human.",
  },
];

function Story() {
  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-4 py-12">
        <SectionHeader
          eyebrow="The Journey"
          title="Every line of code began as a story."
          sub="A timeline of curiosity, craft, and quiet obsession."
        />

        <div className="relative">
          {/* center line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent" />

          <div className="space-y-12">
            {timeline.map((item, i) => {
              const Icon = item.icon;
              const left = i % 2 === 0;
              return (
                <div
                  key={item.t}
                  className={`relative md:flex items-center ${left ? "" : "md:flex-row-reverse"}`}
                >
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 grid h-8 w-8 place-items-center rounded-full bg-background border-2 border-primary z-10">
                    <Icon size={14} className="text-primary" />
                  </div>

                  <div
                    className={`md:w-1/2 pl-14 md:pl-0 ${left ? "md:pr-12 md:text-right" : "md:pl-12"}`}
                  >
                    <div className="glass rounded-2xl p-6 hover:border-primary/40 transition">
                      <div className="text-xs font-mono text-primary tracking-widest mb-2">
                        {item.y}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{item.t}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.d}</p>
                    </div>
                  </div>
                  <div className="hidden md:block md:w-1/2" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* THE STORYTELLER'S DEN */}
      <section
        className="relative mt-12 overflow-hidden"
        style={{
          backgroundImage: `url(/assets/storyteller-bg.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div aria-hidden="true" className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-32 text-center">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight">
            <span className="text-white">Welcome to </span>
            <span className="text-gradient">The Storyteller's Den</span>
          </h2>
          <p
            className="mt-6 text-2xl md:text-3xl italic text-[color:var(--gold-bright)]"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              textShadow: "0 2px 20px rgba(0,0,0,0.6)",
            }}
          >
            "My pen knows the language of love."
          </p>

          <div className="mt-16 grid md:grid-cols-3 gap-6 text-left">
            {stories.map((s) => (
              <div
                key={s.title}
                className="glass rounded-2xl p-6 hover:border-primary/50 transition flex flex-col"
                style={{ background: "rgba(0,0,0,0.55)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Facebook size={26} className="fb-neon" />
                  <ArrowUpRight size={18} className="text-[color:var(--gold-bright)]" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{s.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed flex-1 mb-5">{s.teaser}</p>
                <a
                  href="https://www.facebook.com/EndlessOcean"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-metal-pill w-full justify-center text-sm"
                >
                  <Facebook size={14} /> Read on Facebook
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
