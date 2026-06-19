export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  products_count?: number;
}

export interface Product {
  id: number;
  category_id: number | null;
  category?: Category | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  image_url: string | null;
  is_active: boolean;
  avg_rating: number | null;
  reviews_count: number;
  reviews?: Review[];
}

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  product?: { id: number; slug: string; image_url: string | null } | null;
}

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid";

export interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment: string | null;
  user: { id: number; name: string };
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  paid_at: string | null;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  reviewed_product_ids?: number[];
}
