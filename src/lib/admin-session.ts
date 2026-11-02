/**
 * Ask the server to validate the current Supabase access token and admin role.
 * This is a UI gate only; database RLS remains the authorization boundary for data.
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
