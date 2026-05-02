// Server-only admin client. NEVER import from client code.
// Uses SUPABASE_SERVICE_ROLE_KEY when present (bypasses RLS).
// Falls back to the publishable key if service-role key is missing so module
// import does not crash; in that case writes will be subject to RLS policies.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url =
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  "https://xsrlvchbyiupibjirvqo.supabase.co";

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishable =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzcmx2Y2hieWl1cGliamlydnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MzQ0MzcsImV4cCI6MjA5MzMxMDQzN30.lyxcwUwA3VK9n-yJ4fB0L74dwDIIK69pjzx15O-Lkq8";

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
