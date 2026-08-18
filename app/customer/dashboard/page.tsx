import { createClient } from "@/lib/supabase/server";
import { customerLogout } from "@/app/login/actions";

export const revalidate = 0;

export default async function CustomerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // RLS on `orders` (customer_id = auth.uid() or is_admin()) means this
  // query can only ever return this customer's own orders — even if the
  // query itself had no .eq("customer_id", ...) filter, the database
  // would still refuse to return anyone else's rows.
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: downloads } = await supabase
    .from("downloads")
    .select("*, products(name, thumbnail_url)");

  const completedCount = (orders ?? []).filter((o) => o.status === "completed").length;
  const pendingCount = (orders ?? []).filter((o) => o.status === "pending").length;
  const verificationCount = (orders ?? []).filter((o) => o.payment_status === "verification_pending").length;

  return (
    <div className="container section customer-dashboard">
      <div className="dash-header">
        <div>
          <h1>My Dashboard</h1>
          <p>{user?.email}</p>
        </div>
        <form action={customerLogout}>
          <button type="submit" className="btn btn-secondary">Log out</button>
        </form>
      </div>

      <div className="dash-cards">
        <div className="card stat"><span className="value">{orders?.length ?? 0}</span><span className="label">Total Orders</span></div>
        <div className="card stat"><span className="value">{pendingCount}</span><span className="label">Pending</span></div>
        <div className="card stat"><span className="value">{verificationCount}</span><span className="label">Payment Verification</span></div>
        <div className="card stat"><span className="value">{completedCount}</span><span className="label">Completed</span></div>
        <div className="card stat"><span className="value">{downloads?.length ?? 0}</span><span className="label">Downloads</span></div>
      </div>

      <div className="card orders-panel">
        <h2>My Orders</h2>
        <table>
          <thead><tr><th>Order</th><th>Date</th><th>Total</th><th>Payment</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id}>
                <td>{o.order_number}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>${Number(o.total).toFixed(2)}</td>
                <td><span className={`pill ${o.payment_status}`}>{o.payment_status}</span></td>
                <td><span className="pill">{o.status}</span></td>
                <td><a href={`/order/${o.id}`} className="view-link">View →</a></td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && <tr><td colSpan={6}>No orders yet — browse the shop to get started.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card downloads-panel">
        <h2>My Downloads</h2>
        {(downloads ?? []).length === 0 && <p>Purchased digital files will appear here.</p>}
        <div className="downloads-grid">
          {(downloads ?? []).map((d) => (
            <div key={d.id} className="download-item">
              <span>{d.products?.name}</span>
              <a href={`/api/downloads/${d.id}`} className="btn btn-primary btn-sm">Download</a>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .dash-header h1 { font-size: 26px; }
        .dash-header p { font-size: 13px; }
        .dash-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px; }
        @media (max-width: 720px) { .dash-cards { grid-template-columns: repeat(2, 1fr); } }
        .stat { padding: 20px; text-align: center; }
        .stat .value { display: block; font-family: var(--font-mono); font-size: 26px; font-weight: 500; color: var(--navy); }
        .stat .label { font-size: 12px; color: var(--text-muted); }
        .orders-panel, .downloads-panel { padding: 22px 24px; margin-bottom: 20px; }
        h2 { font-size: 16px; margin-bottom: 14px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { text-align: left; padding: 8px 4px; font-size: 12px; color: var(--text-muted); border-bottom: 1px solid var(--border); }
        td { padding: 10px 4px; border-bottom: 1px solid var(--border); }
        .pill { font-size: 12px; padding: 3px 10px; border-radius: 999px; background: var(--bg-light); }
        .pill.verified { background: #dcfce7; color: #166534; }
        .pill.verification_pending { background: #fef9c3; color: #854d0e; }
        .pill.rejected { background: #fef2f2; color: #b91c1c; }
        .view-link { font-size: 13px; color: var(--blue); font-weight: 600; }
        .downloads-grid { display: flex; flex-direction: column; gap: 10px; }
        .download-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); }
        .btn-sm { padding: 8px 14px; font-size: 13px; }
      `}</style>
    </div>
  );
}
