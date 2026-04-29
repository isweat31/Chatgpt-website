"use client";

import { useState, useCallback } from "react";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/productStorage";
import type { Product, NewProduct, ProductUpdate } from "@/types/product";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(() => getProducts());

  const refresh = useCallback(() => {
    setProducts(getProducts());
  }, []);

  const add = useCallback((data: NewProduct): Product => {
    const product = addProduct(data);
    setProducts(getProducts());
    return product;
  }, []);

  const update = useCallback((id: string, changes: ProductUpdate): Product | null => {
    const product = updateProduct(id, changes);
    if (product) setProducts(getProducts());
    return product;
  }, []);

  const remove = useCallback((id: string): boolean => {
    const deleted = deleteProduct(id);
    if (deleted) setProducts(getProducts());
    return deleted;
  }, []);

  return { products, add, update, remove, refresh };
}
