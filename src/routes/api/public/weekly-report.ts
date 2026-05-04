import { createFileRoute } from "@tanstack/react-router";
import { weeklyReportFn } from "@/lib/weekly-report.functions";

async function runFromRequest(request: Request): Promise<Response> {
  const secret = request.headers.get("x-cron-secret") ?? new URL(request.url).searchParams.get("secret");
  const result = await weeklyReportFn({ data: { secret } });
  return Response.json(result.body, { status: result.status });
}

export const Route = createFileRoute("/api/public/weekly-report")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return runFromRequest(request);
      },
      POST: async ({ request }: { request: Request }) => {
        return runFromRequest(request);
      },
    },
  },
} as never);
