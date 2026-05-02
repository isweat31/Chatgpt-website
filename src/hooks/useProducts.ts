"use client";

import { useState, useEffect, useCallback } from "react";
import {
  readProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/productStorage";
import type { Product, NewProduct, ProductUpdate } from "@/types/product";

const SYNC_EVENT = "hgs-products-updated";

export function useProducts(_filterActive?: boolean) {
  const [products, setProducts] = useState<Product[]>([]);

  const load = useCallback(() => {
    setProducts(readProducts());
  }, []);

  useEffect(() => {
    load();

    window.addEventListener(SYNC_EVENT, load);
    window.addEventListener("storage", load);
    window.addEventListener("focus", load);

    return () => {
      window.removeEventListener(SYNC_EVENT, load);
      window.removeEventListener("storage", load);
      window.removeEventListener("focus", load);
    };
  }, [load]);

  const add = useCallback((data: NewProduct): Product => {
    const product = addProduct(data);
    setProducts(readProducts());
    return product;
  }, []);

  const update = useCallback((id: string, changes: ProductUpdate): Product | null => {
    const result = updateProduct(id, changes);
    if (result) setProducts(readProducts());
    return result;
  }, []);

  const remove = useCallback((id: string): boolean => {
    const deleted = deleteProduct(id);
    if (deleted) setProducts(readProducts());
    return deleted;
  }, []);

  return { products, refresh: load, add, update, remove };
}
