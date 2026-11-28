/**
 * Verify the current Supabase access token and admin role on the server.
 * Database RLS remains the authorization boundary for all data operations.
 */
export async function verifyAdminSession(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch("/api/admin/session", {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}
