"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { CartItem } from "@/lib/cart/CartContext";

function generateOrderNumber() {
  return "XO-" + Date.now().toString(36).toUpperCase();
}

// Note: this demonstrates the order-creation flow (cart -> orders ->
// order_items -> downloads entitlement). It marks payment_status as "paid"
// immediately for demo purposes — wire this to a real payment provider's
// webhook before going to production, and only flip payment_status to
// "paid" from that webhook handler, never from client-triggered code.
export async function checkout(items: CartItem[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/cart");
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: generateOrderNumber(),
      customer_id: user!.id,
      subtotal,
      total: subtotal,
      payment_status: "paid",
      status: "completed",
    })
    .select()
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Could not create order");
  }

  for (const item of items) {
    const { data: orderItem } = await supabase
      .from("order_items")
      .insert({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        download_granted: true,
      })
      .select()
      .single();

    if (orderItem) {
      await supabase.from("downloads").insert({
        customer_id: user!.id,
        product_id: item.productId,
        order_item_id: orderItem.id,
      });
    }
  }

  redirect("/customer/dashboard");
}
