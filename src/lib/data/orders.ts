import "server-only";
import { db } from "@/db";
import { orders, orderItems, payments, paymentProofs, orderStatusHistory, invoices, downloadPermissions } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";

export async function getOrderByNumber(orderNumber: string) {
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return order ?? null;
}

export async function getOrderFullDetails(orderNumber: string) {
  const order = await getOrderByNumber(orderNumber);
  if (!order) return null;

  const [items, payment, history, invoice, downloadPerms] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
    db.select().from(payments).where(eq(payments.orderId, order.id)).then((r) => r[0] ?? null),
    db.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, order.id)).orderBy(asc(orderStatusHistory.createdAt)),
    db.select().from(invoices).where(eq(invoices.orderId, order.id)).then((r) => r[0] ?? null),
    db.select().from(downloadPermissions).where(eq(downloadPermissions.orderId, order.id)),
  ]);

  let proof = null;
  if (payment) {
    const proofs = await db.select().from(paymentProofs).where(eq(paymentProofs.paymentId, payment.id)).orderBy(desc(paymentProofs.createdAt));
    proof = proofs[0] ?? null;
  }

  return { order, items, payment, proof, history, invoice, downloadPermissions: downloadPerms };
}

export async function getOrdersForUser(userId: string) {
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}
