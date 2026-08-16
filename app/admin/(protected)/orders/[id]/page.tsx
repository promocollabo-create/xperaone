import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { verifyPayment, rejectPayment, updateOrderStatusWithHistory, saveAdminNotes } from "./actions";
import { formatMoney } from "@/lib/currency";

export const revalidate = 0;

const ORDER_STATUSES = ["pending", "processing", "completed", "cancelled", "refunded"];

export default async function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase.from("orders").select("*, profiles(email, full_name)").eq("id", id).single();
  if (!order) notFound();

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);
  const { data: history } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: false });
  const { data: siteSettings } = await supabase.from("site_settings").select("currency").single();
  const currency = siteSettings?.currency;

  let screenshotUrl: string | null = null;
  if (order.payment_screenshot_url) {
    const { data: signed } = await supabase.storage
      .from("payment-screenshots")
      .createSignedUrl(order.payment_screenshot_url, 300); // 5 min, admin viewing only
    screenshotUrl = signed?.signedUrl ?? null;
  }

  const isPendingVerification = order.payment_status === "verification_pending";

  return (
    <div>
      <h1 className="page-title">Order #{order.order_number}</h1>

      <div className="grid-2">
        <div className="card">
          <h2>Customer</h2>
          <p><strong>{order.customer_name}</strong></p>
          <p>{order.customer_email}</p>
          {order.customer_phone && <p>{order.customer_phone}</p>}
        </div>

        <div className="card">
          <h2>Order Summary</h2>
          <p>Subtotal: {formatMoney(Number(order.subtotal), currency)}</p>
          <p>Total: <strong>{formatMoney(Number(order.total), currency)}</strong></p>
          <p>Payment method: {order.payment_channel || order.payment_method}</p>
          {order.payment_reference && <p>Reference: {order.payment_reference}</p>}
          <p>Placed: {new Date(order.created_at).toLocaleString()}</p>
          {order.verified_at && <p>Verified: {new Date(order.verified_at).toLocaleString()}</p>}
          {order.order_notes && <p>Notes: {order.order_notes}</p>}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Billing Address</h2>
          <p>{order.billing_address}</p>
          <p>{[order.city, order.state].filter(Boolean).join(", ")} {order.postal_code}</p>
          <p>{order.customer_country}</p>
        </div>
        <div className="card">
          <h2>Shipping Address</h2>
          {order.shipping_same_as_billing ? (
            <p className="muted">Same as billing address</p>
          ) : (
            <>
              <p>{order.shipping_address}</p>
              <p>{[order.shipping_city, order.shipping_state].filter(Boolean).join(", ")} {order.shipping_postal_code}</p>
              <p>{order.shipping_country}</p>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Items</h2>
        <table>
          <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Downloaded?</th></tr></thead>
          <tbody>
            {(items ?? []).map((item) => (
              <tr key={item.id}>
                <td>{item.product_name}</td>
                <td>{item.quantity}</td>
                <td>{formatMoney(Number(item.unit_price), currency)}</td>
                <td>{item.download_granted ? "✓ Granted" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Payment Verification</h2>
        <p>Payment status: <span className={`pill ${order.payment_status}`}>{order.payment_status}</span></p>

        {screenshotUrl ? (
          <a href={screenshotUrl} target="_blank" rel="noreferrer">
            <img src={screenshotUrl} alt="Payment screenshot" className="screenshot-preview" />
          </a>
        ) : (
          <p className="muted">No payment screenshot uploaded.</p>
        )}

        {isPendingVerification && (
          <div className="verify-actions">
            <form action={verifyPayment}>
              <input type="hidden" name="order_id" value={order.id} />
              <button type="submit" className="btn btn-primary">✓ Approve Payment</button>
            </form>
            <form action={rejectPayment} className="reject-form">
              <input type="hidden" name="order_id" value={order.id} />
              <input type="text" name="reason" placeholder="Rejection reason (optional)" />
              <button type="submit" className="btn-reject">✕ Reject Payment</button>
            </form>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Order Status</h2>
        <form action={updateOrderStatusWithHistory} className="status-form">
          <input type="hidden" name="order_id" value={order.id} />
          <select name="status" defaultValue={order.status}>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="text" name="note" placeholder="Note (optional)" />
          <button type="submit" className="mini-btn">Update Status</button>
        </form>
      </div>

      <div className="card">
        <h2>Admin Notes</h2>
        <form action={saveAdminNotes} className="notes-form">
          <input type="hidden" name="order_id" value={order.id} />
          <textarea name="admin_notes" rows={3} defaultValue={order.admin_notes ?? ""} />
          <button type="submit" className="mini-btn">Save Notes</button>
        </form>
      </div>

      <div className="card">
        <h2>Status History</h2>
        <div className="history-list">
          {(history ?? []).map((h) => (
            <div key={h.id} className="history-item">
              <span className="history-date">{new Date(h.created_at).toLocaleString()}</span>
              <span>{h.previous_status ?? "—"} → <strong>{h.new_status}</strong>
                {h.new_payment_status && ` (payment: ${h.new_payment_status})`}
              </span>
              {h.note && <p className="history-note">{h.note}</p>}
            </div>
          ))}
          {(!history || history.length === 0) && <p className="muted">No history yet.</p>}
        </div>
      </div>

      <style>{`
        .page-title { font-size: 24px; margin-bottom: 20px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .card { padding: 20px 24px; margin-bottom: 16px; }
        h2 { font-size: 15px; margin-bottom: 10px; }
        p { font-size: 13px; margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; padding: 8px 4px; font-size: 11px; color: var(--text-muted); border-bottom: 1px solid var(--border); }
        td { padding: 8px 4px; border-bottom: 1px solid var(--border); }
        .pill { font-size: 12px; padding: 3px 10px; border-radius: 999px; background: var(--bg-light); }
        .pill.verified { background: #dcfce7; color: #166534; }
        .pill.verification_pending { background: #fef9c3; color: #854d0e; }
        .pill.rejected { background: #fef2f2; color: #b91c1c; }
        .screenshot-preview { max-width: 280px; border-radius: var(--radius-sm); border: 1px solid var(--border); margin: 10px 0; }
        .verify-actions { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
        .reject-form { display: flex; gap: 8px; }
        .reject-form input { padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border); font-size: 13px; }
        .btn-reject { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; padding: 11px 18px; border-radius: var(--radius-sm); font-weight: 600; font-size: 14px; }
        .status-form, .notes-form { display: flex; gap: 8px; align-items: flex-start; }
        .status-form select, .status-form input { padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border); font-size: 13px; }
        .notes-form textarea { flex: 1; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border); font-size: 13px; font-family: var(--font-body); }
        .mini-btn { font-size: 12px; padding: 8px 14px; border-radius: 6px; border: 1px solid var(--border); background: white; white-space: nowrap; }
        .history-list { display: flex; flex-direction: column; gap: 10px; }
        .history-item { font-size: 13px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
        .history-date { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 2px; }
        .history-note { color: var(--text-muted); margin-top: 4px; }
        .muted { color: var(--text-muted); }
      `}</style>
    </div>
  );
}
