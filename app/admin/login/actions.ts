"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function adminLogin(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect("/admin/login?error=invalid_credentials");
  }

  // Role check happens here AND in middleware.ts AND in every RLS policy —
  // defense in depth. A stolen session cookie still can't act as admin
  // unless profiles.role = 'admin' for that user id.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user!.id)
    .single();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    redirect("/admin/login?error=not_admin");
  }

  redirect("/admin/dashboard");
}
