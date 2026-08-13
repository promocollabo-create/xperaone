import Link from "next/link";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/database";

interface ProductRailProps {
  eyebrow: string;
  heading: string;
  products: Product[];
  viewAllHref?: string;
}

// Powers Flash Deals / Trending / Best Sellers / New Arrivals — the only
// thing that differs between those homepage sections is which query
// populated `products` (see app/page.tsx). The rendering is identical,
// so a new product with the right flag set (featured/best_seller/...)
// shows up automatically.
export default function ProductRail({ eyebrow, heading, products, viewAllHref }: ProductRailProps) {
  if (products.length === 0) return null;

  return (
    <section className="section product-rail">
      <div className="container">
        <div className="rail-header">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2>{heading}</h2>
          </div>
          {viewAllHref && (
            <Link href={viewAllHref} className="view-all">
              View all →
            </Link>
          )}
        </div>

        <div className="rail-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      <style>{`
        .rail-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 24px; }
        .rail-header h2 { margin-top: 6px; font-size: 28px; }
        .view-all { font-size: 14px; font-weight: 600; color: var(--blue); }
        .rail-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 1024px) { .rail-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) {
          .rail-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
        }
      `}</style>
    </section>
  );
}
