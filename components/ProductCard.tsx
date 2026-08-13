import Link from "next/link";
import type { Product } from "@/types/database";
import AddToCartButton from "./AddToCartButton";

// The one product card component every product-bearing section reuses
// (Flash Deals, Featured, Best Sellers, New Arrivals, /products grid...).
// If a new product is added in the admin, it flows through here without
// any frontend code changes — see app/products/page.tsx and the homepage
// sections for how this gets fed live data.
export default function ProductCard({ product }: { product: Product }) {
  const hasDiscount = product.compare_price && product.compare_price > product.price;

  return (
    <Link href={`/product/${product.slug}`} className="product-card card">
      <div className="thumb-wrap">
        {product.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.thumbnail_url} alt={product.name} loading="lazy" />
        ) : (
          <div className="thumb-placeholder" />
        )}
        {hasDiscount && <span className="badge">-{product.discount_percent}%</span>}
      </div>

      <div className="body">
        {product.categories?.name && <span className="category">{product.categories.name}</span>}
        <h3 className="name">{product.name}</h3>

        <div className="rating">
          <span className="stars">★ {product.rating.toFixed(1)}</span>
          <span className="count">({product.review_count})</span>
        </div>

        <div className="price-row">
          <span className="price">${product.price.toFixed(2)}</span>
          {hasDiscount && <span className="old-price">${product.compare_price!.toFixed(2)}</span>}
        </div>

        <div className="actions">
          <AddToCartButton product={product} />
        </div>
      </div>

      <style>{`
        .product-card {
          display: block;
          overflow: hidden;
          text-decoration: none;
        }
        .thumb-wrap {
          position: relative;
          aspect-ratio: 4/3;
          background: var(--bg-light);
        }
        .thumb-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .thumb-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #e5e9f7, #f5f7ff); }
        .badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: var(--gradient-primary);
          color: white;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 999px;
        }
        .body { padding: 16px; }
        .category {
          font-family: var(--font-mono);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--blue);
        }
        .name {
          font-size: 16px;
          margin: 6px 0 8px;
          color: var(--navy);
        }
        .rating { font-size: 13px; color: var(--text-muted); display: flex; gap: 4px; margin-bottom: 10px; }
        .stars { color: #f59e0b; }
        .price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
        .price { font-family: var(--font-mono); font-weight: 500; font-size: 17px; color: var(--navy); }
        .old-price { font-family: var(--font-mono); font-size: 13px; color: #9ca3af; text-decoration: line-through; }
        .btn-sm { padding: 9px 16px; font-size: 13px; width: 100%; }
      `}</style>
    </Link>
  );
}
