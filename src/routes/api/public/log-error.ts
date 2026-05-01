import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ErrSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  path: z.string().trim().max(500).optional(),
  level: z.enum(["error", "warn", "info"]).optional(),
  stack: z.string().max(8000).optional(),
});

async function handlePost(request: Request): Promise<Response> {
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = ErrSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed" }, { status: 400 });
  }
  const e = parsed.data;
  const fullMessage = e.stack ? `${e.message}\n\n${e.stack}` : e.message;
  const { error } = await supabaseAdmin.from("site_errors").insert({
    message: fullMessage.slice(0, 4000),
    path: e.path ?? null,
    level: e.level ?? "error",
  });
  if (error) {
    console.error("site_errors insert failed", error);
    return Response.json({ error: "log failed" }, { status: 500 });
  }
  return Response.json({ ok: true });
}

export const Route = createFileRoute("/api/public/log-error")({
  server: {
    handlers: {
      POST: ({ request }: { request: Request }) => handlePost(request),
    },
  },
} as never);
