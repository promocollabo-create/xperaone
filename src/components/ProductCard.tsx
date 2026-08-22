import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import AddToCartButtons from "@/components/AddToCartButtons";
import type { ProductCardData } from "@/lib/data/products";

export default function ProductCard({ product }: { product: ProductCardData }) {
  const hasSale = product.salePrice && parseFloat(product.salePrice) < parseFloat(product.price);

  return (
    <div className="xp-card group overflow-hidden flex flex-col h-full">
      <Link href={`/product/${product.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-slate-100">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">📦</div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {product.isNew && <span className="xp-badge bg-emerald-500 text-white">New</span>}
          {product.isFeatured && <span className="xp-badge bg-purple-600 text-white">Featured</span>}
        </div>
        {hasSale && <span className="xp-badge bg-rose-500 text-white absolute top-2 right-2">Sale</span>}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        {product.categoryName && (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-purple-500 mb-1">
            {product.categoryName}
          </span>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2 hover:text-purple-700 transition">
            {product.name}
          </h3>
        </Link>
        {product.shortDescription && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.shortDescription}</p>
        )}

        <div className="mt-3 flex items-baseline gap-2">
          {hasSale ? (
            <>
              <span className="text-lg font-bold text-purple-700">{formatMoney(product.salePrice!)}</span>
              <span className="text-sm text-slate-400 line-through">{formatMoney(product.price)}</span>
            </>
          ) : (
            <span className="text-lg font-bold text-slate-900">{formatMoney(product.price)}</span>
          )}
        </div>

        <div className="mt-4 mt-auto pt-3">
          <AddToCartButtons productId={product.id} slug={product.slug} compact />
        </div>
      </div>
    </div>
  );
}
