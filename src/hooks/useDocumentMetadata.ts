import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";

interface Metadata {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  keywords?: string;
}

const ROUTE_METADATA: Record<string, Metadata> = {
  "/": {
    title: "rkInfinity - SEO & Digital Solutions",
    description:
      "Crafting digital experiences that scale with precision and creativity. SEO Specialist, Digital Solutions Architect, and AI-Powered Web Creator.",
    keywords:
      "SEO, digital solutions, web design, SEO specialist, digital marketer, AI creator, raihan kabir",
  },
  "/about": {
    title: "About RK — rkInfinity",
    description:
      "Meet RK — SEO strategist, digital marketer, AI-powered web developer, and storyteller turning curiosity into methodical craft.",
    keywords: "raihan kabir ovi, about rk, seo specialist biography, portfolio",
  },
  "/services": {
    title: "Services & Strategy — rkInfinity",
    description:
      "Full-stack SEO services, website audits, search engine marketing, and AI-powered web creation optimized to rank and scale.",
    keywords: "seo services, audit, technical seo, link building, web development, copywriting",
  },
  "/tools": {
    title: "Custom SEO & Digital Tools — rkInfinity",
    description:
      "Explore free custom-built digital tools for keyword analysis, SEO audit, content generation, and code helpers.",
    keywords: "seo tools, keyword tool, web tools, schema markup, crawler, rank tracker",
  },
  "/blog": {
    title: "SEO Insights & Digital Marketing Blog — rkInfinity",
    description:
      "Compounding SEO knowledge, digital marketing guides, technical tutorials, and growth strategies written by RK.",
    keywords: "seo blog, digital marketing articles, tech guides, content strategy",
  },
  "/contact": {
    title: "Contact RK & Start Growing — rkInfinity",
    description:
      "Get in touch for professional SEO consulting, website optimization, or digital marketing solutions. Let's outrank your competition.",
    keywords: "hire seo specialist, contact rk, seo consulting, business inquiry",
  },
  "/story": {
    title: "Creative Stories & Fiction — rkInfinity",
    description:
      "Discover short fiction, personal essays, and creative storytelling from RK. Explore how story is the original algorithm.",
    keywords: "creative writing, fiction, essays, rk infinity stories, ovi",
  },
  "/login": {
    title: "Admin Portal Login — rkInfinity",
    description: "Secure administrator access to the rkInfinity management console.",
    keywords: "admin login, secure log",
  },
  "/admin": {
    title: "Admin Dashboard — rkInfinity",
    description: "Overview of system analytics, chat logs, leads, and website operations.",
    keywords: "dashboard, analytics, admin",
  },
};

const SECTION_METADATA: Record<string, Metadata> = {
  services: {
    title: "Three Crafts, One Vision — rkInfinity",
    description:
      "Search, code, and story — woven into measurable, compounding search engine optimization and digital growth.",
  },
  pillars: {
    title: "Full-Stack SEO Pillars — rkInfinity",
    description:
      "Explore our six core SEO pillars: Keyword Research, Content Strategy, On-Page SEO, Technical Auditing, Link Acquisition, and Analytics.",
  },
  blog: {
    title: "Latest Growth Insights — rkInfinity",
    description:
      "Read our latest articles covering programmatic SEO, conversion optimization, and modern web frameworks.",
  },
  testimonials: {
    title: "Client Testimonials & Trust — rkInfinity",
    description:
      "Read voices of trust from clients and industry experts who have achieved compounding search and digital marketing success with RK.",
  },
  faq: {
    title: "Frequently Asked SEO Questions — rkInfinity",
    description:
      "Quick, transparent answers to questions about search engine rankings, timelines, reporting, and custom web dev.",
  },
  cta: {
    title: "Ready to Scale? Let's Work Together — rkInfinity",
    description:
      "Reach out today to boost your organic traffic, rank higher on Google search results, and establish your digital presence.",
  },
};

function updateMetaTag(attributeName: string, attributeValue: string, contentValue: string) {
  if (typeof window === "undefined") return;
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute("content", contentValue);
}

function updateLinkCanonical(href: string) {
  if (typeof window === "undefined") return;
  let element = document.querySelector(`link[rel="canonical"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

export function useDocumentMetadata() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let path = location.pathname;
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }

    // Default to route metadata
    let meta = ROUTE_METADATA[path] || ROUTE_METADATA["/"];

    // Dynamic section override on home page
    if (path === "/" && activeSection && SECTION_METADATA[activeSection]) {
      const secMeta = SECTION_METADATA[activeSection];
      meta = {
        title: secMeta.title,
        description: secMeta.description,
        keywords: meta.keywords,
      };
    }

    // Apply metadata changes dynamically
    document.title = meta.title;
    updateMetaTag("name", "description", meta.description);
    updateMetaTag("property", "og:title", meta.ogTitle || meta.title);
    updateMetaTag("property", "og:description", meta.ogDescription || meta.description);
    updateMetaTag("property", "twitter:title", meta.ogTitle || meta.title);
    updateMetaTag("property", "twitter:description", meta.ogDescription || meta.description);

    if (meta.keywords) {
      updateMetaTag("name", "keywords", meta.keywords);
    }

    const canonicalUrl = `${window.location.origin}${location.pathname}${activeSection ? `#${activeSection}` : ""}`;
    updateLinkCanonical(canonicalUrl);
  }, [location.pathname, activeSection]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (location.pathname !== "/") {
      setActiveSection(null);
      return;
    }

    const sectionIds = ["services", "pillars", "blog", "testimonials", "faq", "cta"];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.25,
        rootMargin: "-15% 0px -40% 0px",
      },
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [location.pathname]);
}
