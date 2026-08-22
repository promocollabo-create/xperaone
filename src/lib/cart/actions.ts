"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { addToCart, updateCartItem, removeCartItem } from "@/lib/cart/cart";

export async function addToCartAction(productId: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  try {
    await addToCart(user, productId, 1);
    revalidatePath("/cart");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to add to cart." };
  }
}

export async function buyNowAction(productId: string): Promise<void> {
  const user = await getCurrentUser();
  await addToCart(user, productId, 1);
  redirect("/checkout");
}

export async function updateCartItemAction(itemId: string, quantity: number): Promise<void> {
  const user = await getCurrentUser();
  await updateCartItem(user, itemId, quantity);
  revalidatePath("/cart");
}

export async function removeCartItemAction(itemId: string): Promise<void> {
  const user = await getCurrentUser();
  await removeCartItem(user, itemId);
  revalidatePath("/cart");
}
