import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ClearCartOnMount from "@/components/ClearCartOnMount";

export const revalidate = 0;

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  verification_pending: "Verification Pending",
  verified: "Verified",
  failed: "Failed",
  rejected: "Rejected",
  refunded: "Refunded",
};

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS (orders_owner_or_admin_select) means this 404s for anyone who
  // isn't the order's owner or an admin — no extra check needed here.
  const { data: order } = await supabase.from("orders").select("*").eq("id", id).single();
  if (!order) notFound();

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);

  return (
    <div className="container section order-confirmation">
      <ClearCartOnMount />
      <div className="card confirm-card">
        <div className="confirm-header">
          <span className="check-icon">✓</span>
          <h1>Order Placed!</h1>
          <p>Order #{order.order_number}</p>
        </div>

        <div className="status-row">
          <div className="status-badge">
            Payment: <strong>{PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}</strong>
          </div>
          <div className="status-badge">
            Order: <strong>{order.status}</strong>
          </div>
        </div>

        {order.payment_status === "verification_pending" && (
          <div className="notice">
            Your payment is pending verification. We normally review payments within 2-3 hours. You'll receive an
            email once it's confirmed.
          </div>
        )}

        <div className="items-list">
          {(items ?? []).map((item) => (
            <div key={item.id} className="item-row">
              <span>{item.product_name} × {item.quantity}</span>
              <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="total-row"><span>Total</span><span>${Number(order.total).toFixed(2)}</span></div>

        <div className="confirm-actions">
          <a href={`/api/invoice/${order.id}`} className="btn btn-secondary" target="_blank" rel="noreferrer">
            Download Invoice
          </a>
          <Link href="/customer/dashboard" className="btn btn-primary">Go to My Orders</Link>
        </div>
      </div>

      <style>{`
        .order-confirmation { max-width: 560px; }
        .confirm-card { padding: 32px; }
        .confirm-header { text-align: center; margin-bottom: 20px; }
        .check-icon { display: inline-flex; width: 48px; height: 48px; border-radius: 50%; background: #dcfce7; color: #166534; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 12px; }
        .confirm-header h1 { font-size: 22px; }
        .confirm-header p { font-family: var(--font-mono); font-size: 13px; margin-top: 4px; }
        .status-row { display: flex; gap: 10px; justify-content: center; margin-bottom: 16px; }
        .status-badge { font-size: 13px; background: var(--bg-light); padding: 6px 14px; border-radius: 999px; }
        .notice { background: #fef9c3; color: #854d0e; font-size: 13px; padding: 12px 14px; border-radius: var(--radius-sm); margin-bottom: 20px; }
        .items-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
        .item-row { display: flex; justify-content: space-between; font-size: 14px; }
        .total-row { display: flex; justify-content: space-between; font-weight: 700; font-size: 16px; color: var(--navy); border-top: 1px solid var(--border); padding-top: 10px; margin-bottom: 20px; }
        .confirm-actions { display: flex; gap: 12px; }
        .confirm-actions .btn { flex: 1; }
      `}</style>
    </div>
  );
}
