"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updatePaymentSettings(formData: FormData) {
  const supabase = await createClient();

  await supabase
    .from("payment_settings")
    .update({
      manual_enabled: formData.get("manual_enabled") === "on",
      bank_name: String(formData.get("bank_name") ?? "") || null,
      bank_account_title: String(formData.get("bank_account_title") ?? "") || null,
      bank_account_number: String(formData.get("bank_account_number") ?? "") || null,
      bank_iban: String(formData.get("bank_iban") ?? "") || null,
      jazzcash_number: String(formData.get("jazzcash_number") ?? "") || null,
      jazzcash_account_title: String(formData.get("jazzcash_account_title") ?? "") || null,
      easypaisa_number: String(formData.get("easypaisa_number") ?? "") || null,
      easypaisa_account_title: String(formData.get("easypaisa_account_title") ?? "") || null,
      payment_instructions: String(formData.get("payment_instructions") ?? ""),
      verification_time_note: String(formData.get("verification_time_note") ?? ""),
    })
    .eq("id", 1);

  // Checkout reads this table live, so the very next customer to reach
  // step 3 sees the updated account details — no redeploy needed.
  revalidatePath("/checkout");
  revalidatePath("/admin/settings/payment");
}
