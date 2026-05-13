import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [TanStackRouterVite(), react(), tsconfigPaths(), tailwindcss()],
});
