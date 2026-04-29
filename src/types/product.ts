export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  active: boolean;
};

export type NewProduct = Omit<Product, "id">;
export type ProductUpdate = Partial<NewProduct>;
