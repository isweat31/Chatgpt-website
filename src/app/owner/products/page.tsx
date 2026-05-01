"use client";

import {
  useState,
  useMemo,
  useRef,
  useCallback,
  ChangeEvent,
  FormEvent,
  useEffect,
} from "react";
import { useProducts } from "@/hooks/useProducts";
import type { Product, NewProduct } from "@/types/product";

// ─── Types ────────────────────────────────────────────────────────────────────

type Filter = "all" | "live" | "hidden" | "low_stock" | "out_of_stock";

type FormData = {
  name: string;
  price: string;
  description: string;
  category: string;
  stock: string;
  active: boolean;
  variant: string;
  image: string;
};

const EMPTY_FORM: FormData = {
  name: "",
  price: "",
  description: "",
  category: "",
  stock: "",
  active: true,
  variant: "",
  image: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function productToForm(p: Product): FormData {
  return {
    name: p.name,
    price: String(p.price),
    description: p.description,
    category: p.category,
    stock: String(p.stock),
    active: p.active,
    variant: p.variant ?? "",
    image: p.image,
  };
}

function formToPayload(f: FormData): NewProduct {
  return {
    name: f.name.trim(),
    price: parseFloat(f.price) || 0,
    description: f.description.trim(),
    category: f.category.trim(),
    stock: parseInt(f.stock, 10) || 0,
    active: f.active,
    image: f.image,
    ...(f.variant.trim() ? { variant: f.variant.trim() } : {}),
  };
}

function stockLabel(p: Product) {
  if (p.stock === 0) return <span className="ow-badge ow-badge-red">Out of stock</span>;
  if (p.stock <= 5) return <span className="ow-badge ow-badge-amber">Low — {p.stock}</span>;
  return <span className="ow-stock-num">{p.stock}</span>;
}

function statusBadge(p: Product) {
  if (!p.active) return <span className="ow-badge ow-badge-gray">Hidden</span>;
  if (p.stock === 0) return <span className="ow-badge ow-badge-red">Out of stock</span>;
  return <span className="ow-badge ow-badge-green">Live</span>;
}

// ─── Product Form Modal ───────────────────────────────────────────────────────

type ModalProps = {
  mode: "add" | "edit";
  form: FormData;
  categories: string[];
  error: string;
  onField: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
};

function ProductModal({
  mode,
  form,
  categories,
  error,
  onField,
  onImageUpload,
  onClearImage,
  onSubmit,
  onClose,
}: ModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="ow-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ow-modal">
        <div className="ow-modal-head">
          <h2 className="ow-modal-title">
            {mode === "add" ? "Add Product" : "Edit Product"}
          </h2>
          <button className="ow-modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {error && <div className="ow-form-error">{error}</div>}

        <form onSubmit={onSubmit} className="ow-form">
          <div className="ow-form-row">
            <div className="ow-form-group ow-form-grow">
              <label className="ow-label">Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={onField}
                placeholder="e.g. Silk Wrap Dress"
                className="ow-input"
              />
            </div>
            <div className="ow-form-group" style={{ width: 130 }}>
              <label className="ow-label">Price ($) *</label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={onField}
                placeholder="0.00"
                className="ow-input"
              />
            </div>
          </div>

          <div className="ow-form-row">
            <div className="ow-form-group ow-form-grow">
              <label className="ow-label">Category</label>
              <select name="category" value={form.category} onChange={onField} className="ow-select">
                <option value="">— Select category —</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                {form.category && !categories.includes(form.category) && (
                  <option value={form.category}>{form.category}</option>
                )}
              </select>
            </div>
            <div className="ow-form-group" style={{ width: 130 }}>
              <label className="ow-label">Stock *</label>
              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={onField}
                placeholder="0"
                className="ow-input"
              />
            </div>
          </div>

          <div className="ow-form-group">
            <label className="ow-label">Variant <span className="ow-label-opt">(optional)</span></label>
            <input
              name="variant"
              value={form.variant}
              onChange={onField}
              placeholder="e.g. Black / Medium"
              className="ow-input"
            />
          </div>

          <div className="ow-form-group">
            <label className="ow-label">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onField}
              placeholder="Short product description..."
              rows={3}
              className="ow-textarea"
            />
          </div>

          <div className="ow-form-group">
            <label className="ow-label">Image</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              style={{ display: "none" }}
            />
            {form.image ? (
              <div className="ow-img-preview">
                <img src={form.image} alt="Preview" className="ow-img-thumb" />
                <div className="ow-img-actions">
                  <button type="button" onClick={() => fileRef.current?.click()} className="ow-btn-ghost">
                    Replace
                  </button>
                  <button type="button" onClick={onClearImage} className="ow-btn-ghost ow-btn-ghost-red">
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="ow-upload-area"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3v10M6 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 16h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>Upload image</span>
                <span className="ow-upload-hint">JPG, PNG, WEBP</span>
              </button>
            )}
          </div>

          <div className="ow-form-toggle">
            <label className="ow-toggle-label">
              <span className="ow-toggle-track">
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={onField}
                  className="ow-toggle-input"
                />
                <span className="ow-toggle-thumb" />
              </span>
              <div>
                <p className="ow-toggle-title">{form.active ? "Active — visible in shop" : "Hidden — not shown in shop"}</p>
                <p className="ow-toggle-sub">Toggle to control shop visibility</p>
              </div>
            </label>
          </div>

          <div className="ow-modal-foot">
            <button type="button" onClick={onClose} className="ow-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="ow-btn-primary">
              {mode === "add" ? "Add Product" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteDialog({
  product,
  onConfirm,
  onCancel,
}: {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="ow-overlay">
      <div className="ow-dialog">
        <div className="ow-dialog-icon">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 7v5M11 15h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </div>
        <h3 className="ow-dialog-title">Delete product?</h3>
        <p className="ow-dialog-body">
          <strong>{product.name}</strong> will be permanently removed. This cannot be undone.
        </p>
        <div className="ow-dialog-foot">
          <button onClick={onCancel} className="ow-btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="ow-btn-danger">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductManagerPage() {
  const { products, add, update, remove, refresh } = useProducts(false);

  // Categories
  const derivedCategories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products]
  );
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showCategories, setShowCategories] = useState(true);

  const allCategories = useMemo(
    () => [...new Set([...derivedCategories, ...customCategories])].sort(),
    [derivedCategories, customCategories]
  );

  const handleAddCategory = useCallback(() => {
    const val = newCategoryInput.trim();
    if (!val || allCategories.includes(val)) return;
    setCustomCategories((prev) => [...prev, val]);
    setNewCategoryInput("");
  }, [newCategoryInput, allCategories]);

  const handleRemoveCategory = useCallback((cat: string) => {
    setCustomCategories((prev) => prev.filter((c) => c !== cat));
  }, []);

  // Search + Filter
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    let list = products;
    if (filter === "live") list = list.filter((p) => p.active && p.stock > 0);
    else if (filter === "hidden") list = list.filter((p) => !p.active);
    else if (filter === "low_stock") list = list.filter((p) => p.stock > 0 && p.stock <= 5);
    else if (filter === "out_of_stock") list = list.filter((p) => p.stock === 0);

    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.variant ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, filter, search]);

  // Filter tab counts
  const counts = useMemo(
    () => ({
      all: products.length,
      live: products.filter((p) => p.active && p.stock > 0).length,
      hidden: products.filter((p) => !p.active).length,
      low_stock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
      out_of_stock: products.filter((p) => p.stock === 0).length,
    }),
    [products]
  );

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const openAdd = useCallback(() => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError("");
    setModalMode("add");
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((p: Product) => {
    setForm(productToForm(p));
    setEditingId(p.id);
    setFormError("");
    setModalMode("edit");
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingId(null);
    setFormError("");
  }, []);

  const handleField = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const t = e.target;
      const value = t.type === "checkbox" ? (t as HTMLInputElement).checked : t.value;
      setForm((prev) => ({ ...prev, [t.name]: value }));
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

  const handleClearImage = useCallback(() => {
    setForm((prev) => ({ ...prev, image: "" }));
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

      const payload = formToPayload(form);

      if (modalMode === "add") {
        add(payload);
      } else if (modalMode === "edit" && editingId) {
        update(editingId, payload);
      }

      refresh();
      closeModal();
    },
    [form, modalMode, editingId, add, update, refresh, closeModal]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    remove(deleteTarget.id);
    refresh();
    setDeleteTarget(null);
  }, [deleteTarget, remove, refresh]);

  // Close modal on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (deleteTarget) setDeleteTarget(null);
        else if (modalOpen) closeModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, deleteTarget, closeModal]);

  const FILTER_TABS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "live", label: "Live" },
    { key: "hidden", label: "Hidden" },
    { key: "low_stock", label: "Low Stock" },
    { key: "out_of_stock", label: "Out of Stock" },
  ];

  return (
    <>
      <div className="ow-page">
        <div className="ow-page-head">
          <div>
            <h1 className="ow-page-title">Products</h1>
            <p className="ow-page-sub">{products.length} total product{products.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="ow-page-actions">
            <button onClick={refresh} className="ow-btn-ghost">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7a6 6 0 106-6 6 6 0 00-4.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M1 3v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Refresh
            </button>
            <button onClick={openAdd} className="ow-btn-primary">
              + Add Product
            </button>
          </div>
        </div>

        {/* Categories Panel */}
        <div className="ow-card ow-cats-card">
          <button
            className="ow-cats-toggle"
            onClick={() => setShowCategories((v) => !v)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              style={{ transform: showCategories ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
            >
              <path d="M4 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="ow-cats-toggle-label">Categories</span>
            <span className="ow-cats-count">{allCategories.length}</span>
          </button>

          {showCategories && (
            <div className="ow-cats-body">
              <div className="ow-cats-add">
                <input
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
                  placeholder="New category name..."
                  className="ow-input ow-cats-input"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="ow-btn-secondary"
                  disabled={!newCategoryInput.trim()}
                >
                  Add
                </button>
              </div>

              {allCategories.length === 0 ? (
                <p className="ow-cats-empty">No categories yet. Add one above or create a product with a category.</p>
              ) : (
                <div className="ow-cats-list">
                  {allCategories.map((cat) => {
                    const count = products.filter((p) => p.category === cat).length;
                    const isCustom = customCategories.includes(cat);
                    return (
                      <div key={cat} className="ow-cat-chip">
                        <span className="ow-cat-name">{cat}</span>
                        <span className="ow-cat-num">{count}</span>
                        {isCustom && count === 0 && (
                          <button
                            className="ow-cat-remove"
                            onClick={() => handleRemoveCategory(cat)}
                            aria-label="Remove category"
                          >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            </svg>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search + Filters */}
        <div className="ow-toolbar">
          <div className="ow-search-wrap">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="ow-search-icon">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="ow-search"
            />
            {search && (
              <button className="ow-search-clear" onClick={() => setSearch("")}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          <div className="ow-filter-tabs">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`ow-filter-tab${filter === tab.key ? " ow-filter-active" : ""}`}
              >
                {tab.label}
                <span className={`ow-filter-num${filter === tab.key ? " ow-filter-num-active" : ""}`}>
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Table */}
        <div className="ow-card ow-table-card">
          {filtered.length === 0 ? (
            <div className="ow-empty-state">
              {search || filter !== "all" ? (
                <p>No products match your search or filter.</p>
              ) : (
                <>
                  <p>No products yet.</p>
                  <button onClick={openAdd} className="ow-btn-primary" style={{ marginTop: 12 }}>
                    Add your first product
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="ow-table-wrap">
              <table className="ow-table">
                <thead>
                  <tr>
                    <th className="ow-th ow-th-img" />
                    <th className="ow-th">Product</th>
                    <th className="ow-th ow-th-hide-sm">Category</th>
                    <th className="ow-th ow-th-right">Price</th>
                    <th className="ow-th ow-th-right ow-th-hide-sm">Stock</th>
                    <th className="ow-th">Status</th>
                    <th className="ow-th ow-th-actions" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="ow-tr">
                      <td className="ow-td ow-td-img">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="ow-row-img" />
                        ) : (
                          <div className="ow-row-img-placeholder">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" />
                              <path d="M1 9.5l3-3 2.5 2.5 2-2L13 12" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="ow-td">
                        <div className="ow-td-name">{p.name}</div>
                        {p.variant && <div className="ow-td-variant">{p.variant}</div>}
                      </td>
                      <td className="ow-td ow-td-muted ow-th-hide-sm">
                        {p.category || <span className="ow-td-none">—</span>}
                      </td>
                      <td className="ow-td ow-td-right ow-td-price">
                        ${p.price.toFixed(2)}
                      </td>
                      <td className="ow-td ow-td-right ow-th-hide-sm">
                        {stockLabel(p)}
                      </td>
                      <td className="ow-td">{statusBadge(p)}</td>
                      <td className="ow-td ow-td-actions">
                        <button
                          onClick={() => openEdit(p)}
                          className="ow-row-btn"
                          aria-label="Edit"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                          </svg>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="ow-row-btn ow-row-btn-red"
                          aria-label="Delete"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 3.5h10M5.5 3.5v-1h3v1M4 3.5l.75 7.5h4.5L10 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="ow-table-foot">
              Showing {filtered.length} of {products.length} product{products.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modalOpen && (
        <ProductModal
          mode={modalMode}
          form={form}
          categories={allCategories}
          error={formError}
          onField={handleField}
          onImageUpload={handleImageUpload}
          onClearImage={handleClearImage}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          product={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
