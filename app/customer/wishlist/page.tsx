import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export const revalidate = 0;

export default async function WishlistPage() {
  const supabase = await createClient();

  // RLS restricts this to the logged-in customer's own wishlist rows.
  const { data: wishlisted } = await supabase
    .from("wishlists")
    .select("product_id, products(*, categories(name, slug))")
    .order("created_at", { ascending: false });

  const products = (wishlisted ?? []).map((w: any) => w.products).filter(Boolean);

  return (
    <div className="container section">
      <div className="dash-nav"><Link href="/customer/dashboard">← Back to Dashboard</Link></div>
      <h1 style={{ fontSize: 28, margin: "12px 0 24px" }}>My Wishlist</h1>

      {products.length === 0 ? (
        <p>Nothing saved yet. <Link href="/products">Browse products →</Link></p>
      ) : (
        <div className="products-grid">
          {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      <style>{`
        .dash-nav a { font-size: 13px; color: var(--blue); font-weight: 600; }
        .products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        @media (max-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) { .products-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; } }
      `}</style>
    </div>
  );
}
