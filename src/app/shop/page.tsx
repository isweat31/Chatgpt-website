"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { STORAGE_KEY } from "@/lib/productStorage";
import type { Product } from "@/types/product";

function ProductCard({ product }: { product: Product }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          style={{ width: "100%", height: 200, objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: 200,
            background: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "#9ca3af",
          }}
        >
          No image
        </div>
      )}

      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>
            {product.name}
          </h3>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>
            ${product.price.toFixed(2)}
          </span>
        </div>

        {product.variant && (
          <span
            style={{
              alignSelf: "flex-start",
              fontSize: 12,
              background: "#f3f4f6",
              color: "#6b7280",
              padding: "2px 10px",
              borderRadius: 12,
            }}
          >
            {product.variant}
          </span>
        )}

        {product.category && (
          <span style={{ fontSize: 12, color: "#6b7280" }}>{product.category}</span>
        )}

        {product.description && (
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
            {product.description}
          </p>
        )}

        <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: product.stock <= 5 ? "#dc2626" : "#6b7280" }}>
            {product.stock <= 5 ? `Only ${product.stock} left` : `${product.stock} in stock`}
          </span>
          <button
            style={{
              padding: "8px 18px",
              background: "#111827",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const { products, refresh } = useProducts();
  const [showDebug, setShowDebug] = useState(false);

  const visible = products.filter((p) => p.active && p.stock > 0);
  const rawCount = products.length;

  return (
    <main style={{ maxWidth: 1100, margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Shop</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={refresh}
            style={{
              padding: "8px 18px",
              background: "#fff",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Refresh
          </button>
          <button
            onClick={() => setShowDebug((v) => !v)}
            style={{
              padding: "8px 18px",
              background: "#fff",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {showDebug ? "Hide Debug" : "Debug"}
          </button>
        </div>
      </div>

      {showDebug && (
        <div
          style={{
            background: "#1e1e1e",
            color: "#d4d4d4",
            borderRadius: 8,
            padding: "16px 20px",
            marginBottom: 28,
            fontSize: 13,
            fontFamily: "monospace",
            lineHeight: 1.7,
          }}
        >
          <div style={{ color: "#9cdcfe", fontWeight: 700, marginBottom: 6 }}>
            Debug Panel — STORE_PRODS
          </div>
          <div>
            Storage key: <span style={{ color: "#ce9178" }}>&quot;{STORAGE_KEY}&quot;</span>
          </div>
          <div>
            Total products in storage: <span style={{ color: "#b5cea8" }}>{rawCount}</span>
          </div>
          <div>
            Active + in-stock (shown): <span style={{ color: "#b5cea8" }}>{visible.length}</span>
          </div>
          <div>
            Hidden (inactive or out of stock):{" "}
            <span style={{ color: "#b5cea8" }}>{rawCount - visible.length}</span>
          </div>
          {products.length > 0 && (
            <details style={{ marginTop: 10 }}>
              <summary style={{ cursor: "pointer", color: "#9cdcfe" }}>View raw entries</summary>
              <pre
                style={{
                  marginTop: 8,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  color: "#d4d4d4",
                  fontSize: 12,
                }}
              >
                {JSON.stringify(
                  products.map((p) => ({
                    id: p.id,
                    name: p.name,
                    active: p.active,
                    stock: p.stock,
                    price: p.price,
                  })),
                  null,
                  2
                )}
              </pre>
            </details>
          )}
        </div>
      )}

      {visible.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            color: "#6b7280",
            border: "2px dashed #e5e7eb",
            borderRadius: 12,
          }}
        >
          <p style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>No products available</p>
          <p style={{ margin: "8px 0 0", fontSize: 14 }}>
            Check back soon or ask the owner to add products.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 24,
          }}
        >
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
