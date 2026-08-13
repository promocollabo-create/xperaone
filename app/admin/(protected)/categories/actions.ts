"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "");
  await supabase.from("categories").insert({
    name,
    slug: slugify(name),
    icon_url: String(formData.get("icon_url") ?? "") || null,
    display_order: Number(formData.get("display_order") ?? 0),
  });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function toggleCategory(formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("categories")
    .update({ is_active: formData.get("is_active") === "true" })
    .eq("id", String(formData.get("id")));
  revalidatePath("/admin/categories");
  revalidatePath("/");
}
