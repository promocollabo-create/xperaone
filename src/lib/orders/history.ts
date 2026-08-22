import "server-only";
import { db } from "@/db";
import { orderStatusHistory } from "@/db/schema";

export async function addOrderHistory(
  orderId: string,
  status: string,
  message: string,
  createdBy: "system" | "customer" | "admin" = "system"
): Promise<void> {
  await db.insert(orderStatusHistory).values({ orderId, status, message, createdBy });
}
