import Link from "next/link";
import { getAllCategories } from "@/lib/data/products";
import { str, type SectionInstance } from "./types";

export default async function CategoriesSection({ section }: { section: SectionInstance }) {
  const categories = await getAllCategories();
  if (categories.length === 0) return null;
  const title = str(section.data, "title", "Shop by Category");
  const subtitle = str(section.data, "subtitle");

  return (
    <section className="xp-container py-12 sm:py-16">
      <div className="mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{title}</h2>
        {subtitle && <p className="text-slate-500 mt-2">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="xp-card overflow-hidden group flex flex-col text-center"
          >
            <div className="aspect-square bg-slate-100 overflow-hidden">
              {cat.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl text-slate-300">🗂️</div>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-slate-800 group-hover:text-purple-700 transition line-clamp-1">
                {cat.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
