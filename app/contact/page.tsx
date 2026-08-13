import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("*").single();

  return (
    <div className="container section legal-page">
      <h1>Contact Us</h1>
      <p>We're happy to help with orders, licensing, or general questions.</p>
      <ul>
        {settings?.contact_email && <li>Email: {settings.contact_email}</li>}
        {settings?.contact_phone && <li>Phone: {settings.contact_phone}</li>}
        {settings?.whatsapp_number && <li>WhatsApp: {settings.whatsapp_number}</li>}
      </ul>
      <style>{`.legal-page { max-width: 720px; } h1 { font-size: 30px; margin-bottom: 16px; } ul { padding-left: 20px; } li { margin-bottom: 8px; }`}</style>
    </div>
  );
}
