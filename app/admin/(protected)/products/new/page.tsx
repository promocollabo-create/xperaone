import { createClient } from "@/lib/supabase/server";
import { createProduct } from "../actions";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id, name").order("display_order");

  return (
    <div>
      <h1 className="page-title">Add Product</h1>

      {error && <div className="error-box">{error}</div>}

      <form action={createProduct} className="card product-form">
        <label>Name<input type="text" name="name" required /></label>

        <label>Category
          <select name="category_id">
            <option value="">— None —</option>
            {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>

        <div className="row">
          <label>Price (USD)<input type="number" step="0.01" name="price" required /></label>
          <label>Compare-at Price (optional)<input type="number" step="0.01" name="compare_price" /></label>
        </div>

        <label>Thumbnail Image URL<input type="url" name="thumbnail_url" placeholder="https://...supabase.co/storage/v1/object/public/media/..." /></label>

        <label>Short Description<input type="text" name="short_description" /></label>
        <label>Full Description<textarea name="description" rows={4} /></label>

        <div className="row checkboxes">
          <label className="checkbox"><input type="checkbox" name="featured" /> Featured</label>
          <label className="checkbox"><input type="checkbox" name="best_seller" /> Best Seller</label>
          <label className="checkbox"><input type="checkbox" name="new_arrival" defaultChecked /> New Arrival</label>
          <label className="checkbox"><input type="checkbox" name="flash_deal" /> Flash Deal</label>
        </div>

        <label>Status
          <select name="status" defaultValue="draft">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>

        <button type="submit" className="btn btn-primary">Save Product</button>
      </form>

      <style>{`
        .product-form { max-width: 560px; padding: 28px; display: flex; flex-direction: column; gap: 16px; }
        .product-form label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: var(--navy); }
        .product-form input, .product-form select, .product-form textarea {
          font-family: var(--font-body); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 14px; font-weight: 400;
        }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .checkboxes { grid-template-columns: repeat(2, 1fr); }
        .checkbox { flex-direction: row; align-items: center; gap: 8px; font-weight: 500; }
        .error-box { background: #fef2f2; color: #b91c1c; padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 13px; }
      `}</style>
    </div>
  );
}
