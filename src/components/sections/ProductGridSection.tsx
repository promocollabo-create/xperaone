import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import { getFeaturedProducts, getNewProducts, getLatestProducts } from "@/lib/data/products";
import { num, str, type SectionInstance } from "./types";

export default async function ProductGridSection({ section }: { section: SectionInstance }) {
  const mode = str(section.data, "mode", "latest");
  const limit = num(section.data, "limit", 4);
  const products =
    mode === "featured" ? await getFeaturedProducts(limit) : mode === "new" ? await getNewProducts(limit) : await getLatestProducts(limit);
  if (products.length === 0) return null;
  const title = str(section.data, "title", mode === "new" ? "New Arrivals" : "Best Sellers");
  const subtitle = str(section.data, "subtitle");

  return (
    <section className="bg-purple-50/40 py-12 sm:py-16">
      <div className="xp-container">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{title}</h2>
            {subtitle && <p className="text-slate-500 mt-2">{subtitle}</p>}
          </div>
          <Link href="/shop" className="text-sm font-semibold text-purple-700 hover:underline shrink-0">
            View All →
          </Link>
        </div>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
