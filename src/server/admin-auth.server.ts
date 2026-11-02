import { supabaseAdmin } from "@/server/supabase-admin.server";

/**
 * Verify the bearer token with Supabase Auth before trusting its user identity.
 * Never accept a user ID supplied by the browser as proof of authentication.
 */
export async function requireAdmin(accessToken: string | null | undefined) {
  if (!accessToken) {
    throw new Error("UNAUTHORIZED");
  }

  const { data, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
  if (authError || !data.user) {
    throw new Error("UNAUTHORIZED");
  }

  const { data: role, error: roleError } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError) {
    throw new Error("ADMIN_ROLE_CHECK_FAILED");
  }
  if (!role) {
    throw new Error("FORBIDDEN");
  }

  return { userId: data.user.id, role: "admin" as const };
}
