import { Link } from "@tanstack/react-router";
import { Linkedin, Mail, Facebook, ArrowRight, Github } from "lucide-react";
import logo from "@/assets/rkinfinity-logo.png";

const facebookUrl = "https://www.facebook.com/EndlessOcean/";
const linkedinUrl = "https://www.linkedin.com/in/raihan-kabir-ovi99";
const githubUrl = "https://github.com/raihankabir99";
const emailUrl = "mailto:rkinfinity.official@gmail.com";

const socials = [
  { Icon: Facebook, href: facebookUrl, label: "Facebook" },
  { Icon: Linkedin, href: linkedinUrl, label: "LinkedIn" },
  { Icon: Github, href: githubUrl, label: "GitHub" },
  { Icon: Mail, href: emailUrl, label: "Email" },
];

const services = [
  { label: "Keyword Research", to: "/services" },
  { label: "Technical SEO", to: "/services" },
  { label: "Link Building", to: "/services" },
  { label: "Content Strategy", to: "/services" },
  { label: "On-Page SEO", to: "/services" },
  { label: "SEO Audits", to: "/services" },
] as const;

const tools = [
  { label: "Page Speed", to: "/tools" },
  { label: "Meta Tags", to: "/tools" },
  { label: "Keywords", to: "/tools" },
  { label: "Minifiers", to: "/tools" },
  { label: "ROI Calculator", to: "/tools" },
  { label: "All Tools", to: "/tools" },
] as const;

const company = [
  { label: "About", to: "/about" },
  { label: "My Story", to: "/story" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--gold)]/15 mt-32">
      {/* CTA banner */}
      <div className="mx-auto max-w-7xl px-4 pt-16">
        <div className="glass rounded-3xl p-10 md:p-14 text-center relative overflow-hidden bg-black">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight max-w-3xl mx-auto text-white">
              Ready to <span className="text-gradient">outrank</span> your competition?
            </h2>
            <p className="mt-4 text-base md:text-lg text-white/75 max-w-2xl mx-auto">
              Let's work together to boost your search rankings and drive organic growth.
            </p>
            <Link to="/contact" className="btn-gold btn-pill mt-8 inline-flex">
              Get Started <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)] lg:items-start">
        <div className="max-w-md">
          <div className="flex items-center gap-2.5 font-bold text-lg">
            <img
              src={logo}
              alt="rkInfinity logo"
              className="h-9 w-9 rounded-full object-cover ring-1 ring-[color:var(--gold)]/50"
            />
            <span>
              <span className="text-white">rk</span>
              <span className="text-gradient">Infinity</span>
            </span>
          </div>
          <p className="mt-4 text-sm font-medium text-foreground/80 leading-relaxed">
            {[
              "SEO Specialist",
              "Digital Solutions Architect",
              "Content Strategist",
              "AI-Powered Web Creator",
            ].map((title, idx, arr) => (
              <span key={title}>
                <span>{title}</span>
                {idx < arr.length - 1 && (
                  <span className="mx-2 text-[color:var(--gold)]" aria-hidden="true">
                    ·
                  </span>
                )}
              </span>
            ))}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Crafting digital experiences that scale with precision and creativity.
          </p>
          <div className="mt-5 flex gap-3">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="social-icon"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-10 sm:grid-cols-3 lg:justify-items-end">
          <div className="w-full sm:max-w-[11rem]">
            <h4 className="text-sm font-semibold mb-4 text-[color:var(--gold)] uppercase tracking-wider">
              Services
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {services.map((s) => (
                <li key={s.label}>
                  <Link to={s.to} className="hover:text-[color:var(--gold)] transition-colors">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full sm:max-w-[11rem]">
            <h4 className="text-sm font-semibold mb-4 text-[color:var(--gold)] uppercase tracking-wider">
              Tools
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {tools.map((t) => (
                <li key={t.label}>
                  <Link to={t.to} className="hover:text-[color:var(--gold)] transition-colors">
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full sm:max-w-[11rem]">
            <h4 className="text-sm font-semibold mb-4 text-[color:var(--gold)] uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {company.map((c) => (
                <li key={c.label}>
                  <Link to={c.to} className="hover:text-[color:var(--gold)] transition-colors">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Facebook page CTA — kept prominent at the bottom */}
      <div className="mx-auto max-w-7xl px-4 pb-10 flex justify-center">
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="neon-border inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-[oklch(0.92_0.18_142)]"
        >
          <Facebook size={16} className="fb-neon" />
          Follow my Facebook page for daily stories &amp; creative updates
        </a>
      </div>

      <div className="border-t border-white/5 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} rkInfinity. All rights reserved.
      </div>
    </footer>
  );
}
