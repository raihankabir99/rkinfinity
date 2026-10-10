// Server-only Supabase client. NEVER import from client code.
// Requires server environment variables. No hard-coded credentials or fallback keys.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  throw new Error("SUPABASE_URL is required for the server Supabase client.");
}

if (!serviceKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is required for the server Supabase client. Refusing to fall back to a publishable key.",
  );
}

export const supabaseAdmin: SupabaseClient = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
