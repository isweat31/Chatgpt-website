"use client";

import type { Product, NewProduct, ProductUpdate } from "@/types/product";

export const STORAGE_KEY = "STORE_PRODS";
const SYNC_EVENT = "hgs-products-updated";

function emit(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SYNC_EVENT));
  }
}

export function readProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(products: Product[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getProducts(): Product[] {
  return readProducts();
}

export function addProduct(data: NewProduct): Product {
  const now = new Date().toISOString();
  const product: Product = {
    id: generateId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  const products = readProducts();
  persist([...products, product]);
  emit();
  return product;
}

export function updateProduct(id: string, changes: ProductUpdate): Product | null {
  const products = readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const updated: Product = {
    ...products[index],
    ...changes,
    id: products[index].id,
    createdAt: products[index].createdAt,
    updatedAt: new Date().toISOString(),
  };
  const next = [...products];
  next[index] = updated;
  persist(next);
  emit();
  return updated;
}

export function deleteProduct(id: string): boolean {
  const products = readProducts();
  const next = products.filter((p) => p.id !== id);
  if (next.length === products.length) return false;
  persist(next);
  emit();
  return true;
}
