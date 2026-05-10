import { useState } from "react";
import { NeonButton } from "./ToolHelpers";

// ============ MINIFIER ============
export function MinifierTool() {
  const [input, setInput] = useState("");
  const [type, setType] = useState<"html" | "css" | "js">("html");
  const [out, setOut] = useState("");
  const minify = () => {
    let r = input;
    if (type === "css") {
      r = r
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\s+/g, " ")
        .replace(/\s*([{}:;,])\s*/g, "$1")
        .trim();
    } else if (type === "js") {
      r = r
        .replace(/\/\/[^\n]*/g, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\s+/g, " ")
        .replace(/\s*([{}();,:=<>+\-*/])\s*/g, "$1")
        .trim();
    } else {
      r = r
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/>\s+</g, "><")
        .replace(/\s+/g, " ")
        .trim();
    }
    setOut(r);
  };
  const ratio =
    input.length > 0 ? (((input.length - out.length) / input.length) * 100).toFixed(1) : "0";
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "html" | "css" | "js")}
          className="glass rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="js">JS</option>
        </select>
        <NeonButton onClick={minify} disabled={!input}>
          Minify
        </NeonButton>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
        placeholder="Paste code..."
        className="w-full glass rounded-lg px-3 py-2 text-xs font-mono outline-none"
      />
      {out && (
        <>
          <div className="text-xs text-muted-foreground">
            Saved <span className="text-primary font-bold">{ratio}%</span> · {input.length} →{" "}
            {out.length} chars
          </div>
          <pre className="glass rounded-lg p-3 text-xs font-mono whitespace-pre-wrap break-all max-h-60 overflow-auto">
            {out}
          </pre>
          <button
            onClick={() => navigator.clipboard.writeText(out)}
            className="text-xs text-primary hover:underline"
          >
            Copy
          </button>
        </>
      )}
    </div>
  );
}

// ============ JSON FORMATTER ============
export function JsonTool() {
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");
  const fmt = (indent: number) => {
    try {
      setOut(JSON.stringify(JSON.parse(input), null, indent));
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Invalid JSON");
      setOut("");
    }
  };
  return (
    <div className="space-y-3">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
        placeholder='{"key":"value"}'
        className="w-full glass rounded-lg px-3 py-2 text-xs font-mono outline-none"
      />
      <div className="flex gap-2">
        <NeonButton onClick={() => fmt(2)} disabled={!input}>
          Pretty
        </NeonButton>
        <NeonButton onClick={() => fmt(0)} disabled={!input}>
          Minify
        </NeonButton>
        <NeonButton
          onClick={() => {
            try {
              setOut(JSON.stringify(JSON.parse(input), null, 4));
              setErr("");
            } catch (e) {
              setErr(String(e));
            }
          }}
          disabled={!input}
        >
          4-space
        </NeonButton>
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      {out && (
        <pre className="glass rounded-lg p-3 text-xs font-mono whitespace-pre-wrap max-h-72 overflow-auto">
          {out}
        </pre>
      )}
    </div>
  );
}

// ============ CODE BEAUTIFIER ============
export function BeautifyTool() {
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");
  const beautify = () => {
    let depth = 0,
      r = "";
    const s = input.replace(/\s+/g, " ").replace(/\s*([{};,])\s*/g, "$1");
    for (const ch of s) {
      if (ch === "{") {
        r += " {\n" + "  ".repeat(++depth);
      } else if (ch === "}") {
        depth--;
        r += "\n" + "  ".repeat(depth) + "}\n" + "  ".repeat(depth);
      } else if (ch === ";") {
        r += ";\n" + "  ".repeat(depth);
      } else r += ch;
    }
    setOut(r.replace(/\n\s*\n/g, "\n").trim());
  };
  return (
    <div className="space-y-3">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
        placeholder="Paste minified code..."
        className="w-full glass rounded-lg px-3 py-2 text-xs font-mono outline-none"
      />
      <NeonButton onClick={beautify} disabled={!input}>
        Beautify
      </NeonButton>
      {out && (
        <pre className="glass rounded-lg p-3 text-xs font-mono whitespace-pre-wrap max-h-72 overflow-auto">
          {out}
        </pre>
      )}
    </div>
  );
}

// ============ BASE64 ============
export function Base64Tool() {
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="space-y-3">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={5}
        placeholder="Text..."
        className="w-full glass rounded-lg px-3 py-2 text-sm font-mono outline-none"
      />
      <div className="flex gap-2">
        <NeonButton
          onClick={() => {
            try {
              setOut(btoa(unescape(encodeURIComponent(input))));
              setErr("");
            } catch (e) {
              setErr(String(e));
            }
          }}
          disabled={!input}
        >
          Encode
        </NeonButton>
        <NeonButton
          onClick={() => {
            try {
              setOut(decodeURIComponent(escape(atob(input))));
              setErr("");
            } catch (e) {
              setErr("Invalid Base64");
            }
          }}
          disabled={!input}
        >
          Decode
        </NeonButton>
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      {out && (
        <>
          <pre className="glass rounded-lg p-3 text-xs font-mono whitespace-pre-wrap break-all max-h-60 overflow-auto">
            {out}
          </pre>
          <button
            onClick={() => navigator.clipboard.writeText(out)}
            className="text-xs text-primary hover:underline"
          >
            Copy
          </button>
        </>
      )}
    </div>
  );
}
