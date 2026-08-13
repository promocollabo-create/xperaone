"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // RLS policy "profiles_update_own_or_admin" ensures this can only ever
  // touch the row where id = auth.uid() for a non-admin caller.
  await supabase
    .from("profiles")
    .update({
      full_name: String(formData.get("full_name") ?? ""),
      phone: String(formData.get("phone") ?? "") || null,
    })
    .eq("id", user.id);

  revalidatePath("/customer/profile");
}
