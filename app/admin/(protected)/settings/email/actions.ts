"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendMail } from "@/lib/email/transporter";

export async function updateEmailSettings(formData: FormData) {
  const supabase = await createClient();

  await supabase
    .from("email_settings")
    .update({
      store_email: String(formData.get("store_email") ?? "") || null,
      admin_notification_email: String(formData.get("admin_notification_email") ?? "") || null,
      sender_name: String(formData.get("sender_name") ?? ""),
      reply_to_email: String(formData.get("reply_to_email") ?? "") || null,
      notify_order_confirmation: formData.get("notify_order_confirmation") === "on",
      notify_payment_pending: formData.get("notify_payment_pending") === "on",
      notify_payment_verified: formData.get("notify_payment_verified") === "on",
      notify_payment_rejected: formData.get("notify_payment_rejected") === "on",
      notify_admin_new_order: formData.get("notify_admin_new_order") === "on",
    })
    .eq("id", 1);

  revalidatePath("/admin/settings/email");
}

export async function sendTestEmail(formData: FormData) {
  const to = String(formData.get("test_email") ?? "");
  if (!to) return { sent: false };
  return sendMail({
    to,
    subject: "XperaOne — Test Email",
    html: "<p>This is a test email from your XperaOne admin panel. If you received this, SMTP is configured correctly.</p>",
  });
}
