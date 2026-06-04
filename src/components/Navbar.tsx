import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { SubscribeModal } from "./SubscribeModal";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/story", label: "Story" },
  { to: "/services", label: "Services" },
  { to: "/tools", label: "Tools" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [subOpen, setSubOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "py-2" : "py-4"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4">
          <nav className="glass flex items-center justify-between rounded-2xl px-4 py-3 md:px-6">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
              <img
                src="/assets/rkinfinity-logo.png"
                alt="rkInfinity logo"
                className="h-10 w-10 rounded-full object-cover ring-1 ring-[color:var(--gold)]/50 shadow-[0_0_18px_oklch(0.78_0.14_85/0.35)]"
              />
              <span className="hidden sm:inline">
                <span className="text-white">rk</span>
                <span className="text-gradient">Infinity</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1.5">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="nav-pill"
                  activeProps={{ className: "nav-pill nav-pill-active" }}
                  activeOptions={{ exact: l.to === "/" }}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* This button is now hidden on screens smaller than 'lg' (tablets/mobiles) */}
              <button
                type="button"
                onClick={() => setSubOpen(true)}
                className="btn-gold btn-pill max-lg:hidden !py-2 !px-5 text-sm pulse-glow"
              >
                Subscribe
              </button>
              {/* This is the hamburger menu button, visible only on smaller screens */}
              <button
                onClick={() => setOpen(!open)}
                className="lg:hidden p-2 text-foreground"
                aria-label="Toggle menu"
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </nav>

          {/* This is the mobile menu content */}
          {open && (
            <div className="glass mt-2 rounded-2xl p-3 lg:hidden animate-fade-in">
              <div className="flex flex-col gap-1.5">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="nav-pill !justify-start"
                    activeProps={{ className: "nav-pill nav-pill-active !justify-start" }}
                    activeOptions={{ exact: l.to === "/" }}
                  >
                    {l.label}
                  </Link>
                ))}
                {/* This is the Subscribe button inside the mobile menu */}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setSubOpen(true);
                  }}
                  className="btn-gold btn-pill mt-2 text-sm"
                >
                  Subscribe
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      <SubscribeModal open={subOpen} onClose={() => setSubOpen(false)} />
    </>
  );
}
