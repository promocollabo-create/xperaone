"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction, buyNowAction } from "@/lib/cart/actions";

export default function AddToCartButtons({
  productId,
  compact = false,
}: {
  productId: string;
  slug: string;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      const res = await addToCartAction(productId);
      if (res.error) {
        setError(res.error);
      } else {
        setAdded(true);
        router.refresh();
        setTimeout(() => setAdded(false), 1800);
      }
    });
  }

  function handleBuyNow() {
    setError(null);
    startTransition(async () => {
      await buyNowAction(productId);
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className={`flex gap-2 ${compact ? "text-xs" : "text-sm"}`}>
        <button
          onClick={handleAdd}
          disabled={pending}
          className="xp-btn-secondary flex-1 px-3 py-2 disabled:opacity-60"
        >
          {added ? "Added ✓" : "Add to Cart"}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={pending}
          className="xp-btn-primary flex-1 px-3 py-2 disabled:opacity-60"
        >
          Buy Now
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
