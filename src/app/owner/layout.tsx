"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 5l6-3 6 3v6l-6 3-6-3V5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 2v12M2 5l6 3 6-3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function IconStore() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 6h14M3 6V3h10v3M1 6l1.5 7h11L15 6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="6" y="9" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function OwnerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="ow-shell">
      <aside className="ow-sidebar">
        <div className="ow-brand">
          Boutique<em>OS</em>
        </div>

        <nav className="ow-nav">
          <p className="ow-nav-label">Menu</p>
          <Link
            href="/owner"
            className={`ow-nav-item${pathname === "/owner" ? " ow-nav-active" : ""}`}
          >
            <IconGrid />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/owner/products"
            className={`ow-nav-item${pathname === "/owner/products" ? " ow-nav-active" : ""}`}
          >
            <IconBox />
            <span>Products</span>
          </Link>
        </nav>

        <div className="ow-sidebar-footer">
          <Link href="/shop" target="_blank" className="ow-nav-item ow-nav-shop">
            <IconStore />
            <span>View Shop</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: "auto", opacity: 0.5 }}>
              <path d="M2 8L8 2M4 2h4v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </aside>

      <div className="ow-mobile-header">
        <span className="ow-brand-mobile">
          Boutique<em>OS</em>
        </span>
        <div className="ow-mobile-nav">
          <Link href="/owner" className={`ow-mobile-tab${pathname === "/owner" ? " ow-mobile-tab-active" : ""}`}>
            Dashboard
          </Link>
          <Link href="/owner/products" className={`ow-mobile-tab${pathname === "/owner/products" ? " ow-mobile-tab-active" : ""}`}>
            Products
          </Link>
          <Link href="/shop" target="_blank" className="ow-mobile-tab">
            Shop ↗
          </Link>
        </div>
      </div>

      <main className="ow-main">{children}</main>
    </div>
  );
}
