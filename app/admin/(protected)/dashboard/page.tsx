import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalProducts },
    { count: totalCustomers },
    { count: totalOrders },
    { data: orders },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total, payment_status"),
    supabase.from("orders").select("order_number, total, status, created_at").order("created_at", { ascending: false }).limit(6),
  ]);

  const totalSales = (orders ?? [])
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = (orders ?? []).filter((o) => o.payment_status === "pending").length;

  const cards = [
    { label: "Total Sales", value: `$${totalSales.toFixed(2)}` },
    { label: "Total Orders", value: totalOrders ?? 0 },
    { label: "Total Customers", value: totalCustomers ?? 0 },
    { label: "Total Products", value: totalProducts ?? 0 },
    { label: "Pending Orders", value: pendingOrders },
  ];

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      <div className="stat-cards">
        {cards.map((c) => (
          <div key={c.label} className="stat-card card">
            <span className="label">{c.label}</span>
            <span className="value">{c.value}</span>
          </div>
        ))}
      </div>

      <div className="recent-orders card">
        <h2>Recent Orders</h2>
        <table>
          <thead>
            <tr><th>Order</th><th>Total</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {(recentOrders ?? []).map((o) => (
              <tr key={o.order_number}>
                <td>{o.order_number}</td>
                <td>${Number(o.total).toFixed(2)}</td>
                <td><span className={`pill ${o.status}`}>{o.status}</span></td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {(!recentOrders || recentOrders.length === 0) && (
              <tr><td colSpan={4}>No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .page-title { font-size: 24px; margin-bottom: 20px; }
        .stat-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 28px; }
        .stat-card { padding: 20px; display: flex; flex-direction: column; gap: 6px; }
        .stat-card .label { font-size: 12px; color: var(--text-muted); }
        .stat-card .value { font-family: var(--font-mono); font-size: 22px; font-weight: 500; color: var(--navy); }
        .recent-orders { padding: 24px; }
        .recent-orders h2 { font-size: 16px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { text-align: left; color: var(--text-muted); font-weight: 500; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 12px; }
        td { padding: 10px 0; border-bottom: 1px solid var(--border); }
        .pill { font-size: 12px; padding: 3px 10px; border-radius: 999px; background: var(--bg-light); }
        .pill.completed { background: #dcfce7; color: #166534; }
        .pill.pending { background: #fef9c3; color: #854d0e; }
        @media (max-width: 1100px) { .stat-cards { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 700px) { .stat-cards { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}
