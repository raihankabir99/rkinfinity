import { Link } from "@tanstack/react-router";
import { Linkedin, Mail, Facebook, Github, Instagram } from "lucide-react";
import logo from "@/assets/rkinfinity logo.png";

// Custom TikTok Icon Component
const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.23-8.67" />
    <path d="M15.51 3.09A9 9 0 0 0 9.28 21.91" />
    <path d="M12 12a9 9 0 0 0 5.67-2.33" />
    <path d="M12 12a9 9 0 0 1-2.33-5.67" />
  </svg>
);

const facebookUrl = "https://www.facebook.com/profile.php?id=61590233936241";
const tiktokUrl = "https://www.tiktok.com/@rkinfinity_";
const instagramUrl = "https://www.instagram.com/rkinfinity_/";
const linkedinUrl = "https://www.linkedin.com/in/raihan-kabir-ovi99";
const githubUrl = "https://github.com/raihankabir99";
const emailUrl = "mailto:rkinfinity.official@gmail.com";

const socials = [
  { Icon: Facebook, href: facebookUrl, label: "Facebook" },
  { Icon: Instagram, href: instagramUrl, label: "Instagram" },
  { Icon: TikTokIcon, href: tiktokUrl, label: "TikTok" },
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

const company = [
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Tools", to: "/tools" },
  { label: "Blog", to: "/blog" },
] as const;

export function Footer() {
  return (
    <footer className="bg-background-accent pt-16 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* LOGO & SOCIALS */}
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img src={logo} alt="rkInfinity Logo" className="h-8 w-8" />
              <span className="font-black text-2xl tracking-tight">rkInfinity</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Digital craftsmanship at the intersection of search, code, and story.
            </p>
            <div className="mt-6 flex items-center gap-4">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-muted-foreground hover:text-primary transition h-8 w-8 grid place-items-center"
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
                    className="text-sm text-muted-foreground hover:text-foreground transition"
                  >
                    {s.label}
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
                    className="text-sm text-muted-foreground hover:text-foreground transition"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-primary">
              Get Insights
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Receive the best of rkInfinity, right in your inbox.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="you@domain.com"
                className="flex-grow rounded-l-md bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-3 py-2 rounded-r-md grid place-items-center hover:bg-primary/90 transition"
              >
                <span className="sr-only">Subscribe</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M3.105 3.105a.75.75 0 011.06 0L5.75 4.685a.75.75 0 01-1.06 1.06L3.105 4.165a.75.75 0 010-1.06zm13.79 13.79a.75.75 0 01-1.06 0L14.25 15.315a.75.75 0 111.06-1.06l1.585 1.585a.75.75 0 010 1.06zM9.25 4.75a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5a.75.75 0 01.75-.75zm5.5 5.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5a.75.75 0 01.75-.75zM2 10a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 012 10zm11 0a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Facebook page CTA — kept prominent at the bottom */}
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
        © {new Date().getFullYear()} rkInfinity. All rights reserved.
      </div>
    </footer>
  );
}
