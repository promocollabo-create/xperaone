import "server-only";
import { db } from "@/db";
import { orders, payments, orderItems, downloadPermissions, invoices } from "@/db/schema";
import { eq } from "drizzle-orm";
import { addOrderHistory } from "@/lib/orders/history";
import { generateInvoiceNumber } from "@/lib/orders/orderNumber";
import { sendEmail } from "@/lib/email/send";
import { paymentApprovedEmail, paymentRejectedEmail } from "@/lib/email/templates";

export async function approvePayment(orderId: string, adminId: string): Promise<void> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error("Order not found");

  const [payment] = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1);
  if (!payment) throw new Error("Payment not found");

  await db
    .update(payments)
    .set({ status: "verified", verifiedAt: new Date(), verifiedBy: adminId, rejectionReason: null, updatedAt: new Date() })
    .where(eq(payments.id, payment.id));

  await db
    .update(orders)
    .set({ status: "payment_verified", downloadStatus: "unlocked", updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  // Create invoice (idempotent — skip if one already exists for this order).
  const existingInvoice = await db.select().from(invoices).where(eq(invoices.orderId, orderId)).limit(1);
  if (existingInvoice.length === 0) {
    const invoiceNumber = await generateInvoiceNumber();
    await db.insert(invoices).values({
      invoiceNumber,
      orderId,
      subtotal: order.subtotal,
      total: order.total,
      currency: order.currency,
      status: "paid",
    });
  }

  // Unlock download permissions for every item in the order.
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  for (const item of items) {
    if (!item.productId) continue;
    const existingPermission = await db
      .select()
      .from(downloadPermissions)
      .where(eq(downloadPermissions.orderId, orderId));
    const already = existingPermission.find((p) => p.productId === item.productId);
    if (already) {
      await db.update(downloadPermissions).set({ unlocked: true, updatedAt: new Date() }).where(eq(downloadPermissions.id, already.id));
    } else {
      await db.insert(downloadPermissions).values({
        orderId,
        productId: item.productId,
        userId: order.userId,
        unlocked: true,
      });
    }
  }

  await addOrderHistory(orderId, "payment_verified", "Payment verified by admin. Invoice generated and downloads unlocked.", "admin");
  await addOrderHistory(orderId, "completed", "Order completed.", "system");
  await db.update(orders).set({ status: "completed" }).where(eq(orders.id, orderId));

  const { subject, html } = paymentApprovedEmail(order.orderNumber);
  await sendEmail(order.email, subject, html);
}

export async function rejectPayment(orderId: string, adminId: string, reason: string): Promise<void> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error("Order not found");

  const [payment] = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1);
  if (!payment) throw new Error("Payment not found");

  await db
    .update(payments)
    .set({ status: "rejected", rejectionReason: reason, verifiedBy: adminId, updatedAt: new Date() })
    .where(eq(payments.id, payment.id));

  await db
    .update(orders)
    .set({ status: "rejected", downloadStatus: "locked", updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  await addOrderHistory(orderId, "rejected", `Payment verification rejected. Reason: ${reason}`, "admin");

  const { subject, html } = paymentRejectedEmail(order.orderNumber, reason);
  await sendEmail(order.email, subject, html);
}
