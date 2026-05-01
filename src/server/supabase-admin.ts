// Server-only admin client. NEVER import from client code.
// Uses SUPABASE_SERVICE_ROLE_KEY when present (bypasses RLS).
// Falls back to the publishable key if service-role key is missing so module
// import does not crash; in that case writes will be subject to RLS policies.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url =
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  "https://ltzxgqtougmuvukqrtuz.supabase.co";

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishable =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable__cbDUJYzdCU4NeVCG-lnkw_tId4UueP";

const key = serviceKey || publishable;

if (!serviceKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] SUPABASE_SERVICE_ROLE_KEY is not set — admin client falling back to publishable key. RLS will apply.",
  );
}

export const supabaseAdmin: SupabaseClient = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
