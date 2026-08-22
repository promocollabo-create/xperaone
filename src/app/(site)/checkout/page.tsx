import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getCart } from "@/lib/cart/cart";
import { formatMoney } from "@/lib/utils";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const cart = await getCart(user);

  if (cart.items.length === 0) {
    redirect("/cart");
  }

  return (
    <div className="xp-container py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <CheckoutForm user={user} />

        <div className="xp-card p-6 h-fit">
          <h2 className="font-bold text-slate-900 mb-4">Your Order</h2>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <Link href={`/product/${item.slug}`} className="font-medium text-slate-800 line-clamp-1 hover:text-purple-700">
                    {item.name}
                  </Link>
                  <p className="text-slate-400 text-xs">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold text-slate-800 shrink-0">{formatMoney(item.lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>{formatMoney(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-slate-900">
              <span>Total</span>
              <span>{formatMoney(cart.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
