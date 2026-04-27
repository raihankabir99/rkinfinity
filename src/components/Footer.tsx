import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Mail, Facebook, ArrowRight } from "lucide-react";
import logo from "@/assets/rkinfinity-logo.png";

const socials = [
  { Icon: Facebook, href: "https://www.facebook.com/Rk.58555", label: "Facebook" },
  { Icon: Linkedin, href: "https://www.linkedin.com/in/raihan-kabir-ovi99", label: "LinkedIn" },
  { Icon: Github, href: "https://github.com/raihankabir99", label: "GitHub" },
  { Icon: Mail, href: "mailto:maskrklo@gmail.com", label: "Email" },
];

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--gold)]/15 mt-32">
      {/* CTA banner */}
      <div className="mx-auto max-w-7xl px-4 pt-16">
        <div className="glass rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight max-w-3xl mx-auto">
              Ready to build something <span className="text-gradient">infinite</span> and outrank your competition?
            </h2>
            <Link to="/contact" className="btn-gold btn-pill mt-8 inline-flex">
              Start the conversation <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 font-bold text-lg">
            <img src={logo} alt="rkInfinity logo" className="h-9 w-9 rounded-full object-cover ring-1 ring-[color:var(--gold)]/50" />
            <span><span className="text-white">rk</span><span className="text-gradient">Infinity</span></span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-md">
            SEO Expert · Digital Marketer · Web Developer · Story Writer. Crafting digital experiences that scale.
          </p>

          {/* Social icons — icon-only, gold glow on hover, open in new tab */}
          <div className="mt-6 flex gap-3">
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

          {/* Facebook follow CTA */}
          <a
            href="https://www.facebook.com/Rk.58555"
            target="_blank"
            rel="noopener noreferrer"
            className="neon-border mt-6 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-[oklch(0.92_0.18_142)]"
          >
            <Facebook size={16} className="fb-neon" />
            Follow my Facebook page for daily stories &amp; creative updates
          </a>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/story" className="hover:text-primary">Story</Link></li>
            <li><Link to="/services" className="hover:text-primary">Services</Link></li>
            <li><Link to="/blog" className="hover:text-primary">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Resources</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/tools" className="hover:text-primary">Tools</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} rkInfinity. All rights reserved.
      </div>
    </footer>
  );
}
