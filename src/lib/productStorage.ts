"use client";

import type { Product, NewProduct, ProductUpdate } from "@/types/product";

const STORAGE_KEY = "products";

function readStore(): Product[] {
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

function writeStore(products: Product[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getProducts(): Product[] {
  return readStore();
}

export function addProduct(data: NewProduct): Product {
  const product: Product = { id: generateId(), ...data };
  const products = readStore();
  writeStore([...products, product]);
  return product;
}

export function updateProduct(id: string, changes: ProductUpdate): Product | null {
  const products = readStore();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const updated: Product = { ...products[index], ...changes };
  const next = [...products];
  next[index] = updated;
  writeStore(next);
  return updated;
}

export function deleteProduct(id: string): boolean {
  const products = readStore();
  const next = products.filter((p) => p.id !== id);
  if (next.length === products.length) return false;
  writeStore(next);
  return true;
}
