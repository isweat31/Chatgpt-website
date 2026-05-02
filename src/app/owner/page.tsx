"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function StatusLabel({ product }: { product: Product }) {
  if (!product.active) return <span className="ow-badge ow-badge-gray">Hidden</span>;
  if (product.stock === 0) return <span className="ow-badge ow-badge-red">Out of stock</span>;
  if (product.stock <= 5) return <span className="ow-badge ow-badge-amber">Low stock</span>;
  return <span className="ow-badge ow-badge-green">Live</span>;
}

export default function OwnerDashboard() {
  const { products, refresh } = useProducts(false);

  const stats = useMemo(() => {
    const live = products.filter((p) => p.active && p.stock > 0).length;
    const hidden = products.filter((p) => !p.active).length;
    const lowStock = products.filter((p) => p.active && p.stock > 0 && p.stock <= 5).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    return { live, hidden, lowStock, outOfStock, inventoryValue };
  }, [products]);

  const recent = useMemo(
    () =>
      [...products]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 6),
    [products]
  );

  return (
    <div className="ow-page">
      <div className="ow-page-head">
        <div>
          <h1 className="ow-page-title">Dashboard</h1>
          <p className="ow-page-sub">Your store at a glance</p>
        </div>
        <div className="ow-page-actions">
          <button onClick={refresh} className="ow-btn-ghost">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7a6 6 0 106-6 6 6 0 00-4.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M1 3v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Refresh
          </button>
          <Link href="/owner/products" className="ow-btn-primary">
            Manage Products
          </Link>
        </div>
      </div>

      <div className="ow-stats-grid">
        <div className="ow-stat-card">
          <span className="ow-stat-label">Total Products</span>
          <span className="ow-stat-value">{products.length}</span>
        </div>
        <div className="ow-stat-card ow-stat-green">
          <span className="ow-stat-label">Live</span>
          <span className="ow-stat-value">{stats.live}</span>
          <span className="ow-stat-hint">active &amp; in stock</span>
        </div>
        <div className="ow-stat-card ow-stat-gray">
          <span className="ow-stat-label">Hidden</span>
          <span className="ow-stat-value">{stats.hidden}</span>
          <span className="ow-stat-hint">not visible in shop</span>
        </div>
        <div className="ow-stat-card ow-stat-amber">
          <span className="ow-stat-label">Low Stock</span>
          <span className="ow-stat-value">{stats.lowStock}</span>
          <span className="ow-stat-hint">5 or fewer remaining</span>
        </div>
        <div className="ow-stat-card ow-stat-red">
          <span className="ow-stat-label">Out of Stock</span>
          <span className="ow-stat-value">{stats.outOfStock}</span>
          <span className="ow-stat-hint">hidden from shop</span>
        </div>
        <div className="ow-stat-card ow-stat-blue">
          <span className="ow-stat-label">Inventory Value</span>
          <span className="ow-stat-value ow-stat-value-sm">
            ${stats.inventoryValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="ow-stat-hint">price × stock</span>
        </div>
      </div>

      <div className="ow-dashboard-grid">
        <section className="ow-card">
          <div className="ow-card-head">
            <h2 className="ow-card-title">Quick Actions</h2>
          </div>
          <div className="ow-actions-list">
            <Link href="/owner/products" className="ow-action-item">
              <div className="ow-action-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 5.5l7-3.5 7 3.5v7l-7 3.5-7-3.5v-7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                  <path d="M9 2v14M2 5.5l7 3.5 7-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="ow-action-title">Product Manager</p>
                <p className="ow-action-desc">Add, edit, delete and organise products</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ow-action-arrow">
                <path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/shop" target="_blank" className="ow-action-item">
              <div className="ow-action-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M1.5 7h15M3.5 7V3.5h11V7M1.5 7l1.75 7.5h13.5L18.5 7" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                  <rect x="7" y="10" width="4" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </div>
              <div>
                <p className="ow-action-title">View Live Shop</p>
                <p className="ow-action-desc">See how customers see your store</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ow-action-arrow">
                <path d="M4 12L12 4M6 4h6v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </section>

        <section className="ow-card">
          <div className="ow-card-head">
            <h2 className="ow-card-title">Recent Activity</h2>
            <Link href="/owner/products" className="ow-card-link">See all</Link>
          </div>

          {recent.length === 0 ? (
            <div className="ow-empty-state">
              <p>No products yet.</p>
              <Link href="/owner/products" className="ow-btn-primary" style={{ marginTop: 12, display: "inline-block" }}>
                Add your first product
              </Link>
            </div>
          ) : (
            <div className="ow-recent-list">
              {recent.map((p) => (
                <div key={p.id} className="ow-recent-row">
                  <div className="ow-recent-img">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="ow-thumb" />
                    ) : (
                      <div className="ow-thumb-placeholder">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M1 9.5l3-3 2.5 2.5 2-2L13 12" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                          <circle cx="9.5" cy="4.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="ow-recent-info">
                    <span className="ow-recent-name">{p.name}</span>
                    {p.category && (
                      <span className="ow-recent-cat">{p.category}</span>
                    )}
                  </div>
                  <div className="ow-recent-meta">
                    <StatusLabel product={p} />
                    <span className="ow-recent-time">{relativeTime(p.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
