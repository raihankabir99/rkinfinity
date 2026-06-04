import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Lock, Mail, ArrowRight, User as UserIcon, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/rkinfinity logo.png";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — rkInfinity" },
      { name: "description", content: "Sign in or create your rkInfinity account." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        if (data.user) {
          toast.success("Account created!", {
            description: `Your UID: ${data.user.id}`,
            duration: 20000,
          });
          // eslint-disable-next-line no-console
          console.log("Your Supabase UID (copy this):", data.user.id);
        } else {
          toast.success("Check your email to confirm your account.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        // eslint-disable-next-line no-console
        if (data.user) console.log("Your Supabase UID:", data.user.id);
        navigate({ to: "/" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-md px-4 py-12">
        <div className="glass rounded-3xl p-8 md:p-10 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center gap-2 mb-4">
                <img
                  src={logo}
                  alt="rkInfinity logo"
                  className="h-14 w-14 rounded-full object-contain ring-1 ring-[color:var(--gold,_oklch(0.78_0.14_85))]/60 shadow-[0_0_22px_oklch(0.78_0.14_85/0.45)]"
                />
                <span className="text-2xl font-extrabold tracking-tight">
                  <span className="text-white">rk</span>
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Infinity
                  </span>
                </span>
              </div>
              <h1 className="text-3xl font-bold">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Sign in to your dashboard"
                  : "Sign up to access the rkInfinity dashboard"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 mb-6 rounded-xl bg-background/40 border border-white/10">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`py-2 rounded-lg text-sm font-medium transition ${mode === "signin" ? "bg-gradient-to-r from-primary to-accent text-primary-foreground" : "text-muted-foreground"}`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`py-2 rounded-lg text-sm font-medium transition ${mode === "signup" ? "bg-gradient-to-r from-primary to-accent text-primary-foreground" : "text-muted-foreground"}`}
              >
                Sign up
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <div className="relative">
                  <UserIcon
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full bg-background/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>
              )}
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full bg-background/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 chars)"
                  className="w-full bg-background/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3.5 font-semibold text-primary-foreground hover:opacity-90 transition pulse-glow disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    {mode === "signin" ? "Sign in" : "Create account"} <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              {mode === "signin" ? (
                <>
                  New here?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-primary hover:underline"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("signin")}
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
            <div className="mt-2 text-center text-xs text-muted-foreground">
              <Link to="/" className="hover:underline">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
