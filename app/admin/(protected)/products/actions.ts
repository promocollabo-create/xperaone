"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// RLS still applies here — this runs with the logged-in admin's session,
// not the service role. If profiles.role isn't 'admin' for this user,
// the insert is rejected by the database regardless of what the UI showed.
export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "");
  const price = Number(formData.get("price") ?? 0);
  const comparePrice = formData.get("compare_price") ? Number(formData.get("compare_price")) : null;
  const categoryId = String(formData.get("category_id") ?? "") || null;

  const { error } = await supabase.from("products").insert({
    name,
    slug: slugify(name) + "-" + Math.random().toString(36).slice(2, 6),
    short_description: String(formData.get("short_description") ?? ""),
    description: String(formData.get("description") ?? ""),
    category_id: categoryId,
    price,
    compare_price: comparePrice,
    discount_percent: comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0,
    thumbnail_url: String(formData.get("thumbnail_url") ?? "") || null,
    featured: formData.get("featured") === "on",
    best_seller: formData.get("best_seller") === "on",
    new_arrival: formData.get("new_arrival") === "on",
    flash_deal: formData.get("flash_deal") === "on",
    status: String(formData.get("status") ?? "draft"),
  });

  if (error) {
    redirect(`/admin/products/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/products");
  revalidatePath("/"); // homepage reads products live, so refresh it too
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function toggleProductStatus(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await supabase.from("products").update({ status }).eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/");
}
