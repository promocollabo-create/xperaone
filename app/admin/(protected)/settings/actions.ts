"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSiteSettings(formData: FormData) {
  const supabase = await createClient();

  await supabase
    .from("site_settings")
    .update({
      site_name: String(formData.get("site_name") ?? ""),
      logo_url: String(formData.get("logo_url") ?? "") || null,
      favicon_url: String(formData.get("favicon_url") ?? "") || null,
      contact_email: String(formData.get("contact_email") ?? "") || null,
      contact_phone: String(formData.get("contact_phone") ?? "") || null,
      whatsapp_number: String(formData.get("whatsapp_number") ?? "") || null,
      currency: String(formData.get("currency") ?? "USD"),
      footer_text: String(formData.get("footer_text") ?? "") || null,
      seo_title: String(formData.get("seo_title") ?? "") || null,
      seo_description: String(formData.get("seo_description") ?? "") || null,
    })
    .eq("id", 1);

  // Every page reads site_settings in the root layout, so this refreshes
  // the header/footer/SEO everywhere at once.
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}
