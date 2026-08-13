import Link from "next/link";
import type { Category } from "@/types/database";

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="section category-section">
      <div className="container">
        <span className="eyebrow">Browse</span>
        <h2>Shop by Category</h2>

        <div className="category-grid">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`} className="category-item">
              <div className="category-icon">
                {cat.icon_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cat.icon_url} alt="" />
                ) : (
                  <span>{cat.name.charAt(0)}</span>
                )}
              </div>
              <span className="category-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .category-section h2 { margin: 6px 0 28px; font-size: 28px; }
        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
          gap: 20px;
        }
        .category-item { display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
        .category-icon {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: var(--gradient-primary);
          display: flex; align-items: center; justify-content: center;
          color: white; font-family: var(--font-display); font-weight: 700; font-size: 22px;
          transition: transform 200ms ease;
        }
        .category-icon img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .category-item:hover .category-icon { transform: scale(1.06); }
        .category-name { font-size: 13px; font-weight: 500; color: var(--navy); }
      `}</style>
    </section>
  );
}
