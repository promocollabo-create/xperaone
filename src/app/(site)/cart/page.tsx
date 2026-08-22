import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getCart } from "@/lib/cart/cart";
import { formatMoney } from "@/lib/utils";
import CartLineRow from "@/components/CartLineRow";

export const metadata = { title: "Your Cart" };

export default async function CartPage() {
  const user = await getCurrentUser();
  const cart = await getCart(user);

  if (cart.items.length === 0) {
    return (
      <div className="xp-container py-24 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="text-slate-500 mt-2">Browse the store to find premium digital products.</p>
        <Link href="/shop" className="xp-btn-primary inline-block mt-6 px-6 py-3">
          Go to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="xp-container py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-4">
          {cart.items.map((item) => (
            <CartLineRow key={item.id} item={item} />
          ))}
        </div>

        <div className="xp-card p-6 h-fit sticky top-24">
          <h2 className="font-bold text-slate-900 mb-4">Order Summary</h2>
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Subtotal</span>
            <span>{formatMoney(cart.subtotal)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-slate-900 border-t border-slate-100 pt-3 mt-3">
            <span>Total</span>
            <span>{formatMoney(cart.total)}</span>
          </div>
          <Link href="/checkout" className="xp-btn-primary block text-center mt-6 py-3">
            Proceed to Checkout
          </Link>
          <Link href="/shop" className="block text-center mt-3 text-sm text-purple-700 font-semibold hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
