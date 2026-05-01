import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/weekly-report")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const { handleWeeklyReport } = await import("@/server/weekly-report.handler");
        return handleWeeklyReport(request);
      },
      POST: async ({ request }: { request: Request }) => {
        const { handleWeeklyReport } = await import("@/server/weekly-report.handler");
        return handleWeeklyReport(request);
      },
    },
  },
} as never);
