"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import { updateCartItemAction, removeCartItemAction } from "@/lib/cart/actions";
import type { CartLine } from "@/lib/cart/cart";

export default function CartLineRow({ item }: { item: CartLine }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const effectivePrice = item.salePrice ? parseFloat(item.salePrice) : parseFloat(item.price);

  function changeQty(next: number) {
    startTransition(async () => {
      await updateCartItemAction(item.id, next);
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      await removeCartItemAction(item.id);
      router.refresh();
    });
  }

  return (
    <div className="xp-card p-4 flex gap-4 items-center">
      <Link href={`/product/${item.slug}`} className="h-20 w-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl text-slate-300">📦</div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/product/${item.slug}`} className="font-semibold text-slate-900 hover:text-purple-700 transition line-clamp-1">
          {item.name}
        </Link>
        <p className="text-sm text-slate-500 mt-1">{formatMoney(effectivePrice)} each</p>
        <div className="flex items-center gap-2 mt-2">
          <button disabled={pending} onClick={() => changeQty(item.quantity - 1)} className="h-7 w-7 rounded-lg border border-slate-200 text-sm font-bold hover:bg-slate-50">
            −
          </button>
          <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
          <button disabled={pending} onClick={() => changeQty(item.quantity + 1)} className="h-7 w-7 rounded-lg border border-slate-200 text-sm font-bold hover:bg-slate-50">
            +
          </button>
          <button disabled={pending} onClick={remove} className="ml-3 text-xs font-semibold text-red-500 hover:underline">
            Remove
          </button>
        </div>
      </div>
      <p className="font-bold text-slate-900 shrink-0">{formatMoney(item.lineTotal)}</p>
    </div>
  );
}
