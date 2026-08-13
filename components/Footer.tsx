import Link from "next/link";

interface FooterProps {
  settings: {
    site_name?: string;
    footer_text?: string | null;
    contact_email?: string | null;
  } | null;
}

export default function Footer({ settings }: FooterProps) {
  const columns = [
    {
      title: "Shop",
      links: [
        { label: "All Products", href: "/products" },
        { label: "Best Sellers", href: "/best-sellers" },
        { label: "Flash Deals", href: "/deals" },
        { label: "New Arrivals", href: "/new-arrivals" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Support & Legal",
      links: [
        { label: "My Account", href: "/customer/dashboard" },
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Refund Policy", href: "/refund-policy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <span className="logo-text">{settings?.site_name ?? "XperaOne"}</span>
          <p>{settings?.footer_text ?? "Premium digital products & software, delivered instantly."}</p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {settings?.site_name ?? "XperaOne"}. All rights reserved.</span>
        {settings?.contact_email && <span>{settings.contact_email}</span>}
      </div>

      <style>{`
        .site-footer {
          background: var(--navy);
          color: #cbd5f5;
          padding: 56px 0 24px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 32px;
        }
        .footer-brand .logo-text {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 20px;
          color: var(--white);
        }
        .footer-brand p {
          color: #93a2d6;
          margin-top: 12px;
          max-width: 280px;
        }
        h4 {
          color: var(--white);
          font-size: 14px;
          margin-bottom: 14px;
        }
        ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        ul a { color: #93a2d6; font-size: 14px; }
        ul a:hover { color: var(--white); }
        .footer-bottom {
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #7c8bc4;
        }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr; }
          .footer-bottom { flex-direction: column; gap: 8px; }
        }
      `}</style>
    </footer>
  );
}
