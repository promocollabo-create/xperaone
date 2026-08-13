"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("orders")
    .update({ status: String(formData.get("status")) })
    .eq("id", String(formData.get("id")));
  revalidatePath("/admin/orders");
  revalidatePath("/customer/dashboard");
}
