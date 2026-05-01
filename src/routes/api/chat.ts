import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { handleChatPost } = await import("@/server/chat.server");
        return handleChatPost(request);
      },
    },
  },
} as never);
