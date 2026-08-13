import { createClient } from "@/lib/supabase/server";
import { updateHeroSettings, toggleSection, reorderSection } from "./actions";

export const revalidate = 0;

export default async function AdminHomepagePage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("homepage_settings").select("*").single();
  const { data: sections } = await supabase.from("homepage_sections").select("*").order("display_order");

  return (
    <div>
      <h1 className="page-title">Homepage Builder</h1>
      <p className="page-sub">Changes here update the live homepage immediately — no deploy needed.</p>

      <div className="grid-2">
        <div className="card section-list">
          <h2>Sections</h2>
          <p className="hint">Enable/disable or reorder. Order is the number shown — lower shows first.</p>
          <table>
            <thead><tr><th>Section</th><th>Order</th><th>Visible</th></tr></thead>
            <tbody>
              {(sections ?? []).map((s) => (
                <tr key={s.id}>
                  <td>{s.label}</td>
                  <td>
                    <form action={reorderSection} className="inline-form">
                      <input type="hidden" name="id" value={s.id} />
                      <input type="number" name="display_order" defaultValue={s.display_order} className="order-input" />
                      <button type="submit" className="mini-btn">Save</button>
                    </form>
                  </td>
                  <td>
                    <form action={toggleSection}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="is_enabled" value={(!s.is_enabled).toString()} />
                      <button type="submit" className={`pill-btn ${s.is_enabled ? "published" : ""}`}>
                        {s.is_enabled ? "Enabled" : "Disabled"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={updateHeroSettings} className="card hero-form">
          <h2>Hero & Announcement</h2>

          <label className="checkbox">
            <input type="checkbox" name="announcement_enabled" defaultChecked={settings?.announcement_enabled} />
            Show announcement bar
          </label>
          <label>Announcement text
            <input type="text" name="announcement_text" defaultValue={settings?.announcement_text ?? ""} />
          </label>

          <label>Hero badge
            <input type="text" name="hero_badge" defaultValue={settings?.hero_badge ?? ""} />
          </label>
          <label>Hero heading
            <input type="text" name="hero_heading" defaultValue={settings?.hero_heading ?? ""} />
          </label>
          <label>Hero description
            <textarea name="hero_description" rows={3} defaultValue={settings?.hero_description ?? ""} />
          </label>
          <label>Hero image URL
            <input type="url" name="hero_image_url" defaultValue={settings?.hero_image_url ?? ""} />
          </label>

          <div className="row">
            <label>Primary button text
              <input type="text" name="hero_primary_cta_text" defaultValue={settings?.hero_primary_cta_text ?? ""} />
            </label>
            <label>Primary button link
              <input type="text" name="hero_primary_cta_link" defaultValue={settings?.hero_primary_cta_link ?? ""} />
            </label>
          </div>
          <div className="row">
            <label>Secondary button text
              <input type="text" name="hero_secondary_cta_text" defaultValue={settings?.hero_secondary_cta_text ?? ""} />
            </label>
            <label>Secondary button link
              <input type="text" name="hero_secondary_cta_link" defaultValue={settings?.hero_secondary_cta_link ?? ""} />
            </label>
          </div>

          <button type="submit" className="btn btn-primary">Save Hero Settings</button>
        </form>
      </div>

      <style>{`
        .page-sub { color: var(--text-muted); font-size: 14px; margin: -12px 0 20px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
        .card { padding: 22px 24px; }
        h2 { font-size: 16px; margin-bottom: 12px; }
        .hint { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; padding: 8px 4px; font-size: 11px; color: var(--text-muted); border-bottom: 1px solid var(--border); }
        td { padding: 8px 4px; border-bottom: 1px solid var(--border); }
        .inline-form { display: flex; gap: 6px; }
        .order-input { width: 50px; padding: 4px 6px; border-radius: 6px; border: 1px solid var(--border); }
        .mini-btn { font-size: 11px; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border); background: white; }
        .pill-btn { border: none; font-size: 12px; padding: 4px 10px; border-radius: 999px; background: var(--bg-light); }
        .pill-btn.published { background: #dcfce7; color: #166534; }
        .hero-form { display: flex; flex-direction: column; gap: 14px; }
        .hero-form label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; font-weight: 600; color: var(--navy); }
        .hero-form input, .hero-form textarea { font-family: var(--font-body); padding: 9px 11px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 13px; font-weight: 400; }
        .checkbox { flex-direction: row !important; align-items: center; gap: 8px; }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 1000px) { .grid-2 { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
