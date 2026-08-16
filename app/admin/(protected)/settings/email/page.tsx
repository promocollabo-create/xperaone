import { createClient } from "@/lib/supabase/server";
import { updateEmailSettings } from "./actions";
import TestEmailButton from "./TestEmailButton";

export const revalidate = 0;

export default async function AdminEmailSettingsPage() {
  const supabase = await createClient();
  const { data: s } = await supabase.from("email_settings").select("*").single();
  const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

  return (
    <div>
      <h1 className="page-title">Email Settings</h1>

      <div className={`card smtp-status ${smtpConfigured ? "ok" : "warn"}`}>
        {smtpConfigured
          ? "✓ SMTP is configured on the server (sending from your business email)."
          : "⚠ SMTP is not configured yet. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS to your hosting environment variables (your business email's mail settings) for emails to actually send."}
      </div>

      <form action={updateEmailSettings} className="card settings-form">
        <div className="row">
          <label>Store Email<input type="email" name="store_email" defaultValue={s?.store_email ?? ""} /></label>
          <label>Admin Notification Email<input type="email" name="admin_notification_email" defaultValue={s?.admin_notification_email ?? ""} /></label>
        </div>
        <div className="row">
          <label>Sender Name<input type="text" name="sender_name" defaultValue={s?.sender_name ?? "XperaOne"} /></label>
          <label>Reply-To Email<input type="email" name="reply_to_email" defaultValue={s?.reply_to_email ?? ""} /></label>
        </div>

        <h3>Notifications</h3>
        <label className="checkbox"><input type="checkbox" name="notify_order_confirmation" defaultChecked={s?.notify_order_confirmation} /> Order confirmation</label>
        <label className="checkbox"><input type="checkbox" name="notify_payment_pending" defaultChecked={s?.notify_payment_pending} /> Payment pending</label>
        <label className="checkbox"><input type="checkbox" name="notify_payment_verified" defaultChecked={s?.notify_payment_verified} /> Payment verified</label>
        <label className="checkbox"><input type="checkbox" name="notify_payment_rejected" defaultChecked={s?.notify_payment_rejected} /> Payment rejected</label>
        <label className="checkbox"><input type="checkbox" name="notify_admin_new_order" defaultChecked={s?.notify_admin_new_order} /> New order (to admin)</label>

        <button type="submit" className="btn btn-primary">Save Email Settings</button>
      </form>

      <TestEmailButton />

      <style>{`
        .smtp-status { padding: 14px 18px; font-size: 13px; margin-bottom: 16px; }
        .smtp-status.ok { background: #dcfce7; color: #166534; }
        .smtp-status.warn { background: #fef9c3; color: #854d0e; }
        .settings-form { max-width: 560px; padding: 26px; display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }
        .settings-form h3 { font-size: 14px; margin: 8px 0 -2px; color: var(--navy); }
        .settings-form label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: var(--navy); }
        .settings-form input { font-family: var(--font-body); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 14px; font-weight: 400; }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .checkbox { flex-direction: row !important; align-items: center; gap: 8px; }
      `}</style>
    </div>
  );
}
