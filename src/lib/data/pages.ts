import "server-only";
import { db } from "@/db";
import { pages, pageSections } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import type { PageSectionData } from "@/db/schema";

export async function getPublishedPage(slug: string) {
  const [page] = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
  if (!page) return null;
  return { page, sections: (page.publishedSections as PageSectionData[]) ?? [] };
}

export async function getPageWithDraftSections(slug: string) {
  const [page] = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
  if (!page) return null;
  const draftRows = await db.select().from(pageSections).where(eq(pageSections.pageId, page.id)).orderBy(asc(pageSections.sortOrder));
  return { page, draftSections: draftRows };
}

export async function listPages() {
  return db.select().from(pages).orderBy(asc(pages.title));
}

export async function ensurePage(slug: string, title: string) {
  const existing = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
  if (existing.length > 0) return existing[0];
  const [created] = await db.insert(pages).values({ slug, title, status: "draft" }).returning();
  return created;
}
