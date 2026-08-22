import { notFound } from "next/navigation";
import { getCategoryBySlug, getShopProducts } from "@/lib/data/products";
import ProductGrid from "@/components/ProductGrid";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category ? category.name : "Category" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { items, total } = await getShopProducts({ categorySlug: slug, pageSize: 48 });

  return (
    <div>
      <div className="bg-[#150f28] text-white py-14">
        <div className="xp-container">
          <h1 className="text-2xl sm:text-4xl font-extrabold">{category.name}</h1>
          {category.description && <p className="text-slate-300 mt-3 max-w-xl">{category.description}</p>}
        </div>
      </div>
      <div className="xp-container py-10">
        <p className="text-sm text-slate-500 mb-6">{total} product{total === 1 ? "" : "s"} in this category</p>
        <ProductGrid products={items} />
      </div>
    </div>
  );
}
