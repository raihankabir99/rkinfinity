import { supabaseAdmin } from "./supabase-admin.server";

export type AdminRole = "admin";

export async function requireAdmin(userId: string | null | undefined) {
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) {
    throw new Error("ADMIN_ROLE_CHECK_FAILED");
  }

  if (!data) {
    throw new Error("FORBIDDEN");
  }

  return { userId, role: "admin" as const };
}
