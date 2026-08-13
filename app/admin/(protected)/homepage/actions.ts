"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateHeroSettings(formData: FormData) {
  const supabase = await createClient();

  await supabase
    .from("homepage_settings")
    .update({
      announcement_enabled: formData.get("announcement_enabled") === "on",
      announcement_text: String(formData.get("announcement_text") ?? ""),
      hero_badge: String(formData.get("hero_badge") ?? ""),
      hero_heading: String(formData.get("hero_heading") ?? ""),
      hero_description: String(formData.get("hero_description") ?? ""),
      hero_image_url: String(formData.get("hero_image_url") ?? "") || null,
      hero_primary_cta_text: String(formData.get("hero_primary_cta_text") ?? ""),
      hero_primary_cta_link: String(formData.get("hero_primary_cta_link") ?? ""),
      hero_secondary_cta_text: String(formData.get("hero_secondary_cta_text") ?? ""),
      hero_secondary_cta_link: String(formData.get("hero_secondary_cta_link") ?? ""),
    })
    .eq("id", 1);

  // This is the piece that makes requirement #37 real: the instant the
  // admin saves, we invalidate the homepage's cached render so the very
  // next visitor request re-reads these rows from Supabase.
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function toggleSection(formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("homepage_sections")
    .update({ is_enabled: formData.get("is_enabled") === "true" })
    .eq("id", String(formData.get("id")));
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function reorderSection(formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("homepage_sections")
    .update({ display_order: Number(formData.get("display_order")) })
    .eq("id", String(formData.get("id")));
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}
