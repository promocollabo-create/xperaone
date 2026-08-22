import "server-only";
import { db } from "@/db";
import { orders, invoices } from "@/db/schema";
import { sql } from "drizzle-orm";

// Generates unique, human-friendly order numbers like XP-2026-000001.
// Never expose raw database UUIDs as order-facing identifiers.
export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `XP-${year}-`;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(sql`${orders.orderNumber} like ${prefix + "%"}`);

  let next = (count || 0) + 1;
  for (let attempt = 0; attempt < 25; attempt++) {
    const candidate = `${prefix}${String(next).padStart(6, "0")}`;
    const existing = await db.select({ id: orders.id }).from(orders).where(sql`${orders.orderNumber} = ${candidate}`).limit(1);
    if (existing.length === 0) return candidate;
    next += 1;
  }
  throw new Error("Unable to generate unique order number");
}

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(invoices)
    .where(sql`${invoices.invoiceNumber} like ${prefix + "%"}`);

  let next = (count || 0) + 1;
  for (let attempt = 0; attempt < 25; attempt++) {
    const candidate = `${prefix}${String(next).padStart(6, "0")}`;
    const existing = await db.select({ id: invoices.id }).from(invoices).where(sql`${invoices.invoiceNumber} = ${candidate}`).limit(1);
    if (existing.length === 0) return candidate;
    next += 1;
  }
  throw new Error("Unable to generate unique invoice number");
}
