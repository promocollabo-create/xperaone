import { createClient } from "@/lib/supabase/server";
import CheckoutWizard from "./CheckoutWizard";

export const revalidate = 0;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: paymentSettings } = await supabase.from("payment_settings").select("*").single();
  const { data: siteSettings } = await supabase.from("site_settings").select("currency").single();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let prefillEmail = "";
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("email, full_name, phone").eq("id", user.id).single();
    prefillEmail = profile?.email ?? user.email ?? "";
  }

  return (
    <CheckoutWizard
      paymentSettings={paymentSettings}
      prefillEmail={prefillEmail}
      currency={siteSettings?.currency}
      error={error}
    />
  );
}
