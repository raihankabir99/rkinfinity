import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Lock, Mail, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — rkInfinity" },
      { name: "description", content: "Sign in to your rkInfinity account." },
    ],
  }),
  component: Login,
});

function Login() {
  return (
    <PageShell>
      <section className="mx-auto max-w-md px-4 py-12">
        <div className="glass rounded-3xl p-8 md:p-10 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative">
            <div className="text-center mb-8">
              <div className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-black text-xl mb-4">RK</div>
              <h1 className="text-3xl font-bold">Welcome back</h1>
              <p className="mt-2 text-sm text-muted-foreground">Sign in to your dashboard</p>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="email" required placeholder="you@domain.com"
                  className="w-full bg-background/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition" />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="password" required placeholder="Password"
                  className="w-full bg-background/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" className="accent-primary" /> Remember me
                </label>
                <a href="#" className="text-primary hover:underline">Forgot?</a>
              </div>
              <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3.5 font-semibold text-primary-foreground hover:opacity-90 transition pulse-glow">
                Sign in <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              New here? <Link to="/contact" className="text-primary hover:underline">Get in touch</Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
