#!/usr/bin/env node
// Post-build cleanup for dist/client/wrangler.json
// Cloudflare Pages rejects an empty `triggers: {}` object emitted by the
// TanStack Start Cloudflare preset. We rewrite the file to a valid shape
// instead of deleting it (Cloudflare needs the config to exist).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const target = resolve("dist/client/wrangler.json");

if (!existsSync(target)) {
  console.log("[fix-wrangler] dist/client/wrangler.json not found, skipping.");
  process.exit(0);
}

let cfg;
try {
  cfg = JSON.parse(readFileSync(target, "utf8"));
} catch (err) {
  console.error("[fix-wrangler] Failed to parse wrangler.json:", err);
  process.exit(1);
}

// Remove invalid empty triggers (Cloudflare Pages rejects `triggers: {}`)
if (cfg.triggers && typeof cfg.triggers === "object") {
  const t = cfg.triggers;
  const hasCrons = Array.isArray(t.crons) && t.crons.length > 0;
  if (!hasCrons) {
    delete cfg.triggers;
    console.log("[fix-wrangler] Removed empty `triggers` field.");
  }
}

// Strip other empty objects/arrays that Cloudflare's validator dislikes
for (const key of Object.keys(cfg)) {
  const v = cfg[key];
  if (v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0) {
    delete cfg[key];
    console.log(`[fix-wrangler] Removed empty \`${key}\` field.`);
  }
}

writeFileSync(target, JSON.stringify(cfg, null, 2) + "\n");
console.log("[fix-wrangler] Wrote cleaned wrangler.json");
