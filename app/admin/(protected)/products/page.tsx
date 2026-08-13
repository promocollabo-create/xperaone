import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteProduct, toggleProductStatus } from "./actions";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary">+ Add Product</Link>
      </div>

      <div className="card table-card">
        <table>
          <thead>
            <tr><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th>Flags</th><th></th></tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.categories?.name ?? "—"}</td>
                <td>${Number(p.price).toFixed(2)}</td>
                <td>
                  <form action={toggleProductStatus}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="status" value={p.status === "published" ? "draft" : "published"} />
                    <button type="submit" className={`pill-btn ${p.status}`}>{p.status}</button>
                  </form>
                </td>
                <td className="flags">
                  {p.featured && <span className="tag">Featured</span>}
                  {p.best_seller && <span className="tag">Best Seller</span>}
                  {p.new_arrival && <span className="tag">New</span>}
                  {p.flash_deal && <span className="tag">Flash</span>}
                </td>
                <td>
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="delete-btn">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr><td colSpan={6}>No products yet. Click "Add Product" to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .table-card { padding: 8px 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { text-align: left; padding: 12px 8px; font-size: 12px; color: var(--text-muted); border-bottom: 1px solid var(--border); }
        td { padding: 12px 8px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        .pill-btn { border: none; font-size: 12px; padding: 4px 10px; border-radius: 999px; background: var(--bg-light); }
        .pill-btn.published { background: #dcfce7; color: #166534; }
        .flags { display: flex; gap: 6px; flex-wrap: wrap; }
        .tag { font-size: 11px; background: rgba(37,99,235,0.08); color: var(--blue); padding: 2px 8px; border-radius: 999px; }
        .delete-btn { border: none; background: none; color: #b91c1c; font-size: 13px; }
      `}</style>
    </div>
  );
}
