import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/server/supabase-admin";

const ErrSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  path: z.string().trim().max(500).optional(),
  level: z.enum(["error", "warn", "info"]).optional(),
  stack: z.string().max(8000).optional(),
});

export const logErrorFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ErrSchema.parse(input))
  .handler(async ({ data }) => {
    const fullMessage = data.stack ? `${data.message}\n\n${data.stack}` : data.message;
    const { error } = await supabaseAdmin.from("site_errors").insert({
      message: fullMessage.slice(0, 4000),
      path: data.path ?? null,
      level: data.level ?? "error",
    });
    if (error) {
      console.error("site_errors insert failed", error);
      return { ok: false as const, error: "log failed" };
    }
    return { ok: true as const };
  });
