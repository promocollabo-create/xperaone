import { createClient } from "@/lib/supabase/server";
import { updatePaymentSettings } from "./actions";

export const revalidate = 0;

export default async function AdminPaymentSettingsPage() {
  const supabase = await createClient();
  const { data: s } = await supabase.from("payment_settings").select("*").single();

  return (
    <div>
      <h1 className="page-title">Payment Settings</h1>
      <p className="page-sub">These account details are shown to customers during checkout, Step 3.</p>

      <form action={updatePaymentSettings} className="card settings-form">
        <label className="checkbox">
          <input type="checkbox" name="manual_enabled" defaultChecked={s?.manual_enabled} />
          Enable manual payment at checkout
        </label>

        <h3>Bank Transfer</h3>
        <div className="row">
          <label>Bank Name<input type="text" name="bank_name" defaultValue={s?.bank_name ?? ""} /></label>
          <label>Account Title<input type="text" name="bank_account_title" defaultValue={s?.bank_account_title ?? ""} /></label>
        </div>
        <div className="row">
          <label>Account Number<input type="text" name="bank_account_number" defaultValue={s?.bank_account_number ?? ""} /></label>
          <label>IBAN (optional)<input type="text" name="bank_iban" defaultValue={s?.bank_iban ?? ""} /></label>
        </div>

        <h3>JazzCash</h3>
        <div className="row">
          <label>Account Title<input type="text" name="jazzcash_account_title" defaultValue={s?.jazzcash_account_title ?? ""} /></label>
          <label>JazzCash Number<input type="text" name="jazzcash_number" defaultValue={s?.jazzcash_number ?? ""} /></label>
        </div>

        <h3>EasyPaisa</h3>
        <div className="row">
          <label>Account Title<input type="text" name="easypaisa_account_title" defaultValue={s?.easypaisa_account_title ?? ""} /></label>
          <label>EasyPaisa Number<input type="text" name="easypaisa_number" defaultValue={s?.easypaisa_number ?? ""} /></label>
        </div>

        <h3>Messaging</h3>
        <label>Payment Instructions (shown at checkout)
          <textarea name="payment_instructions" rows={2} defaultValue={s?.payment_instructions ?? ""} />
        </label>
        <label>Verification Time Note
          <input type="text" name="verification_time_note" defaultValue={s?.verification_time_note ?? ""} />
        </label>

        <button type="submit" className="btn btn-primary">Save Payment Settings</button>
      </form>

      <style>{`
        .page-sub { color: var(--text-muted); font-size: 14px; margin: -12px 0 20px; }
        .settings-form { max-width: 620px; padding: 26px; display: flex; flex-direction: column; gap: 14px; }
        .settings-form h3 { font-size: 14px; margin: 8px 0 -2px; color: var(--navy); }
        .settings-form label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: var(--navy); }
        .settings-form input, .settings-form textarea { font-family: var(--font-body); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 14px; font-weight: 400; }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .checkbox { flex-direction: row !important; align-items: center; gap: 8px; }
      `}</style>
    </div>
  );
}
