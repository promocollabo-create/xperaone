import "server-only";
import { cookies } from "next/headers";
import { db } from "@/db";
import { carts, cartItems, products, productImages } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { randomToken } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth/session";

const CART_COOKIE = "xperaone_cart";

async function getOrCreateCartId(user: SessionUser | null): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(CART_COOKIE)?.value;

  if (user) {
    const existing = await db.select({ id: carts.id }).from(carts).where(eq(carts.userId, user.id)).limit(1);
    if (existing.length > 0) return existing[0].id;
    const newToken = token || randomToken(24);
    const [created] = await db.insert(carts).values({ userId: user.id, token: newToken }).returning({ id: carts.id });
    cookieStore.set(CART_COOKIE, newToken, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 60 });
    return created.id;
  }

  if (token) {
    const existing = await db.select({ id: carts.id }).from(carts).where(eq(carts.token, token)).limit(1);
    if (existing.length > 0) return existing[0].id;
  }

  const newToken = randomToken(24);
  const [created] = await db.insert(carts).values({ token: newToken }).returning({ id: carts.id });
  cookieStore.set(CART_COOKIE, newToken, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 60 });
  return created.id;
}

export type CartLine = {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  price: string;
  salePrice: string | null;
  quantity: number;
  lineTotal: number;
  status: string;
};

export type CartSummary = {
  cartId: string;
  items: CartLine[];
  subtotal: number;
  total: number;
  currency: string;
  count: number;
};

export async function getCart(user: SessionUser | null): Promise<CartSummary> {
  const cartId = await getOrCreateCartId(user);
  const rows = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      name: products.name,
      slug: products.slug,
      price: products.price,
      salePrice: products.salePrice,
      status: products.status,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cartId));

  const items: CartLine[] = [];
  for (const row of rows) {
    const img = await db
      .select({ url: productImages.url })
      .from(productImages)
      .where(eq(productImages.productId, row.productId))
      .orderBy(asc(productImages.sortOrder))
      .limit(1);
    const effectivePrice = row.salePrice ? parseFloat(row.salePrice) : parseFloat(row.price);
    items.push({
      id: row.id,
      productId: row.productId,
      name: row.name,
      slug: row.slug,
      image: img[0]?.url ?? null,
      price: row.price,
      salePrice: row.salePrice,
      quantity: row.quantity,
      lineTotal: effectivePrice * row.quantity,
      status: row.status,
    });
  }

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return {
    cartId,
    items,
    subtotal,
    total: subtotal,
    currency: "USD",
    count: items.reduce((sum, i) => sum + i.quantity, 0),
  };
}

export async function addToCart(user: SessionUser | null, productId: string, quantity = 1): Promise<void> {
  const cartId = await getOrCreateCartId(user);
  const [product] = await db.select({ id: products.id, status: products.status }).from(products).where(eq(products.id, productId)).limit(1);
  if (!product || product.status !== "published") {
    throw new Error("Product not available");
  }

  const existing = await db
    .select({ id: cartItems.id, quantity: cartItems.quantity })
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({ cartId, productId, quantity });
  }
}

export async function updateCartItem(user: SessionUser | null, itemId: string, quantity: number): Promise<void> {
  const cartId = await getOrCreateCartId(user);
  if (quantity <= 0) {
    await db.delete(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)));
    return;
  }
  await db.update(cartItems).set({ quantity, updatedAt: new Date() }).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)));
}

export async function removeCartItem(user: SessionUser | null, itemId: string): Promise<void> {
  const cartId = await getOrCreateCartId(user);
  await db.delete(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)));
}

export async function clearCart(user: SessionUser | null): Promise<void> {
  const cartId = await getOrCreateCartId(user);
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
}

export async function getCartId(user: SessionUser | null): Promise<string> {
  return getOrCreateCartId(user);
}
