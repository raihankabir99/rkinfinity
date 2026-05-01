import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/lead")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { handleLeadPost } = await import("@/server/lead.server");
        return handleLeadPost(request);
      },
      OPTIONS: async () => {
        const { handleLeadOptions } = await import("@/server/lead.server");
        return handleLeadOptions();
      },
    },
  },
} as never);
