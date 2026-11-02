import { createClient } from "@supabase/supabase-js";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, private",
      "Vary": "Authorization",
    },
  });
}

export async function onRequestGet(context) {
  const authorization = context.request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return json({ authenticated: false, isAdmin: false }, 401);
  }

  const url = context.env.SUPABASE_URL || context.env.VITE_SUPABASE_URL;
  const publishableKey =
    context.env.SUPABASE_PUBLISHABLE_KEY ||
    context.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    context.env.SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    console.error("Admin session verification requires Supabase URL and publishable key bindings.");
    return json({ authenticated: false, isAdmin: false }, 503);
  }

  const accessToken = match[1];
  const supabase = createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !authData.user) {
      return json({ authenticated: false, isAdmin: false }, 401);
    }

    // The query runs as the verified user, so the user_roles self-read RLS policy applies.
    const { data: role, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", authData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("Admin role lookup failed:", roleError.message);
      return json({ authenticated: true, isAdmin: false }, 503);
    }

    if (!role) {
      return json({ authenticated: true, isAdmin: false }, 403);
    }

    return json({ authenticated: true, isAdmin: true });
  } catch (error) {
    console.error("Admin session verification failed:", error);
    return json({ authenticated: false, isAdmin: false }, 503);
  }
}
