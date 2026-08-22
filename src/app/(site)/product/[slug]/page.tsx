import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import ProductGrid from "@/components/ProductGrid";
import AddToCartButtons from "@/components/AddToCartButtons";
import { formatMoney } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription || undefined,
    openGraph: {
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.shortDescription || undefined,
      images: product.ogImage ? [product.ogImage] : product.images[0] ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id, 4);
  const hasSale = product.salePrice && parseFloat(product.salePrice) < parseFloat(product.price);
  const features = (product.features as string[]) ?? [];

  return (
    <div className="xp-container py-10">
      <nav className="text-xs text-slate-500 mb-6 flex flex-wrap gap-1">
        <Link href="/" className="hover:text-purple-700">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-purple-700">Shop</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/category/${product.category.slug}`} className="hover:text-purple-700">{product.category.name}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div className="xp-card overflow-hidden aspect-[4/3] mb-3">
            {product.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-slate-300">📦</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(1).map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={img.id} src={img.url} alt={product.name} className="xp-card aspect-square object-cover" />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex gap-2 mb-3">
            {product.isNew && <span className="xp-badge bg-emerald-500 text-white">New</span>}
            {product.isFeatured && <span className="xp-badge bg-purple-600 text-white">Featured</span>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{product.name}</h1>
          {product.shortDescription && <p className="text-slate-500 mt-2">{product.shortDescription}</p>}

          <div className="mt-5 flex items-baseline gap-3">
            {hasSale ? (
              <>
                <span className="text-3xl font-extrabold text-purple-700">{formatMoney(product.salePrice!)}</span>
                <span className="text-lg text-slate-400 line-through">{formatMoney(product.price)}</span>
              </>
            ) : (
              <span className="text-3xl font-extrabold text-slate-900">{formatMoney(product.price)}</span>
            )}
          </div>

          {product.license && (
            <p className="text-xs text-slate-500 mt-2">
              License: <span className="font-semibold text-slate-700">{product.license}</span>
            </p>
          )}

          <div className="mt-6 max-w-sm">
            <AddToCartButtons productId={product.id} slug={product.slug} />
          </div>

          {features.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-slate-800 mb-3">What&apos;s Included</h3>
              <ul className="space-y-2">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-emerald-500 mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {product.description && (
        <div className="mt-14 max-w-3xl">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Description</h2>
          <p className="text-slate-600 leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Related Products</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
