import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 0;

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
          <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id}>
                <td>{o.order_number}</td>
                <td>{o.customer_email ?? o.profiles?.email ?? "—"}</td>
                <td>${Number(o.total).toFixed(2)}</td>
                <td><span className={`pill ${o.payment_status}`}>{o.payment_status}</span></td>
                <td><span className="pill">{o.status}</span></td>
                <td><Link href={`/admin/orders/${o.id}`} className="view-link">View →</Link></td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && <tr><td colSpan={6}>No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <style>{`
        .table-card { padding: 8px 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { text-align: left; padding: 12px 8px; font-size: 12px; color: var(--text-muted); border-bottom: 1px solid var(--border); }
        td { padding: 12px 8px; border-bottom: 1px solid var(--border); }
        .pill { font-size: 12px; padding: 3px 10px; border-radius: 999px; background: var(--bg-light); }
        .pill.verified { background: #dcfce7; color: #166534; }
        .pill.verification_pending { background: #fef9c3; color: #854d0e; }
        .pill.rejected { background: #fef2f2; color: #b91c1c; }
        .view-link { font-size: 13px; color: var(--blue); font-weight: 600; }
      `}</style>
    </div>
  );
}
