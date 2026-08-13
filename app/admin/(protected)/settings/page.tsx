import { createClient } from "@/lib/supabase/server";
import { updateSiteSettings } from "./actions";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("*").single();

  return (
    <div>
      <h1 className="page-title">Website Settings</h1>

      <form action={updateSiteSettings} className="card settings-form">
        <label>Website Name<input type="text" name="site_name" defaultValue={settings?.site_name ?? ""} /></label>
        <label>Logo URL<input type="url" name="logo_url" defaultValue={settings?.logo_url ?? ""} /></label>
        <label>Favicon URL<input type="url" name="favicon_url" defaultValue={settings?.favicon_url ?? ""} /></label>

        <div className="row">
          <label>Contact Email<input type="email" name="contact_email" defaultValue={settings?.contact_email ?? ""} /></label>
          <label>Contact Phone<input type="text" name="contact_phone" defaultValue={settings?.contact_phone ?? ""} /></label>
        </div>

        <div className="row">
          <label>WhatsApp Number<input type="text" name="whatsapp_number" defaultValue={settings?.whatsapp_number ?? ""} /></label>
          <label>Currency<input type="text" name="currency" defaultValue={settings?.currency ?? "USD"} /></label>
        </div>

        <label>Footer Text<input type="text" name="footer_text" defaultValue={settings?.footer_text ?? ""} /></label>

        <label>SEO Title<input type="text" name="seo_title" defaultValue={settings?.seo_title ?? ""} /></label>
        <label>SEO Description<textarea name="seo_description" rows={3} defaultValue={settings?.seo_description ?? ""} /></label>

        <button type="submit" className="btn btn-primary">Save Settings</button>
      </form>

      <style>{`
        .settings-form { max-width: 620px; padding: 26px; display: flex; flex-direction: column; gap: 16px; }
        .settings-form label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: var(--navy); }
        .settings-form input, .settings-form textarea { font-family: var(--font-body); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 14px; font-weight: 400; }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      `}</style>
    </div>
  );
}
