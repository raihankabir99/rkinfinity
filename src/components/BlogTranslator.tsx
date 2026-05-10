import { ReactNode, useEffect, useRef, useState } from "react";
import { Globe, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "ar", label: "العربية" },
  { code: "zh-CN", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "ru", label: "Русский" },
];

const STORAGE_KEY = "rk_blog_lang";
const SOURCE_ATTR = "data-original-text";

function detectBrowserLang(): string {
  if (typeof navigator === "undefined") return "en";
  const raw = (navigator.language || "en").toLowerCase();
  if (raw.startsWith("zh")) return "zh-CN";
  const base = raw.split("-")[0];
  if (LANGUAGES.some((l) => l.code === base)) return base;
  if (LANGUAGES.some((l) => l.code === raw)) return raw;
  return "en";
}

async function translateBatch(texts: string[], target: string): Promise<string[]> {
  // Google Translate's free public endpoint — no key required.
  const out: string[] = [];
  for (const text of texts) {
    if (!text.trim()) {
      out.push(text);
      continue;
    }
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
        target,
      )}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const json = await res.json();
      const translated = (json?.[0] as Array<[string]> | undefined)
        ?.map((seg) => seg?.[0] ?? "")
        .join("");
      out.push(translated || text);
    } catch {
      out.push(text);
    }
  }
  return out;
}

function collectTextNodes(root: HTMLElement): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const v = n.nodeValue?.trim();
      if (!v) return NodeFilter.FILTER_REJECT;
      const parent = n.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-no-translate]")) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "CODE" || tag === "PRE")
        return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walker.nextNode())) nodes.push(n as Text);
  return nodes;
}

export function BlogTranslator({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState<string>("en");
  const [ready, setReady] = useState(false);
  const [working, setWorking] = useState(false);
  const initialized = useRef(false);

  // Initial language pick (stored override > browser detect)
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    setLang(stored || detectBrowserLang());
  }, []);

  // Apply translation whenever lang or children change
  useEffect(() => {
    if (!initialized.current) return;
    const root = containerRef.current;
    if (!root) return;

    let cancelled = false;
    const run = async () => {
      setWorking(true);
      // Wait a tick so children are committed
      await new Promise((r) => setTimeout(r, 0));
      const nodes = collectTextNodes(root);

      // Snapshot originals once
      nodes.forEach((node) => {
        const el = node.parentElement;
        if (el && !el.hasAttribute(SOURCE_ATTR)) {
          el.setAttribute(SOURCE_ATTR, node.nodeValue ?? "");
        }
      });

      if (lang === "en" || lang === "auto") {
        // Restore originals
        nodes.forEach((node) => {
          const el = node.parentElement;
          const orig = el?.getAttribute(SOURCE_ATTR);
          if (orig != null) node.nodeValue = orig;
        });
        if (!cancelled) {
          setWorking(false);
          setReady(true);
        }
        return;
      }

      const originals = nodes.map(
        (n) => n.parentElement?.getAttribute(SOURCE_ATTR) ?? n.nodeValue ?? "",
      );
      const translated = await translateBatch(originals, lang);
      if (cancelled) return;
      nodes.forEach((node, i) => {
        node.nodeValue = translated[i] ?? node.nodeValue;
      });
      setWorking(false);
      setReady(true);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [lang, children]);

  const choose = (code: string) => {
    localStorage.setItem(STORAGE_KEY, code);
    setReady(false);
    setLang(code);
  };

  const current = LANGUAGES.find((l) => l.code === lang)?.label ?? "English";

  return (
    <div>
      <div className="flex justify-end mb-4" data-no-translate>
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/40 px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary hover:border-primary/60 transition">
            {working ? (
              <Loader2 size={14} className="animate-spin text-primary" />
            ) : (
              <Globe size={14} className="text-primary" />
            )}
            <span>{current}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
            {LANGUAGES.map((l) => (
              <DropdownMenuItem
                key={l.code}
                onClick={() => choose(l.code)}
                className={lang === l.code ? "text-primary" : ""}
              >
                {l.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative">
        {!ready && (
          <div className="space-y-3 mb-6" data-no-translate>
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        )}
        <div
          id="blog-content"
          ref={containerRef}
          className={`transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
