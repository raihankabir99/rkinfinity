import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { Mail, MapPin, MessageCircle, Send, Loader2, CheckCircle2, CalendarDays, ExternalLink, Github, Linkedin, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const FORMSPREE_URL = "https://formspree.io/f/xnjlkajz";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — rkInfinity" },
      { name: "description", content: "Start a conversation with RK." },
      { property: "og:title", content: "Contact rkInfinity" },
      { property: "og:description", content: "Let's build something infinite, together." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          _replyto: form.email,
          _subject: form.subject
            ? `[rkInfinity Contact] ${form.subject}`
            : "[rkInfinity Contact] New message",
          message: form.message,
          source: "rkInfinity Contact Form",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error ?? "Submission failed. Please try again.");
      }

      setSent(true);
      toast.success("Message sent — RK will be in touch soon!");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader
          eyebrow="Contact"
          title="Let's build something infinite."
          sub="Tell me about the project. I read every message."
        />

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[{ icon: Mail, t: "Email", d: "rkinfinity.official@gmail.com" }].map(
              ({ icon: Icon, t, d }) => (
                <div key={t} className="glass rounded-2xl p-6 flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {t}
                    </div>
                    <div className="font-semibold">{d}</div>
                  </div>
                </div>
              ),
            )}

            <a
              href="https://wa.me/966540742748"
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-2xl p-6 flex items-center gap-4 hover:border-[color:var(--gold)]/60 hover:shadow-[0_0_24px_oklch(0.85_0.2_142/0.25)] transition group"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[oklch(0.85_0.2_142/0.25)] to-[oklch(0.78_0.14_85/0.2)] text-[color:var(--neon)] group-hover:scale-110 transition">
                <MessageCircle size={22} />
              </div>
              <div className="font-semibold">Chat on WhatsApp</div>
            </a>

            {[{ icon: MapPin, t: "Based in", d: "Remote · Worldwide" }].map(
              ({ icon: Icon, t, d }) => (
                <div key={t} className="glass rounded-2xl p-6 flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {t}
                    </div>
                    <div className="font-semibold">{d}</div>
                  </div>
                </div>
              ),
            )}
          </div>

          {sent ? (
            <div className="lg:col-span-3 glass rounded-3xl p-8 md:p-10 flex flex-col items-center justify-center text-center gap-4 min-h-[340px]">
              <CheckCircle2 size={56} className="text-[color:var(--gold)]" />
              <h3 className="text-2xl font-bold">Message sent!</h3>
              <p className="text-muted-foreground max-w-xs">
                Thanks for reaching out. RK will reply to{" "}
                <span className="text-foreground font-medium">{form.email || "your email"}</span>{" "}
                soon.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="btn-gold btn-pill mt-2 inline-flex"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              id="contact-form"
              onSubmit={submit}
              className="lg:col-span-3 glass rounded-3xl p-8 md:p-10 space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <Field
                  label="Name"
                  name="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={update("name")}
                />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="you@domain.com"
                  value={form.email}
                  onChange={update("email")}
                />
              </div>
              <Field
                label="Subject"
                name="subject"
                placeholder="What's this about?"
                value={form.subject}
                onChange={update("subject")}
                required={false}
              />
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell me everything…"
                  value={form.message}
                  onChange={update("message")}
                  maxLength={4000}
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3.5 font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    Send message <Send size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Personal profile card — directly above the Contact page footer */}
      <ProfileCard />
    </PageShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </label>
      <input
        required={required}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={type === "email" ? 255 : 200}
        className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
      />
    </div>
  );
}

function ProfileCard() {
  const [contactOpen, setContactOpen] = useState(false);
  const profileUrl = "https://gravatar.com/genuinebeard10e7e84f4?utm_source=profile-card";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 pt-2" aria-label="Personal profile">
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-[color:var(--gold)]/25 bg-card/70 shadow-xl backdrop-blur-xl">
        <div className="h-1 bg-gradient-to-r from-transparent via-[color:var(--gold)] to-transparent" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" aria-label="Open Gravatar profile">
              <img src="https://2.gravatar.com/avatar/ade85d17ad7bbf431ae698eb862fe5a1ec94fe63ba60b5c4ca9c32ecc7745fa2?s=256&d=initials" alt="Raihan Kabir" loading="lazy" className="h-24 w-24 rounded-2xl border border-[color:var(--gold)]/50 object-cover shadow-lg" />
            </a>
            <div className="min-w-0 flex-1">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.24em] text-primary">Independent creator</p>
              <h3 className="text-2xl font-bold sm:text-3xl">Raihan Kabir</h3>
              <p className="mt-1 text-sm text-muted-foreground">AI Web Developer &amp; Digital Marketer · Self-Employed</p>
              <p className="mt-1 text-xs text-muted-foreground">Chattogram, Bangladesh</p>
            </div>
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="hidden items-center gap-2 rounded-full border border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary sm:inline-flex">Gravatar <ExternalLink size={13} /></a>
          </div>
          <p className="mt-6 text-sm leading-7 text-muted-foreground">Passionate web developer, digital marketing enthusiast, and tech explorer. Building modern web applications, learning SEO and computer science, and turning ideas into useful projects every day.</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" aria-label="Gravatar" className="grid h-10 w-10 place-items-center rounded-xl border border-border text-muted-foreground transition hover:border-primary/50 hover:text-primary"><img src="https://s.gravatar.com/icons/gravatar.svg" alt="" className="h-5 w-5" loading="lazy" /></a>
            <a href="https://www.linkedin.com/in/raihan-kabir-ovi99/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="grid h-10 w-10 place-items-center rounded-xl border border-border text-muted-foreground transition hover:border-primary/50 hover:text-primary"><Linkedin size={18} /></a>
            <a href="https://github.com/raihankabir99" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="grid h-10 w-10 place-items-center rounded-xl border border-border text-muted-foreground transition hover:border-primary/50 hover:text-primary"><Github size={18} /></a>
            <button type="button" onClick={() => setContactOpen((open) => !open)} aria-expanded={contactOpen} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">{contactOpen ? <X size={16} /> : <Mail size={16} />}{contactOpen ? "Close contact" : "Contact"}</button>
          </div>
          {contactOpen && <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
            <a href="https://calendar.app.google/yvBi41w8GXyym3ph8" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-border p-4 transition hover:border-primary/50"><CalendarDays size={20} className="shrink-0 text-primary" /><span className="min-w-0"><span className="block text-sm font-semibold">Book a time</span><span className="block break-all text-xs text-muted-foreground">Google Calendar appointment</span></span><ExternalLink size={13} className="ml-auto shrink-0" /></a>
            <a href="https://rkinfinity.pages.dev/contact" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-border p-4 transition hover:border-primary/50"><Mail size={20} className="shrink-0 text-primary" /><span className="min-w-0"><span className="block text-sm font-semibold">Contact form</span><span className="block break-all text-xs text-muted-foreground">Send a message via rkInfinity</span></span><ExternalLink size={13} className="ml-auto shrink-0" /></a>
          </div>}
        </div>
      </div>
    </section>
  );
}
