import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// This is the ONLY path through which a purchased file is ever reachable.
// Product.download_url is a path inside the private "downloads" storage
// bucket (see supabase/storage.sql) — never a public URL.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // RLS on `downloads` (customer_id = auth.uid() or is_admin()) means this
  // returns null for a download row that isn't this user's, even if they
  // guessed a valid id — so the 404 below is doing real security work,
  // not just tidy error handling.
  const { data: entitlement } = await supabase
    .from("downloads")
    .select("*, products(download_url)")
    .eq("id", id)
    .single();

  if (!entitlement || !entitlement.products?.download_url) {
    return NextResponse.json({ error: "File not found or not purchased" }, { status: 404 });
  }

  const { data: signed, error } = await supabase.storage
    .from("downloads")
    .createSignedUrl(entitlement.products.download_url, 60); // expires in 60s

  if (error || !signed) {
    return NextResponse.json({ error: "Could not generate download link" }, { status: 500 });
  }

  await supabase
    .from("downloads")
    .update({
      download_count: entitlement.download_count + 1,
      last_downloaded_at: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.redirect(signed.signedUrl);
}
