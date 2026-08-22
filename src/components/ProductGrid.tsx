import ProductCard from "@/components/ProductCard";
import type { ProductCardData } from "@/lib/data/products";

export default function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <p className="text-4xl mb-3">🔍</p>
        <p className="font-medium">No products found.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
