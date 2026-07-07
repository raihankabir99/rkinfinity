import { Link } from "@tanstack/react-router";
import { Linkedin, Mail, Facebook, PenSquare, Instagram, Music } from "lucide-react";

const facebookUrl = "https://www.facebook.com/profile.php?id=61590233936241";
const linkedinUrl = "https://www.linkedin.com/in/raihan-kabir-ovi99";
const emailUrl = "mailto:rkinfinity.official@gmail.com";
const instagramUrl = "https://www.instagram.com/rkinfinity_/";
const tiktokUrl = "https://www.tiktok.com/@rkinfinity_";

const socials = [
  { Icon: Facebook, href: facebookUrl, label: "Facebook" },
  { Icon: Linkedin, href: linkedinUrl, label: "LinkedIn" },
  { Icon: Instagram, href: instagramUrl, label: "Instagram" },
  { Icon: Music, href: tiktokUrl, label: "TikTok" }, // Using Music icon for TikTok
  { Icon: PenSquare, href: "/blog", label: "Blog" },
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
  { label: "My Story", to: "/about" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
] as const;

export function Footer() {
  return (
    <footer className="bg-background-accent pt-16 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* LOGO & SOCIALS */}
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-[color:var(--gold)]/50 shadow-[0_0_18px_oklch(0.78_0.14_85/0.35)] bg-black/40">
                <img
                  src="/rkinfinity-logo.png"
                  alt="rkInfinity Logo"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <span className="text-2xl font-bold tracking-tighter">
                <span className="text-white">rk</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">
                  Infinity
                </span>
              </span>
            </Link>
            <div className="footer-role-text text-sm space-y-1 font-semibold leading-relaxed">
              <p>
                SEO Specialist <span className="text-primary/50 mx-1.5"> • </span> Digital Solutions
                Architect <span className="text-primary/50 mx-1.5"> • </span> Content
              </p>
              <p>
                Strategist <span className="text-primary/50 mx-1.5"> • </span> AI-Powered Web
                Creator
              </p>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mt-4">
              Crafting digital experiences that scale with precision and creativity.
            </p>
            <div className="mt-6 flex items-center gap-2.5 flex-wrap">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={href}
                  href={href}
                  target={href.startsWith("/") ? "_self" : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-primary hover:text-white transition h-10 w-10 grid place-items-center border border-primary/40 rounded-lg hover:bg-primary/10"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* SERVICES */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-primary">
              Services
            </h4>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s.label}>
                  <Link
                    to={s.to}
                    className="text-sm text-muted-foreground hover:text-white transition"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* TOOLS */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-primary">Tools</h4>
            <ul className="space-y-2.5">
              {tools.map((t) => (
                <li key={t.label}>
                  <Link
                    to={t.to}
                    className="text-sm text-muted-foreground hover:text-white transition"
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-primary">
              Company
            </h4>
            <ul className="space-y-2.5">
              {company.map((c) => (
                <li key={c.label}>
                  <Link
                    to={c.to}
                    className="text-sm text-muted-foreground hover:text-white transition"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Facebook page CTA */}
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 flex justify-center">
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="neon-border inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-[oklch(0.92_0.18_142)]"
        >
          <Facebook size={16} className="fb-neon" />
          Follow my Facebook page for daily stories & creative updates
        </a>
      </div>

      <div className="border-t border-white/5 py-6 text-center text-xs text-muted-foreground">
        © 2026 rkInfinity. All rights reserved.
      </div>
    </footer>
  );
}
