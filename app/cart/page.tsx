"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="container section empty-cart">
        <h1>Your Cart</h1>
        <p>Your cart is empty. <Link href="/products">Browse products →</Link></p>
      </div>
    );
  }

  return (
    <div className="container section cart-page">
      <h1>Your Cart</h1>

      <div className="cart-items">
        {items.map((item) => (
          <div key={item.productId} className="cart-item card">
            {item.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.thumbnailUrl} alt={item.name} />
            ) : (
              <div className="placeholder" />
            )}
            <div className="info">
              <span className="name">{item.name}</span>
              <span className="price">${item.price.toFixed(2)}</span>
            </div>
            <div className="qty-controls">
              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
            </div>
            <button className="remove" onClick={() => removeItem(item.productId)}>Remove</button>
          </div>
        ))}
      </div>

      <div className="cart-summary card">
        <div className="row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        <div className="row total"><span>Total</span><span>${subtotal.toFixed(2)}</span></div>
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => (window.location.href = "/checkout")}>
          Checkout
        </button>
      </div>

      <style>{`
        .cart-page h1 { font-size: 28px; margin-bottom: 24px; }
        .empty-cart h1 { font-size: 28px; margin-bottom: 12px; }
        .cart-items { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        .cart-item { display: grid; grid-template-columns: 64px 1fr auto auto; gap: 16px; align-items: center; padding: 14px 18px; }
        .cart-item img, .placeholder { width: 64px; height: 64px; object-fit: cover; border-radius: 10px; background: var(--bg-light); }
        .info { display: flex; flex-direction: column; gap: 4px; }
        .name { font-weight: 600; color: var(--navy); font-size: 14px; }
        .price { font-family: var(--font-mono); font-size: 13px; color: var(--text-muted); }
        .qty-controls { display: flex; align-items: center; gap: 10px; }
        .qty-controls button { width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border); background: white; }
        .remove { border: none; background: none; color: #b91c1c; font-size: 13px; }
        .cart-summary { max-width: 320px; padding: 20px; margin-left: auto; }
        .cart-summary .row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 10px; }
        .cart-summary .total { font-weight: 700; color: var(--navy); font-size: 16px; margin-bottom: 16px; }
      `}</style>
    </div>
  );
}
