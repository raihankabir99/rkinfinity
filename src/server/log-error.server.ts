import { supabaseAdmin } from "@/server/supabase-admin.server";

export interface LogErrorInput {
  message: string;
  path?: string;
  level?: "error" | "warn" | "info";
  stack?: string;
}

export async function logError(data: LogErrorInput) {
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
}
