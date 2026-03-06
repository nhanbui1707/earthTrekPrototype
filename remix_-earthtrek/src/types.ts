export interface Variant {
  id: string;
  name: string;
  attributes: string; // JSON string like {"Dung tích": "50L", "Màu sắc": "Đen"}
  stock_buy: number;
  stock_rent: number;
  price_modifier: number;
  buy_price?: number;
  rent_price_per_day?: number;
}

export interface Review {
  id: string;
  user_name: string;
  image: string;
  comment: string;
  rating: number;
  durability: number; // 1-5
  newness: number;    // 1-5
  material: number;   // 1-5
}

export interface Product {
  id: string;
  name: string;
  buy_price: number;
  rent_price_per_day: number;
  stock_buy: number;
  stock_rent: number;
  image: string;
  category: string;
  description: string;
  instructions: string;
  keywords: string; // Comma separated or JSON string
  specifications?: string; // JSON string
  attributes?: string; // JSON string like ["Dung tích", "Màu sắc"]
  variants?: Variant[];
  reviews?: Review[];
}

export interface CartItem {
  cart_id: number;
  product_id: string;
  name: string;
  image: string;
  mode: 'buy' | 'rent';
  quantity: number;
  selected: number;
  variant_id?: string;
  variant_name?: string;
  buy_price: number;
  rent_price_per_day: number;
  stock_buy: number;
  stock_rent: number;
}

export interface Member {
  fullName: string;
  age?: string;
  phone?: string;
  email?: string;
  emergencyContact?: string;
  experience: 'Beginner' | 'Experienced' | 'Professional';
  healthNotes?: string;
}

export interface Trip {
  id?: number;
  location_id: string;
  departure_date: string;
  number_of_days: number;
  guide_id?: string;
  members: Member[];
}

export interface Location {
  id: string;
  name: string;
  province: string;
  image: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  rating: number;
  distance: number;
  description: string;
}

export interface Guide {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  experience: number;
  dailyRate: number;
}

export interface Voucher {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxDiscount?: number;
  minOrder: number;
  scope: 'all' | 'category' | 'products';
  scopeValue?: string | string[]; // category name or array of product names
  startTime?: string; // ISO date
  endTime?: string; // ISO date
  usageLimit: number;
  userLimit: number;
  status: 'active' | 'scheduled' | 'expired';
  description: string;
}

export type OrderStatus = 'Chờ xác nhận' | 'Chuẩn bị giao' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';

export interface OrderItem {
  product_id: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
  mode: 'buy' | 'rent';
  variant_name?: string;
  rentalDays?: number;
}

export interface Order {
  id: string;
  createdAt: string;
  orderDate: string;
  orderTime: string;
  estimatedDeliveryDate: string;
  deliveredDate?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  address: {
    name: string;
    phone: string;
    detail: string;
    ward: string;
    district: string;
    city: string;
  };
}
