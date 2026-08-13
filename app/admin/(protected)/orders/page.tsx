import { createClient } from "@/lib/supabase/server";
import { updateOrderStatus } from "./actions";

export const revalidate = 0;

const STATUSES = ["pending", "processing", "completed", "cancelled", "refunded"];

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, profiles(email, full_name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="page-title">Orders</h1>

      <div className="card table-card">
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id}>
                <td>{o.order_number}</td>
                <td>{o.profiles?.email ?? "—"}</td>
                <td>${Number(o.total).toFixed(2)}</td>
                <td>{o.payment_status}</td>
                <td>
                  <form action={updateOrderStatus} className="inline-form">
                    <input type="hidden" name="id" value={o.id} />
                    <select name="status" defaultValue={o.status}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button type="submit" className="mini-btn">Update</button>
                  </form>
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && <tr><td colSpan={5}>No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <style>{`
        .table-card { padding: 8px 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { text-align: left; padding: 12px 8px; font-size: 12px; color: var(--text-muted); border-bottom: 1px solid var(--border); }
        td { padding: 12px 8px; border-bottom: 1px solid var(--border); }
        .inline-form { display: flex; gap: 8px; }
        select { padding: 6px 8px; border-radius: 6px; border: 1px solid var(--border); font-size: 13px; }
        .mini-btn { font-size: 12px; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border); background: white; }
      `}</style>
    </div>
  );
}
