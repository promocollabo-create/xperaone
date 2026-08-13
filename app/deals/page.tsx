import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0;

// Same query shape as app/products/page.tsx, filtered to flash_deal = true.
// If admin toggles a product's "Flash Deal" flag off, it drops off this
// page and the homepage Flash Deals rail on the next request — no code
// change needed.
export default async function DealsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("status", "published")
    .eq("flash_deal", true)
    .order("created_at", { ascending: false });

  return (
    <div className="container section">
      <span className="eyebrow">Limited Time</span>
      <h1 style={{ fontSize: 32, margin: "6px 0 24px" }}>Flash Deals</h1>
      <div className="products-grid">
        {(products ?? []).map((p) => <ProductCard key={p.id} product={p} />)}
        {(!products || products.length === 0) && <p>No active flash deals right now — check back soon.</p>}
      </div>
      <style>{`
        .products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        @media (max-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) { .products-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; } }
      `}</style>
    </div>
  );
}
