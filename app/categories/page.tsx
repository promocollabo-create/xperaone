import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 0;

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  return (
    <div className="container section">
      <h1 style={{ fontSize: 32, marginBottom: 24 }}>All Categories</h1>
      <div className="cat-grid">
        {(categories ?? []).map((c) => (
          <Link key={c.id} href={`/categories/${c.slug}`} className="cat-card card">
            <div className="cat-icon">{c.icon_url ? <img src={c.icon_url} alt="" /> : c.name.charAt(0)}</div>
            <h3>{c.name}</h3>
            {c.description && <p>{c.description}</p>}
          </Link>
        ))}
      </div>
      <style>{`
        .cat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        .cat-card { padding: 24px; text-align: center; }
        .cat-icon {
          width: 56px; height: 56px; border-radius: 50%; margin: 0 auto 14px;
          background: var(--gradient-primary); color: white; display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-weight: 700; overflow: hidden;
        }
        .cat-icon img { width: 100%; height: 100%; object-fit: cover; }
        h3 { font-size: 16px; margin-bottom: 6px; }
        p { font-size: 13px; }
        @media (max-width: 900px) { .cat-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}
