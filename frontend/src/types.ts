export type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  vendor_name?: string;
  category_name?: string;
  city?: string;
  country?: string;
  stock_quantity?: number;
  product_type?: string;
  delivery_time?: string;
  discount_price?: string | null;
};

export type CartProduct = Product & {
  id: number;
};

export type CartItem = {
  id: number;
  product: number;
  quantity: number;
  product_detail: Product;
};

export type Cart = {
  id: number;
  items: CartItem[];
  created_at: string;
};
