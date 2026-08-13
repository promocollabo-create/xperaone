import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0;

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <div className="container section">
      <h1 style={{ fontSize: 32, marginBottom: 24 }}>All Products</h1>
      <div className="products-grid">
        {(products ?? []).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {(!products || products.length === 0) && <p>No products published yet.</p>}
      </div>
      <style>{`
        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) { .products-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; } }
      `}</style>
    </div>
  );
}
