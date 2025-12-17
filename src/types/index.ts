export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Accompaniment {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  accompaniments: string[];
  observations: string;
}

export type OrderStatus = 'novo' | 'em_preparo' | 'a_caminho' | 'entregue' | 'cancelado';
export type PaymentMethod = 'pix' | 'entrega';
export type DeliveryType = 'entrega' | 'retirada';

export interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  delivery_type: DeliveryType;
  payment_method: PaymentMethod;
  status: OrderStatus;
  observations: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  accompaniments: string[] | null;
  observations: string | null;
  created_at: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}
