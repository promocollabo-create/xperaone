"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { createOrderFromCart } from "@/lib/orders/create";

export type CheckoutState = { error?: string };

export async function submitCheckoutAction(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const country = String(formData.get("country") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const postalCode = String(formData.get("postalCode") || "").trim();

  if (!fullName || !email || !phone || !country) {
    return { error: "Please fill in all required fields." };
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const user = await getCurrentUser();

  let orderNumber: string;
  try {
    const result = await createOrderFromCart(user, { fullName, email, phone, country, address, city, postalCode });
    orderNumber = result.orderNumber;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to place order." };
  }

  redirect(`/payment?order=${orderNumber}`);
}
