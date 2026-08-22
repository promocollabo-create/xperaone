import Link from "next/link";
import { getShopProducts, getAllCategories } from "@/lib/data/products";
import ProductGrid from "@/components/ProductGrid";

export const metadata = { title: "Store / Shop" };

const PAGE_SIZE = 12;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const sort = (params.sort as "newest" | "price_asc" | "price_desc" | "name_asc") || "newest";

  const [{ items, total }, categories] = await Promise.all([
    getShopProducts({ search: params.search, categorySlug: params.category, sort, page, pageSize: PAGE_SIZE }),
    getAllCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function buildUrl(overrides: Record<string, string | undefined>) {
    const q = new URLSearchParams();
    const merged = { search: params.search, category: params.category, sort: params.sort, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) q.set(k, v);
    });
    const qs = q.toString();
    return `/shop${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="xp-container py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Store / Shop</h1>
        <p className="text-slate-500 mt-1 text-sm">{total} product{total === 1 ? "" : "s"} available</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-6">
          <form action="/shop" className="space-y-2">
            <label className="text-xs font-semibold uppercase text-slate-500">Search</label>
            <input type="text" name="search" defaultValue={params.search} placeholder="Search products..." className="xp-input" />
            {params.category && <input type="hidden" name="category" value={params.category} />}
          </form>

          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Categories</p>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href={buildUrl({ category: undefined, page: undefined })}
                  className={`block px-3 py-1.5 rounded-lg ${!params.category ? "bg-purple-100 text-purple-700 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  All Categories
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={buildUrl({ category: cat.slug, page: undefined })}
                    className={`block px-3 py-1.5 rounded-lg ${params.category === cat.slug ? "bg-purple-100 text-purple-700 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <p className="text-sm text-slate-500">
              {params.search ? (
                <>
                  Results for <span className="font-semibold text-slate-800">&quot;{params.search}&quot;</span>
                </>
              ) : (
                "Browse all products"
              )}
            </p>
            <form action="/shop" className="flex items-center gap-2">
              {params.search && <input type="hidden" name="search" value={params.search} />}
              {params.category && <input type="hidden" name="category" value={params.category} />}
              <label className="text-xs text-slate-500">Sort:</label>
              <select name="sort" defaultValue={sort} className="xp-input py-1.5" onChange={(e) => e.currentTarget.form?.requestSubmit()}>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A-Z</option>
              </select>
            </form>
          </div>

          <ProductGrid products={items} />

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildUrl({ page: String(p) })}
                  className={`h-9 w-9 flex items-center justify-center rounded-lg text-sm font-semibold ${
                    p === page ? "xp-gradient-bg text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
