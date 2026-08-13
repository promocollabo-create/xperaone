import { createBrowserClient } from "@supabase/ssr";

// Use this client inside "use client" components only.
// It relies on the public anon key, so it is safe to ship to the browser —
// row-level security (see supabase/schema.sql) is what actually enforces
// what this client can read or write.
//
// Note: intentionally untyped (no <Database> generic). The current
// supabase-js query-builder types require a fully-shaped generic schema
// (Relationships/Views/Functions/Enums, not just Row/Insert/Update) to
// type-check `.select()` calls. Once you generate real types with
//   npx supabase gen types typescript --project-id YOUR_PROJECT_REF
// pass that Database type here for full autocomplete + type safety.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
