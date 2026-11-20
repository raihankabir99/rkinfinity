import { Link } from "@tanstack/react-router";
import { Linkedin, Facebook, Instagram, Music, Youtube, Pin } from "lucide-react";

const facebookUrl = "https://www.facebook.com/profile.php?id=61590233936241";
const linkedinUrl = "https://www.linkedin.com/in/raihan-kabir-ovi99";
const instagramUrl = "https://www.instagram.com/rkinfinity_/";
const tiktokUrl = "https://www.tiktok.com/@rkinfinity_";
const pinterestUrl = "https://www.pinterest.com/rkinfinity_/";
const youtubeUrl = "https://www.youtube.com/@rkinfinity.studio";

const socials = [
  { Icon: Facebook, href: facebookUrl, label: "Facebook" },
  { Icon: Linkedin, href: linkedinUrl, label: "LinkedIn" },
  { Icon: Instagram, href: instagramUrl, label: "Instagram" },
  { Icon: Music, href: tiktokUrl, label: "TikTok" }, // Using Music icon for TikTok
  { Icon: Pin, href: pinterestUrl, label: "Pinterest" }, // Using Pin icon for Pinterest
  { Icon: Youtube, href: youtubeUrl, label: "YouTube" },
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
  { label: "Journal", to: "/blog" },
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
              <img
                src="/rkinfinity-logo.png"
                alt="rkInfinity Logo"
                className="h-10 w-10 rounded-full object-cover shadow-[0_0_18px_oklch(0.78_0.14_85/0.35)]"
              />
              <span className="text-2xl font-bold tracking-tighter">
                <span className="text-white">rk</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">
                  Infinity
                </span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Digital growth, thoughtful web experiences, and practical technology—made with care.
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

      <div className="mx-auto flex max-w-7xl justify-start px-4 pb-10 pt-12">
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-5 text-sm text-white/60 transition hover:border-[color:var(--gold)]/40 hover:text-white"
        >
          <Facebook size={16} aria-hidden="true" />
          Follow rkInfinity on Facebook
        </a>
      </div>

      <div className="border-t border-white/5 py-6 text-center text-xs text-muted-foreground">
        © 2026 rkInfinity. All rights reserved.
      </div>
    </footer>
  );
}
