import { defineConfig } from "vite";

export default defineConfig(async () => {
  const tanstackConfig = await import("@lovable.dev/vite-tanstack-config").then(
    (m) => m.default
  );
  return tanstackConfig();
});
