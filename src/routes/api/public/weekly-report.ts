import { createFileRoute } from "@tanstack/react-router";

const helperPath = "@/server/weekly-report.server";

export const Route = createFileRoute("/api/public/weekly-report")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const mod = await import(/* @vite-ignore */ helperPath);
        return mod.handleWeeklyReport(request);
      },
      POST: async ({ request }: { request: Request }) => {
        const mod = await import(/* @vite-ignore */ helperPath);
        return mod.handleWeeklyReport(request);
      },
    },
  },
} as never);
