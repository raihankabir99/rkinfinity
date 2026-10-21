import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageShell, SectionHeader } from "@/components/PageShell";
import {
  ArrowUpRight,
  Award,
  BriefcaseBusiness,
  Code2,
  ExternalLink,
  Github,
  FolderKanban,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio & Certificates — rkInfinity" },
      {
        name: "description",
        content:
          "Explore RK's selected digital projects, development work, and professional certificates.",
      },
      { property: "og:title", content: "Portfolio & Certificates — rkInfinity" },
      {
        property: "og:description",
        content: "Selected projects, skills, and verified learning achievements.",
      },
    ],
  }),
  component: Portfolio,
});

const projectItems = [
  {
    title: "ZOAL Enterprise Platform",
    description:
      "An e-commerce and business platform covering storefront experiences, content management, product operations, and administration.",
    tags: ["React", "TypeScript", "Supabase"],
    href: "https://github.com/AL-ZOAL/zoal-website",
    demo: "",
  },
  {
    title: "Art-to-Product",
    description:
      "A web project exploring a digital workflow from creative artwork toward product experiences.",
    tags: ["Web Development", "UI/UX", "E-commerce"],
    href: "https://github.com/raihankabir99/art-to-product",
    demo: "",
  },
  {
    title: "T-shirt Website",
    description:
      "A T-shirt-focused website project with a storefront-oriented user experience.",
    tags: ["Next.js", "E-commerce", "Responsive UI"],
    href: "https://github.com/raihankabir99/tshirtwebsite1v0",
    demo: "",
  },
];

function Portfolio() {
  const visibleProjects = useMemo(() => projectItems, []);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-12 md:pt-16">
        <div className="relative overflow-hidden rounded-3xl border border-[color:var(--gold)]/30 bg-black/50 px-6 py-12 md:px-12 md:py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(ellipse at 85% 10%, oklch(0.78 0.14 85 / 0.17), transparent 48%)",
            }}
          />
          <div className="relative max-w-3xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-[color:var(--gold)]">
              Selected work & achievements
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              My <span className="text-gradient">Portfolio.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
              A collection of projects, practical skills, and learning milestones.
              Explore the work, then view verified credentials from their original issuer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#projects" className="btn-gold btn-pill inline-flex items-center gap-2">
                Explore Projects <ArrowUpRight size={17} aria-hidden="true" />
              </a>
              <a
                href="#certificates"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-[color:var(--gold)]/60 hover:text-[color:var(--gold)]"
              >
                <Award size={17} aria-hidden="true" /> View Certificates
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-12 md:py-16">
        <SectionHeader
          eyebrow="Projects"
          title="Work built with purpose."
          sub="Selected web and digital projects. Open a project repository to explore its source."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project, index) => (
            <article
              key={project.title}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-sky-200/15 bg-gradient-to-br from-sky-100/[0.10] via-blue-200/[0.06] to-indigo-300/[0.10] p-6 shadow-[0_12px_40px_rgba(30,64,175,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[color:var(--gold)]/55 hover:shadow-[0_18px_50px_rgba(30,64,175,0.16)]"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/10 text-[color:var(--gold)]">
                  {index === 0 ? (
                    <FolderKanban size={23} aria-hidden="true" />
                  ) : index === 1 ? (
                    <Code2 size={23} aria-hidden="true" />
                  ) : (
                    <BriefcaseBusiness size={23} aria-hidden="true" />
                  )}
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-100/65">
                  Project {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">{project.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-white/65">
                {project.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-sky-100/15 bg-sky-100/[0.06] px-3 py-1.5 text-xs text-sky-50/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="relative mt-7 flex items-center justify-between gap-3 border-t border-sky-100/15 pt-5">
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-sky-100/20 bg-sky-100/[0.07] text-white transition hover:border-[color:var(--gold)]/60 hover:bg-sky-100/[0.12] hover:text-[color:var(--gold)]"
                  aria-label={"View " + project.title + " source on GitHub"}
                  title="View source on GitHub"
                >
                  <Github size={20} aria-hidden="true" />
                </a>
                {project.demo ? (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] px-4 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
                  >
                    View Site <ExternalLink size={15} aria-hidden="true" />
                  </a>
                ) : (
                  <span
                    className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-white/35"
                    aria-label="Live demo link not configured"
                    title="Live demo link not configured"
                  >
                    View Site <ExternalLink size={15} aria-hidden="true" />
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="certificates"
        className="mx-auto max-w-7xl scroll-mt-28 px-4 py-12 md:py-16"
      >
        <SectionHeader
          eyebrow="Credentials"
          title="Certificates & learning."
          sub="View my certificates and digital badges through my Credential.net wallet."
        />

        <div className="glass rounded-3xl border border-white/10 p-7 md:p-10">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/10 text-[color:var(--gold)]">
              <ShieldCheck size={29} aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold text-white">My Credential Wallet</h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65">
              Explore my available certificates, digital badges, and credential verification details on Credential.net.
            </p>
            <a
              href="https://www.credential.net/profile/raihankabir99/wallet"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold btn-pill mt-7 inline-flex items-center gap-2"
              aria-label="Open Raihan Kabir's Credential.net wallet in a new tab"
            >
              View My Credential.net Wallet
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 pt-8">
        <div className="rounded-3xl border border-[color:var(--gold)]/25 bg-black/40 p-8 text-center md:p-12">
          <h2 className="text-2xl font-black text-white md:text-3xl">
            Have a project in mind?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/65">
            Explore the services page or get in touch to discuss your next digital project.
          </p>
          <a href="/contact" className="btn-gold btn-pill mt-6 inline-flex items-center gap-2">
            Contact me <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>
    </PageShell>
  );
}
