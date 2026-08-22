import "server-only";
import { db } from "@/db";
import { whatsNew } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getPublishedWhatsNew(limit?: number) {
  const query = db
    .select()
    .from(whatsNew)
    .where(eq(whatsNew.status, "published"))
    .orderBy(desc(whatsNew.publishedAt));
  return limit ? query.limit(limit) : query;
}

export async function getWhatsNewBySlug(slug: string) {
  const [row] = await db.select().from(whatsNew).where(eq(whatsNew.slug, slug)).limit(1);
  return row ?? null;
}
