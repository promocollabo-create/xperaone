import Link from "next/link";

interface HeaderProps {
  siteName: string;
  logoUrl: string | null;
  categories: { name: string; slug: string }[];
}

// Server component: renders the admin-controlled site name/logo directly
// from the DB, so a logo change in Website Settings shows up on next
// request with no frontend code changes.
export default function Header({ siteName, logoUrl }: HeaderProps) {
  const navLinks = [
    { label: "Products", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "Deals", href: "/deals" },
    { label: "Best Sellers", href: "/best-sellers" },
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} height={28} />
          ) : (
            <span className="logo-text">{siteName}</span>
          )}
        </Link>

        <nav className="main-nav">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link href="/products" aria-label="Search" className="icon-btn">⌕</Link>
          <Link href="/login" aria-label="Account" className="icon-btn">☺</Link>
          <Link href="/cart" aria-label="Cart" className="icon-btn">🛒</Link>
        </div>
      </div>

      <style>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--border);
        }
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          gap: 24px;
        }
        .logo-text {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 20px;
          color: var(--navy);
        }
        .main-nav {
          display: flex;
          gap: 28px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text);
        }
        .main-nav a:hover { color: var(--blue); }
        .header-actions {
          display: flex;
          gap: 8px;
        }
        .icon-btn {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
        }
        .icon-btn:hover { background: var(--bg-light); }
        @media (max-width: 900px) {
          .main-nav { display: none; }
        }
      `}</style>
    </header>
  );
}
