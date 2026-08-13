import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase.from("categories").select("*").eq("slug", slug).single();
  if (!category) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("category_id", category.id)
    .eq("status", "published");

  return (
    <div className="container section">
      <span className="eyebrow">Category</span>
      <h1 style={{ fontSize: 32, margin: "6px 0 24px" }}>{category.name}</h1>
      <div className="products-grid">
        {(products ?? []).map((p) => <ProductCard key={p.id} product={p} />)}
        {(!products || products.length === 0) && <p>No products in this category yet.</p>}
      </div>
      <style>{`
        .products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        @media (max-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) { .products-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; } }
      `}</style>
    </div>
  );
}
