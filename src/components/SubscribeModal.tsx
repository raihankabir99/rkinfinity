import { useEffect, useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";

const FORMSPREE_URL = "https://formspree.io/f/xnjlkajz";

export function SubscribeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, source: "rkInfinity Subscribe" }),
      });
      if (!res.ok) throw new Error("Subscription failed. Please try again.");
      setStatus("success");
      setEmail("");
      setName("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center px-4 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl p-8 shadow-[0_0_50px_oklch(0.78_0.14_85/0.4)]"
        style={{
          background: "#0a0a0a",
          border: "2px solid var(--gold)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-lg hover:bg-white/5 text-muted-foreground"
        >
          <X size={18} />
        </button>

        {status === "success" ? (
          <div className="text-center py-6">
            <CheckCircle2 size={56} className="mx-auto mb-4 text-[color:var(--gold)]" />
            <h3 className="text-2xl font-bold text-white mb-2">You're in! 🎉</h3>
            <p className="text-muted-foreground">
              Thanks for subscribing. A welcome email is on its way to your inbox.
            </p>
            <button type="button" onClick={onClose} className="btn-gold btn-pill mt-6 inline-flex">
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold mb-1">
              <span className="text-white">Join </span>
              <span className="text-gradient">rkInfinity</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Stories, SEO playbooks, and behind-the-scenes — straight to your inbox.
            </p>
            <form onSubmit={submit} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full bg-black border border-[color:var(--gold)]/40 rounded-full px-4 py-3 text-sm outline-none focus:border-[color:var(--gold-bright)] placeholder:text-muted-foreground text-white"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="w-full bg-black border border-[color:var(--gold)]/40 rounded-full px-4 py-3 text-sm outline-none focus:border-[color:var(--gold-bright)] placeholder:text-muted-foreground text-white"
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-gold btn-pill w-full justify-center inline-flex disabled:opacity-60"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Subscribing…
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
