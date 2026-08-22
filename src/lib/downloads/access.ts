import "server-only";
import { db } from "@/db";
import { orders, orderItems, payments, downloadPermissions, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createDownloadUrl } from "@/lib/downloads/signedUrl";
import type { SessionUser } from "@/lib/auth/session";

export type DownloadCheckResult =
  | { ok: true; url: string; fileName: string }
  | { ok: false; reason: "not_found" | "forbidden" | "payment_not_verified" | "locked" | "no_file" };

// CRITICAL SECURITY GATE: enforces the absolute rule
// "NO PAYMENT APPROVAL = NO DOWNLOAD"
export async function requestSecureDownload(
  user: SessionUser,
  orderId: string,
  productId: string
): Promise<DownloadCheckResult> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return { ok: false, reason: "not_found" };

  // Ownership check — customer must own the order (or be admin).
  if (user.role !== "admin" && order.userId !== user.id) {
    return { ok: false, reason: "forbidden" };
  }

  // Order must actually contain the product.
  const [item] = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .where(and(eq(orderItems.orderId, orderId), eq(orderItems.productId, productId)))
    .limit(1);
  if (!item) return { ok: false, reason: "not_found" };

  // Payment must be verified.
  const [payment] = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1);
  if (!payment || payment.status !== "verified") {
    return { ok: false, reason: "payment_not_verified" };
  }

  // Explicit download permission must exist and be unlocked.
  const [permission] = await db
    .select()
    .from(downloadPermissions)
    .where(and(eq(downloadPermissions.orderId, orderId), eq(downloadPermissions.productId, productId)))
    .limit(1);
  if (!permission || !permission.unlocked) {
    return { ok: false, reason: "locked" };
  }

  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product || !product.digitalFileKey) {
    return { ok: false, reason: "no_file" };
  }

  const url = createDownloadUrl(product.digitalFileKey, permission.id);
  return { ok: true, url, fileName: product.digitalFileName || `${product.slug}.zip` };
}
