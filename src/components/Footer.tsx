import { Link } from "@tanstack/react-router";
import { Linkedin, Facebook, Instagram, Youtube } from "lucide-react";

const facebookUrl = "https://www.facebook.com/profile.php?id=61590233936241";
const linkedinUrl = "https://www.linkedin.com/in/raihan-kabir-ovi99";
const instagramUrl = "https://www.instagram.com/rkinfinity_/";
const tiktokUrl = "https://www.tiktok.com/@rkinfinity_";
const pinterestUrl = "https://www.pinterest.com/rkinfinity_/";
const youtubeUrl = "https://www.youtube.com/@rkinfinity.studio";


const TikTokIcon = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-3.77V2h-3.56v13.08a2.91 2.91 0 1 1-2-2.77v-3.62a6.5 6.5 0 1 0 5.56 6.39V8.74a8.35 8.35 0 0 0 4.88 1.56V6.69h-1.11Z" />
  </svg>
);

const PinterestIcon = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-3.64 19.31c-.05-1.65 0-3.63.41-5.21l1.08-4.57s-.27-.54-.27-1.34c0-1.25.73-2.18 1.64-2.18.77 0 1.14.58 1.14 1.27 0 .77-.49 1.93-.74 3-.21.94.45 1.71 1.38 1.71 1.66 0 2.94-1.75 2.94-4.28 0-2.24-1.61-3.8-3.91-3.8-2.66 0-4.22 2-4.22 4.07 0 .81.31 1.68.7 2.15.08.1.09.19.07.29l-.26 1.05c-.04.17-.14.2-.32.12-1.19-.55-1.93-2.27-1.93-3.66 0-2.98 2.17-5.72 6.26-5.72 3.29 0 5.85 2.35 5.85 5.49 0 3.27-2.06 5.9-4.92 5.9-.96 0-1.86-.5-2.17-1.09l-.59 2.25c-.21.82-.78 1.85-1.16 2.48A10 10 0 1 0 12 2Z" />
  </svg>
);

const socials = [
  { Icon: Facebook, href: facebookUrl, label: "Facebook" },
  { Icon: Linkedin, href: linkedinUrl, label: "LinkedIn" },
  { Icon: Instagram, href: instagramUrl, label: "Instagram" },
  { Icon: TikTokIcon, href: tiktokUrl, label: "TikTok" },
  { Icon: PinterestIcon, href: pinterestUrl, label: "Pinterest" },
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
            <div className="footer-role-text text-sm space-y-1 font-semibold leading-relaxed">
              <p className="text-[#e9e0e0]">
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
