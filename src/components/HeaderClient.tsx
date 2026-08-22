"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { logoutAction } from "@/lib/auth/actions";

type NavItem = { label: string; href: string };

export default function HeaderClient({
  logoText,
  logoUrl,
  navItems,
  cartCount,
  user,
}: {
  logoText: string;
  logoUrl: string;
  navItems: NavItem[];
  cartCount: number;
  user: { fullName: string; email: string; role: string } | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(`/shop?search=${encodeURIComponent(query)}`);
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="xp-container flex items-center justify-between h-16 gap-4">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={logoText} className="h-8 w-auto" />
            ) : (
              <span className="text-xl sm:text-2xl font-extrabold xp-gradient-text">{logoText}</span>
            )}
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            aria-label="Search"
            className="p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </button>

          <Link href="/cart" aria-label="Cart" className="relative p-2 rounded-lg hover:bg-slate-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="relative" ref={accountRef}>
            <button
              aria-label="Account"
              className="p-2 rounded-lg hover:bg-slate-100 flex items-center gap-1"
              onClick={() => setAccountOpen((v) => !v)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </button>
            {accountOpen && (
              <div className="absolute right-0 mt-2 w-60 xp-card p-2 shadow-xl">
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    {user.role === "admin" && (
                      <Link href="/admin" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 text-purple-700" onClick={() => setAccountOpen(false)}>
                        Admin Dashboard
                      </Link>
                    )}
                    <Link href="/account" className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-50" onClick={() => setAccountOpen(false)}>
                      XperaOne Panel
                    </Link>
                    <Link href="/account/orders" className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-50" onClick={() => setAccountOpen(false)}>
                      My Orders
                    </Link>
                    <Link href="/account/downloads" className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-50" onClick={() => setAccountOpen(false)}>
                      Downloads
                    </Link>
                    <Link href="/account/invoices" className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-50" onClick={() => setAccountOpen(false)}>
                      Invoices
                    </Link>
                    <Link href="/account/profile" className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-50" onClick={() => setAccountOpen(false)}>
                      Profile
                    </Link>
                    <form action={logoutAction}>
                      <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">Logout</button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50 text-purple-700" onClick={() => setAccountOpen(false)}>
                      Login
                    </Link>
                    <Link href="/register" className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-50" onClick={() => setAccountOpen(false)}>
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-slate-100 bg-white">
          <form onSubmit={submitSearch} className="xp-container py-3 flex gap-2">
            <input
              autoFocus
              className="xp-input"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="xp-btn-primary px-4 py-2 text-sm shrink-0" type="submit">
              Search
            </button>
          </form>
        </div>
      )}

      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white">
          <nav className="xp-container py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-purple-50"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
