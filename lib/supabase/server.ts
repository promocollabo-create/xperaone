import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options?: CookieOptionsWithName };

// Use this inside Server Components, Server Actions, and Route Handlers.
// It reads/writes the auth cookie so the user's session (and therefore
// their RLS identity) is available on the server.
//
// Note: intentionally untyped (no <Database> generic) — see the comment
// in lib/supabase/client.ts for why, and how to add real typing later.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component (no response to write to).
            // Safe to ignore as long as middleware.ts is refreshing sessions.
          }
        },
      },
    }
  );
}

// Admin-only client that bypasses RLS using the service role key.
// NEVER import this into anything that runs in the browser.
// Only ever call this from app/api/** route handlers, and only after you
// have independently verified (via createClient() above) that the caller
// is authenticated AND has role = 'admin' in profiles.
export async function createAdminClient() {
  const { createClient: createRawClient } = await import("@supabase/supabase-js");
  return createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
