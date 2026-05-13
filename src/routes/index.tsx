import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { buttonVariants } from "@/components/ui/button";
import { TypingText } from "@/components/TypingText";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <PageShell>
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 text-center bg-grid-pattern">
        {/* Faded Gradient Overlay */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black to-transparent opacity-80" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent opacity-90" />

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <h1
                className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400/90"
                style={{ textWrap: "balance" } as React.CSSProperties}
              >
                Raihan Kabir
              </h1>
              <div
                className="mt-2 font-black tracking-tight leading-[1.05] flex flex-nowrap items-baseline justify-center gap-x-3 mx-auto"
                style={{
                  fontSize: "clamp(1.75rem, 5.5vw, 4.5rem)",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                <TypingText
                  words={[
                    "SEO Specialist",
                    "Digital Marketer",
                    "AI-Powered Web Creator",
                    "Content Strategist",
                  ]}
                  speed={110}
                  pause={1800}
                />
              </div>
              <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Building infinite possibilities at the intersection of search, code, and growth. I help
                brands rank, scale, and connect.
              </p>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/services"
                className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
              >
                Explore Services
              </Link>
              <Link
                to="/contact"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full sm:w-auto",
                )}
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
