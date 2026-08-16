"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  sendPaymentVerifiedEmail,
  sendPaymentRejectedEmail,
  sendOrderStatusUpdatedEmail,
} from "@/lib/email/templates";
import { generateInvoicePdf } from "@/lib/invoice/generate";

// This is the ONLY place in the whole app that ever sets payment_status to
// 'verified' or creates a `downloads` entitlement row. That's intentional —
// it's what fixes "Completed = 1, Downloads = 0": previously downloads were
// (or weren't) created at checkout time regardless of whether payment was
// actually confirmed. Now they're created exactly once, exactly here, only
// after an admin has looked at the screenshot and approved it.
export async function verifyPayment(formData: FormData) {
  const supabase = await createClient();
  const orderId = String(formData.get("order_id"));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
  if (!order) return;

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", orderId);

  await supabase
    .from("orders")
    .update({
      payment_status: "verified",
      status: "completed",
      verified_at: new Date().toISOString(),
      verified_by: user?.id ?? null,
    })
    .eq("id", orderId);

  // Grant download access for every digital line item, and mark each
  // order_item as download_granted so the customer dashboard and this
  // admin screen agree on what's actually been unlocked.
  for (const item of items ?? []) {
    if (!item.product_id) continue;
    await supabase.from("downloads").insert({
      customer_id: order.customer_id,
      product_id: item.product_id,
      order_item_id: item.id,
    });
    await supabase.from("order_items").update({ download_granted: true }).eq("id", item.id);
  }

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    previous_status: order.status,
    new_status: "completed",
    previous_payment_status: order.payment_status,
    new_payment_status: "verified",
    changed_by: user?.id ?? null,
    note: "Payment verified by admin.",
  });

  const { data: settings } = await supabase.from("site_settings").select("site_name").single();
  const { data: emailSettings } = await supabase.from("email_settings").select("*").single();

  if (emailSettings?.notify_payment_verified !== false) {
    let invoicePdf: Buffer | undefined;
    try {
      invoicePdf = await generateInvoicePdf({
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
        paymentMethod: "Manual",
        paymentStatus: "Verified",
        orderStatus: "Completed",
      });
    } catch {
      invoicePdf = undefined;
    }

    await sendPaymentVerifiedEmail({
      orderNumber: order.order_number,
      customerName: order.customer_name ?? "",
      customerEmail: order.customer_email ?? "",
      items: (items ?? []).map((i) => ({ name: i.product_name, quantity: i.quantity, unitPrice: Number(i.unit_price) })),
      total: Number(order.total),
      paymentMethod: "Manual",
      paymentStatus: "Verified",
      orderStatus: "Completed",
      invoicePdf,
    });
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/customer/dashboard");
}

export async function rejectPayment(formData: FormData) {
  const supabase = await createClient();
  const orderId = String(formData.get("order_id"));
  const reason = String(formData.get("reason") ?? "");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
  if (!order) return;

  await supabase
    .from("orders")
    .update({
      payment_status: "rejected",
      status: "cancelled",
      admin_notes: reason || order.admin_notes,
    })
    .eq("id", orderId);

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    previous_status: order.status,
    new_status: "cancelled",
    previous_payment_status: order.payment_status,
    new_payment_status: "rejected",
    changed_by: user?.id ?? null,
    note: reason || "Payment rejected by admin.",
  });

  const { data: emailSettings } = await supabase.from("email_settings").select("*").single();
  if (emailSettings?.notify_payment_rejected !== false) {
    await sendPaymentRejectedEmail({
      orderNumber: order.order_number,
      customerName: order.customer_name ?? "",
      customerEmail: order.customer_email ?? "",
      items: [],
      total: Number(order.total),
      paymentMethod: "Manual",
      paymentStatus: "Rejected",
      orderStatus: "Cancelled",
      rejectionReason: reason || undefined,
    });
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function updateOrderStatusWithHistory(formData: FormData) {
  const supabase = await createClient();
  const orderId = String(formData.get("order_id"));
  const newStatus = String(formData.get("status"));
  const note = String(formData.get("note") ?? "");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
  if (!order) return;

  await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    previous_status: order.status,
    new_status: newStatus,
    previous_payment_status: order.payment_status,
    new_payment_status: order.payment_status,
    changed_by: user?.id ?? null,
    note: note || null,
  });

  const { data: emailSettings } = await supabase.from("email_settings").select("*").single();
  if (emailSettings?.notify_admin_new_order !== false) {
    // Reuses the generic status-update template — deliberately not sent for
    // every minor edit, only explicit status changes from this form.
    await sendOrderStatusUpdatedEmail({
      orderNumber: order.order_number,
      customerName: order.customer_name ?? "",
      customerEmail: order.customer_email ?? "",
      items: [],
      total: Number(order.total),
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      orderStatus: newStatus,
    });
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function saveAdminNotes(formData: FormData) {
  const supabase = await createClient();
  const orderId = String(formData.get("order_id"));
  const notes = String(formData.get("admin_notes") ?? "");
  await supabase.from("orders").update({ admin_notes: notes }).eq("id", orderId);
  revalidatePath(`/admin/orders/${orderId}`);
}
