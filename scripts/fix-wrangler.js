#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const target = resolve("dist/client/wrangler.json");

if (!existsSync(target)) {
  console.log("[fix-wrangler] dist/client/wrangler.json not found, skipping.");
  process.exit(0);
}

try {
  let cfg = JSON.parse(readFileSync(target, "utf8"));

  // Cloudflare Pages-এ যা যা সমস্যা করে সব মুছে ফেলবে নিচের এই কোড
  const fieldsToRemove = [
    "assets", 
    "triggers", 
    "vars", 
    "cloudchamber", 
    "definedEnvironments", 
    "ai_search", 
    "secrets_store_secrets"
  ];

  fieldsToRemove.forEach(field => {
    if (cfg[field]) {
      delete cfg[field];
      console.log(`[fix-wrangler] Removed '${field}' field.`);
    }
  });

  // ফাইলটি আবার সেভ করা হচ্ছে
  writeFileSync(target, JSON.stringify(cfg, null, 2));
  console.log("[fix-wrangler] Final Clean: Wrote cleaned wrangler.json");
} catch (err) {
  console.error("[fix-wrangler] Error:", err);
  process.exit(1);
}
