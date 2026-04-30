"use client";

import { useState, useEffect, useCallback } from "react";
import { readProducts } from "@/lib/productStorage";
import type { Product } from "@/types/product";

const SYNC_EVENT = "hgs-products-updated";

export function useProducts() {
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

  return { products, refresh: load };
}
