// Server-only admin client. NEVER import from client code.
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars at runtime.
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? "https://ltzxgqtougmuvukqrtuz.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
