import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { useState } from "react";

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
  const [sent, setSent] = useState(false);
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader eyebrow="Contact" title="Let's build something infinite." sub="Tell me about the project. I read every message." />

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[
              { icon: Mail, t: "Email", d: "hello@rkinfinity.com" },
              { icon: MessageCircle, t: "WhatsApp", d: "+1 (555) 010-2025" },
              { icon: MapPin, t: "Based in", d: "Remote · Worldwide" },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="glass rounded-2xl p-6 flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                  <Icon size={20} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{t}</div>
                  <div className="font-semibold">{d}</div>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="lg:col-span-3 glass rounded-3xl p-8 md:p-10 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Name" name="name" placeholder="Your name" />
              <Field label="Email" name="email" type="email" placeholder="you@domain.com" />
            </div>
            <Field label="Subject" name="subject" placeholder="What's this about?" />
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Message</label>
              <textarea required rows={5} placeholder="Tell me everything…"
                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition resize-none" />
            </div>
            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3.5 font-semibold text-primary-foreground hover:opacity-90 transition">
              {sent ? "Sent — talk soon ✨" : <>Send message <Send size={16} /></>}
            </button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}

function Field({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder: string }) {
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">{label}</label>
      <input required name={name} type={type} placeholder={placeholder}
        className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition" />
    </div>
  );
}
