import { createClient } from "@/lib/supabase/server";
import { createCategory, deleteCategory, toggleCategory } from "./actions";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("display_order");

  return (
    <div>
      <h1 className="page-title">Categories</h1>

      <form action={createCategory} className="card add-form">
        <input type="text" name="name" placeholder="Category name" required />
        <input type="url" name="icon_url" placeholder="Icon image URL (optional)" />
        <input type="number" name="display_order" placeholder="Order" defaultValue={0} style={{ width: 90 }} />
        <button type="submit" className="btn btn-primary">Add</button>
      </form>

      <div className="card table-card">
        <table>
          <thead><tr><th>Name</th><th>Slug</th><th>Order</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {(categories ?? []).map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.slug}</td>
                <td>{c.display_order}</td>
                <td>
                  <form action={toggleCategory}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="is_active" value={(!c.is_active).toString()} />
                    <button type="submit" className={`pill-btn ${c.is_active ? "published" : ""}`}>
                      {c.is_active ? "Active" : "Hidden"}
                    </button>
                  </form>
                </td>
                <td>
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="delete-btn">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .add-form { display: flex; gap: 10px; padding: 18px 24px; margin-bottom: 20px; }
        .add-form input { flex: 1; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 14px; }
        .table-card { padding: 8px 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { text-align: left; padding: 12px 8px; font-size: 12px; color: var(--text-muted); border-bottom: 1px solid var(--border); }
        td { padding: 12px 8px; border-bottom: 1px solid var(--border); }
        .pill-btn { border: none; font-size: 12px; padding: 4px 10px; border-radius: 999px; background: var(--bg-light); }
        .pill-btn.published { background: #dcfce7; color: #166534; }
        .delete-btn { border: none; background: none; color: #b91c1c; font-size: 13px; }
      `}</style>
    </div>
  );
}
