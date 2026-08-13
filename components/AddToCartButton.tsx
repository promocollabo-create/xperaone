"use client";

import { useCart } from "@/lib/cart/CartContext";
import type { Product } from "@/types/database";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      className="btn btn-primary btn-sm"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
          productId: product.id,
          name: product.name,
          price: product.price,
          thumbnailUrl: product.thumbnail_url,
        });
      }}
    >
      Add to Cart
    </button>
  );
}
