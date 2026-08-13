"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function customerLogin(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=" + encodeURIComponent(error.message));

  redirect("/customer/dashboard");
}

export async function customerRegister(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }, // handle_new_user() trigger creates the profiles row
  });
  if (error) redirect("/register?error=" + encodeURIComponent(error.message));

  redirect("/login?registered=1");
}

export async function customerLogout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
