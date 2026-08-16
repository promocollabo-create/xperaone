import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOutAdmin } from "./actions";

// middleware.ts already blocks non-admins from ever reaching anything under
// app/admin/(protected)/*, so this layout can assume `user` is a real admin.
const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Products", href: "/admin/products" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Homepage", href: "/admin/homepage" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Payment Settings", href: "/admin/settings/payment" },
  { label: "Email Settings", href: "/admin/settings/email" },
  { label: "Settings", href: "/admin/settings" },
];

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo">XperaOne <span>Admin</span></div>
        <nav>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </nav>
        <div className="admin-footer">
          <span className="admin-email">{user?.email}</span>
          <form action={signOutAdmin}>
            <button type="submit" className="logout-btn">Log out</button>
          </form>
        </div>
      </aside>
      <div className="admin-content">{children}</div>

      <style>{`
        .admin-shell { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }
        .admin-sidebar {
          background: var(--navy);
          color: #cbd5f5;
          padding: 24px 18px;
          display: flex;
          flex-direction: column;
        }
        .admin-logo { font-family: var(--font-display); font-weight: 700; color: white; font-size: 17px; margin-bottom: 28px; }
        .admin-logo span { color: var(--blue-light); font-weight: 500; }
        .admin-sidebar nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .admin-sidebar nav a { padding: 10px 12px; border-radius: var(--radius-sm); font-size: 14px; }
        .admin-sidebar nav a:hover { background: rgba(255,255,255,0.06); color: white; }
        .admin-footer { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; display: flex; flex-direction: column; gap: 10px; }
        .admin-email { font-size: 12px; color: #7c8bc4; word-break: break-all; }
        .logout-btn { background: none; border: 1px solid rgba(255,255,255,0.15); color: #cbd5f5; font-size: 13px; padding: 8px; border-radius: var(--radius-sm); width: 100%; }
        .logout-btn:hover { border-color: var(--blue-light); color: white; }
        .admin-content { padding: 32px 40px; background: var(--bg-light); min-height: 100vh; }
        @media (max-width: 900px) {
          .admin-shell { grid-template-columns: 1fr; }
          .admin-sidebar { display: none; }
        }
      `}</style>
    </div>
  );
}
