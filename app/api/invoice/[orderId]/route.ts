import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateInvoicePdf } from "@/lib/invoice/generate";

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const supabase = await createClient();

  // RLS on orders (customer_id = auth.uid() or is_admin()) means this
  // returns null for anyone who isn't the owner or an admin.
  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", orderId);
  const { data: settings } = await supabase.from("site_settings").select("site_name").single();

  const pdf = await generateInvoicePdf({
    invoiceNumber: order.invoice_number ?? order.order_number,
    orderNumber: order.order_number,
    orderDate: new Date(order.created_at).toLocaleDateString(),
    storeName: settings?.site_name ?? "XperaOne",
    customerName: order.customer_name ?? "",
    customerEmail: order.customer_email ?? "",
    customerPhone: order.customer_phone,
    billingAddress: order.billing_address,
    items: (items ?? []).map((i) => ({ name: i.product_name, quantity: i.quantity, unitPrice: Number(i.unit_price) })),
    subtotal: Number(order.subtotal),
    discount: Number(order.discount ?? 0),
    total: Number(order.total),
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    orderStatus: order.status,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${order.order_number}.pdf"`,
    },
  });
}
