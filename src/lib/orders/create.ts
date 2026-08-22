import "server-only";
import { db } from "@/db";
import { orders, orderItems, payments, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateOrderNumber } from "@/lib/orders/orderNumber";
import { addOrderHistory } from "@/lib/orders/history";
import { getCart, clearCart } from "@/lib/cart/cart";
import { getPaymentSettings } from "@/lib/settings";
import { sendEmail } from "@/lib/email/send";
import { orderCreatedEmail } from "@/lib/email/templates";
import { formatMoney } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth/session";

export type CheckoutInput = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  city: string;
  postalCode: string;
};

export async function createOrderFromCart(user: SessionUser | null, input: CheckoutInput): Promise<{ orderNumber: string }> {
  const cart = await getCart(user);
  if (cart.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  // Server-side price recomputation — never trust client-submitted prices.
  let subtotal = 0;
  const lineItems: { productId: string; name: string; unitPrice: number; quantity: number; lineTotal: number }[] = [];
  for (const line of cart.items) {
    const [product] = await db.select().from(products).where(eq(products.id, line.productId)).limit(1);
    if (!product || product.status !== "published") continue;
    const unitPrice = product.salePrice ? parseFloat(product.salePrice) : parseFloat(product.price);
    const lineTotal = unitPrice * line.quantity;
    subtotal += lineTotal;
    lineItems.push({ productId: product.id, name: product.name, unitPrice, quantity: line.quantity, lineTotal });
  }

  if (lineItems.length === 0) {
    throw new Error("No purchasable products found in your cart.");
  }

  const paymentSettings = await getPaymentSettings();
  const orderNumber = await generateOrderNumber();
  const total = subtotal;

  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      userId: user?.id ?? null,
      email: input.email,
      fullName: input.fullName,
      phone: input.phone,
      country: input.country,
      billingDetails: { address: input.address, city: input.city, postalCode: input.postalCode },
      subtotal: subtotal.toFixed(2),
      total: total.toFixed(2),
      currency: paymentSettings.currency,
      status: "pending",
      downloadStatus: "locked",
    })
    .returning();

  for (const li of lineItems) {
    await db.insert(orderItems).values({
      orderId: order.id,
      productId: li.productId,
      productName: li.name,
      unitPrice: li.unitPrice.toFixed(2),
      quantity: li.quantity,
      subtotal: li.lineTotal.toFixed(2),
    });
  }

  await db.insert(payments).values({
    orderId: order.id,
    method: paymentSettings.method,
    amount: total.toFixed(2),
    currency: paymentSettings.currency,
    status: "pending",
  });

  await addOrderHistory(order.id, "pending", "Order placed. Awaiting payment.", "customer");

  await clearCart(user);

  const { subject, html } = orderCreatedEmail(orderNumber, formatMoney(total, paymentSettings.currency));
  await sendEmail(input.email, subject, html);

  return { orderNumber };
}
