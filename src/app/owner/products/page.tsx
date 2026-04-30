"use client";

import { useState, useRef, useCallback, ChangeEvent, FormEvent } from "react";
import { useProducts } from "@/hooks/useProducts";
import {
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/productStorage";
import type { Product, NewProduct } from "@/types/product";

type FormState = {
  name: string;
  price: string;
  description: string;
  image: string;
  category: string;
  stock: string;
  active: boolean;
  variant: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  price: "",
  description: "",
  image: "",
  category: "",
  stock: "",
  active: true,
  variant: "",
};

function productToForm(p: Product): FormState {
  return {
    name: p.name,
    price: String(p.price),
    description: p.description,
    image: p.image,
    category: p.category,
    stock: String(p.stock),
    active: p.active,
    variant: p.variant ?? "",
  };
}

function formToProduct(f: FormState): NewProduct {
  return {
    name: f.name.trim(),
    price: parseFloat(f.price),
    description: f.description.trim(),
    image: f.image,
    category: f.category.trim(),
    stock: parseInt(f.stock, 10),
    active: f.active,
    ...(f.variant.trim() ? { variant: f.variant.trim() } : {}),
  };
}

type Mode = "list" | "add" | "edit";

export default function OwnerProductsPage() {
  const { products, refresh } = useProducts();
  const [mode, setMode] = useState<Mode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const openAdd = useCallback(() => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError("");
    setMode("add");
  }, []);

  const openEdit = useCallback((p: Product) => {
    setForm(productToForm(p));
    setEditingId(p.id);
    setFormError("");
    setMode("edit");
  }, []);

  const closeForm = useCallback(() => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError("");
    setMode("list");
  }, []);

  const handleField = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = e.target;
      const value =
        target.type === "checkbox"
          ? (target as HTMLInputElement).checked
          : target.value;
      setForm((prev) => ({ ...prev, [target.name]: value }));
    },
    []
  );

  const handleImageUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      if (!form.name.trim()) {
        setFormError("Product name is required.");
        return;
      }
      if (form.price === "" || isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0) {
        setFormError("A valid price is required.");
        return;
      }
      if (form.stock === "" || isNaN(parseInt(form.stock, 10)) || parseInt(form.stock, 10) < 0) {
        setFormError("A valid stock quantity is required.");
        return;
      }

      const data = formToProduct(form);

      if (mode === "add") {
        addProduct(data);
      } else if (mode === "edit" && editingId) {
        updateProduct(editingId, data);
      }

      refresh();
      closeForm();
    },
    [form, mode, editingId, refresh, closeForm]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!window.confirm("Delete this product? This cannot be undone.")) return;
      deleteProduct(id);
      refresh();
    },
    [refresh]
  );

  if (mode === "add" || mode === "edit") {
    return (
      <main style={{ maxWidth: 640, margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
        <h1 style={{ marginBottom: 24 }}>
          {mode === "add" ? "Add New Product" : "Edit Product"}
        </h1>

        {formError && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: 6,
              padding: "10px 14px",
              marginBottom: 20,
              color: "#991b1b",
            }}
          >
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label style={labelStyle}>
            Name *
            <input
              name="name"
              value={form.name}
              onChange={handleField}
              placeholder="Product name"
              style={inputStyle}
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <label style={labelStyle}>
              Price ($) *
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleField}
                placeholder="0.00"
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Stock *
              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleField}
                placeholder="0"
                style={inputStyle}
              />
            </label>
          </div>

          <label style={labelStyle}>
            Category
            <input
              name="category"
              value={form.category}
              onChange={handleField}
              placeholder="e.g. Clothing, Electronics"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Variant (optional)
            <input
              name="variant"
              value={form.variant}
              onChange={handleField}
              placeholder="e.g. Red / Large"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleField}
              placeholder="Short product description"
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </label>

          <div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Product Image
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={secondaryBtnStyle}
            >
              {form.image ? "Change Image" : "Upload Image"}
            </button>
            {form.image && (
              <div style={{ marginTop: 12 }}>
                <img
                  src={form.image}
                  alt="Preview"
                  style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                  style={{ display: "block", marginTop: 6, fontSize: 12, color: "#6b7280", background: "none", border: "none", cursor: "pointer" }}
                >
                  Remove image
                </button>
              </div>
            )}
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleField}
              style={{ width: 16, height: 16, cursor: "pointer" }}
            />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
              Active (visible in shop)
            </span>
          </label>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="submit" style={primaryBtnStyle}>
              {mode === "add" ? "Add Product" : "Save Changes"}
            </button>
            <button type="button" onClick={closeForm} style={secondaryBtnStyle}>
              Cancel
            </button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h1 style={{ margin: 0 }}>Owner — Products</h1>
        <button onClick={openAdd} style={primaryBtnStyle}>
          + Add Product
        </button>
      </div>

      <div
        style={{
          background: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: 8,
          padding: "10px 16px",
          marginBottom: 24,
          fontSize: 13,
          color: "#0369a1",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <strong>Debug:</strong> STORE_PRODS contains {products.length} product{products.length !== 1 ? "s" : ""}.
      </div>

      {products.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#6b7280",
            border: "2px dashed #e5e7eb",
            borderRadius: 12,
          }}
        >
          <p style={{ margin: 0, fontSize: 16 }}>No products yet.</p>
          <p style={{ margin: "8px 0 0", fontSize: 14 }}>Click &quot;+ Add Product&quot; to create your first one.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                display: "grid",
                gridTemplateColumns: "60px 1fr auto",
                gap: 16,
                alignItems: "center",
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "14px 16px",
              }}
            >
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb" }}
                />
              ) : (
                <div
                  style={{
                    width: 60,
                    height: 60,
                    background: "#f3f4f6",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    color: "#9ca3af",
                  }}
                >
                  No img
                </div>
              )}

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                  {p.variant && (
                    <span style={{ fontSize: 12, background: "#f3f4f6", padding: "2px 8px", borderRadius: 12, color: "#6b7280" }}>
                      {p.variant}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 12,
                      padding: "2px 8px",
                      borderRadius: 12,
                      background: p.active ? "#dcfce7" : "#f3f4f6",
                      color: p.active ? "#166534" : "#6b7280",
                    }}
                  >
                    {p.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                  ${p.price.toFixed(2)} &nbsp;·&nbsp; Stock: {p.stock} &nbsp;·&nbsp; {p.category || "No category"}
                </div>
                {p.description && (
                  <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 400 }}>
                    {p.description}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => openEdit(p)} style={secondaryBtnStyle}>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  style={{ ...secondaryBtnStyle, color: "#dc2626", borderColor: "#fca5a5" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 14,
  fontWeight: 600,
  color: "#374151",
};

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 14,
  color: "#111827",
  background: "#fff",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const primaryBtnStyle: React.CSSProperties = {
  padding: "9px 20px",
  background: "#111827",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "#fff",
  color: "#374151",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
};
