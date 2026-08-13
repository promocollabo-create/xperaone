import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!product) notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", product.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  return (
    <div className="container section product-detail">
      <div className="product-media">
        {product.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.thumbnail_url} alt={product.name} />
        ) : (
          <div className="placeholder" />
        )}
      </div>

      <div className="product-info">
        {product.categories?.name && <span className="eyebrow">{product.categories.name}</span>}
        <h1>{product.name}</h1>
        <p className="short-desc">{product.short_description}</p>

        <div className="price-block">
          <span className="price">${product.price.toFixed(2)}</span>
          {product.compare_price && product.compare_price > product.price && (
            <span className="old-price">${product.compare_price.toFixed(2)}</span>
          )}
        </div>

        <div className="actions">
          <button className="btn btn-primary" type="button">Buy Now</button>
          <button className="btn btn-secondary" type="button">Add to Cart</button>
        </div>

        {product.description && (
          <div className="long-desc">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
        )}

        {product.features?.length > 0 && (
          <div className="features">
            <h3>Features</h3>
            <ul>
              {product.features.map((f: string, i: number) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {reviews && reviews.length > 0 && (
          <div className="reviews">
            <h3>Reviews</h3>
            {reviews.map((r) => (
              <div key={r.id} className="review">
                <strong>{r.customer_name}</strong> — {"★".repeat(r.rating)}
                <p>{r.review_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .product-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
        .product-media { border-radius: var(--radius-lg); overflow: hidden; aspect-ratio: 1/1; background: var(--bg-light); }
        .product-media img { width: 100%; height: 100%; object-fit: cover; }
        .product-info h1 { font-size: 30px; margin: 8px 0 12px; }
        .short-desc { margin-bottom: 20px; }
        .price-block { display: flex; align-items: baseline; gap: 10px; margin-bottom: 20px; }
        .price { font-family: var(--font-mono); font-size: 26px; font-weight: 500; color: var(--navy); }
        .old-price { font-family: var(--font-mono); text-decoration: line-through; color: #9ca3af; }
        .actions { display: flex; gap: 12px; margin-bottom: 32px; }
        .long-desc, .features, .reviews { margin-top: 28px; }
        .long-desc h3, .features h3, .reviews h3 { font-size: 18px; margin-bottom: 10px; }
        .review { border-top: 1px solid var(--border); padding: 12px 0; }
        @media (max-width: 800px) { .product-detail { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
