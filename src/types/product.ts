export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
  active: boolean;
  variant?: string;
  createdAt: string;
  updatedAt: string;
};

export type NewProduct = Omit<Product, "id" | "createdAt" | "updatedAt">;
export type ProductUpdate = Partial<Omit<Product, "id" | "createdAt">>;
