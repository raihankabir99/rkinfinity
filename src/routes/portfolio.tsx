import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell, SectionHeader } from "@/components/PageShell";
import {
  ArrowUpRight,
  Award,
  BriefcaseBusiness,
  Code2,
  ExternalLink,
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
    category: "Web Development",
    description:
      "An e-commerce and business platform covering storefront experiences, content management, product operations, and administration.",
    tags: ["React", "TypeScript", "Supabase"],
    href: "https://github.com/AL-ZOAL/zoal-website",
  },
  {
    title: "Art-to-Product",
    category: "Web Development",
    description:
      "A web project exploring a digital workflow from creative artwork toward product experiences.",
    tags: ["Web Development", "UI/UX", "E-commerce"],
    href: "https://github.com/raihankabir99/art-to-product",
  },
  {
    title: "T-shirt Website",
    category: "E-commerce",
    description:
      "A T-shirt-focused website project with a storefront-oriented user experience.",
    tags: ["Next.js", "E-commerce", "Responsive UI"],
    href: "https://github.com/raihankabir99/tshirtwebsite1v0",
  },
];

const certificateFilters = [
  { id: "all", label: "All Certificates" },
  { id: "it", label: "IT Certificates" },
  { id: "internship", label: "Internship Certificates" },
] as const;

type CertificateFilter = (typeof certificateFilters)[number]["id"];

function Portfolio() {
  const [activeFilter, setActiveFilter] = useState<CertificateFilter>("all");
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
              Explore the work, then browse certificates and verify credentials from
              their original issuer.
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
              className="glass group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 p-6 transition duration-300 hover:-translate-y-1 hover:border-[color:var(--gold)]/40"
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
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                  {project.category}
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
                    className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-white/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--gold)] transition hover:gap-3"
                aria-label={`Explore ${project.title} on GitHub`}
              >
                Explore project <ExternalLink size={15} aria-hidden="true" />
              </a>
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
          sub="Browse credentials by category. Each certificate should link back to its original issuer for verification."
        />

        <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Certificate categories">
          {certificateFilters.map((filter) => {
            const selected = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveFilter(filter.id)}
                className={
                  selected
                    ? "rounded-full border border-[color:var(--gold)] bg-[color:var(--gold)] px-4 py-2.5 text-sm font-bold text-black transition"
                    : "rounded-full border border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/70 transition hover:border-[color:var(--gold)]/50 hover:text-white"
                }
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="glass rounded-3xl border border-white/10 p-7 md:p-10">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/10 text-[color:var(--gold)]">
              {activeFilter === "internship" ? (
                <BriefcaseBusiness size={29} aria-hidden="true" />
              ) : (
                <Award size={29} aria-hidden="true" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-white">
              {activeFilter === "all"
                ? "Your certificates will appear here"
                : activeFilter === "it"
                  ? "IT certificates"
                  : "Internship certificates"}
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65">
              {activeFilter === "all"
                ? "Connect your real certificate links or upload certificate images to build this gallery. No sample credentials are shown as if they were yours."
                : activeFilter === "it"
                  ? "Add your verified IT, programming, web development, AI, and computer science credentials to this category."
                  : "Add your real internship and professional experience certificates to this category."}
            </p>
            <a
              href="https://www.credential.net/profile/raihankabir99/wallet"
              target="_blank"
              rel="noreferrer"
              className="btn-gold btn-pill mt-7 inline-flex items-center gap-2"
            >
              <ShieldCheck size={17} aria-hidden="true" />
              Open Credential Wallet
              <ExternalLink size={15} aria-hidden="true" />
            </a>
            <p className="mt-4 text-xs text-white/45">
              Original source: Credential.net · Open the wallet to view and verify available credentials.
            </p>
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
