import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/log-error")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { handleLogErrorPost } = await import("@/server/log-error.server");
        return handleLogErrorPost(request);
      },
    },
  },
} as never);
