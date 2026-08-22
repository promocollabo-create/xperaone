import "server-only";
import { db } from "@/db";
import { products, productImages, categories } from "@/db/schema";
import { eq, and, desc, asc, ilike, or, sql, ne, inArray } from "drizzle-orm";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: string;
  salePrice: string | null;
  isNew: boolean;
  isFeatured: boolean;
  image: string | null;
  categoryName: string | null;
  categorySlug: string | null;
};

async function attachPrimaryImages(rows: Omit<ProductCardData, "image">[]): Promise<ProductCardData[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const images = await db
    .select({ productId: productImages.productId, url: productImages.url, sortOrder: productImages.sortOrder })
    .from(productImages)
    .where(inArray(productImages.productId, ids))
    .orderBy(asc(productImages.sortOrder));

  const firstImageByProduct = new Map<string, string>();
  for (const img of images) {
    if (!firstImageByProduct.has(img.productId)) firstImageByProduct.set(img.productId, img.url);
  }

  return rows.map((r) => ({ ...r, image: firstImageByProduct.get(r.id) ?? null }));
}

const baseSelect = {
  id: products.id,
  name: products.name,
  slug: products.slug,
  shortDescription: products.shortDescription,
  price: products.price,
  salePrice: products.salePrice,
  isNew: products.isNew,
  isFeatured: products.isFeatured,
  categoryName: categories.name,
  categorySlug: categories.slug,
};

export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  const rows = await db
    .select(baseSelect)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.status, "published"), eq(products.isFeatured, true)))
    .orderBy(desc(products.createdAt))
    .limit(limit);
  return attachPrimaryImages(rows);
}

export async function getNewProducts(limit = 8): Promise<ProductCardData[]> {
  const rows = await db
    .select(baseSelect)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.status, "published"), eq(products.isNew, true)))
    .orderBy(desc(products.createdAt))
    .limit(limit);
  return attachPrimaryImages(rows);
}

export async function getLatestProducts(limit = 8): Promise<ProductCardData[]> {
  const rows = await db
    .select(baseSelect)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.status, "published"))
    .orderBy(desc(products.createdAt))
    .limit(limit);
  return attachPrimaryImages(rows);
}

export type ShopFilters = {
  search?: string;
  categorySlug?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc";
  page?: number;
  pageSize?: number;
};

export async function getShopProducts(filters: ShopFilters): Promise<{ items: ProductCardData[]; total: number }> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;

  const conditions = [eq(products.status, "published")];
  if (filters.search) {
    conditions.push(
      or(ilike(products.name, `%${filters.search}%`), ilike(products.shortDescription, `%${filters.search}%`))!
    );
  }
  if (filters.categorySlug) {
    conditions.push(eq(categories.slug, filters.categorySlug));
  }

  let orderBy = desc(products.createdAt);
  if (filters.sort === "price_asc") orderBy = asc(sql`coalesce(${products.salePrice}, ${products.price})`) as never;
  if (filters.sort === "price_desc") orderBy = desc(sql`coalesce(${products.salePrice}, ${products.price})`) as never;
  if (filters.sort === "name_asc") orderBy = asc(products.name) as never;

  const rows = await db
    .select(baseSelect)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...conditions));

  const items = await attachPrimaryImages(rows);
  return { items, total: count };
}

export async function getProductBySlug(slug: string) {
  const [product] = await db
    .select()
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.status, "published")))
    .limit(1);
  if (!product) return null;

  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, product.products.id))
    .orderBy(asc(productImages.sortOrder));

  return { ...product.products, category: product.categories, images };
}

export async function getRelatedProducts(categoryId: string | null, excludeId: string, limit = 4): Promise<ProductCardData[]> {
  if (!categoryId) return [];
  const rows = await db
    .select(baseSelect)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.status, "published"), eq(products.categoryId, categoryId), ne(products.id, excludeId)))
    .limit(limit);
  return attachPrimaryImages(rows);
}

export async function getAllCategories() {
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getCategoryBySlug(slug: string) {
  const [category] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return category ?? null;
}
