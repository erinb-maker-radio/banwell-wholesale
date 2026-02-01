// PocketBase Collection Types for Banwell Wholesale

export type OrderStatus =
  | 'pending_payment'
  | 'payment_received'
  | 'being_fulfilled'
  | 'shipped'
  | 'delivered'
  | 'follow_up';

export type CustomerStatus = 'active' | 'inactive' | 'pending';

export type DiscountTierLevel = 'auto' | 'tier1' | 'tier2' | 'tier3';

export type PaymentMethod = 'square' | 'invoice';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export type CommunicationType =
  | 'call'
  | 'email'
  | 'meeting'
  | 'note'
  | 'order_placed'
  | 'payment_received'
  | 'shipped'
  | 'follow_up';

// ---- Collections ----

export interface Customer {
  id: string;
  email: string;
  business_name: string;
  contact_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  website?: string;
  notes?: string;
  status: CustomerStatus;
  discount_tier: DiscountTierLevel;
  square_customer_id?: string;
  created: string;
  updated: string;
  // Expanded relations
  expand?: {
    contacts_via_customer?: Contact[];
  };
}

export interface Contact {
  id: string;
  customer: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  is_primary: boolean;
  notes?: string;
  created: string;
  updated: string;
  expand?: {
    customer?: Customer;
  };
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  default_price: number; // cents
  sort_order: number;
  created: string;
  updated: string;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  short_title: string;
  category: string;
  retail_price: number; // cents
  size?: string;
  image?: string; // PocketBase file field
  image_url?: string; // Etsy CDN fallback
  description?: string;
  is_active: boolean;
  sort_order: number;
  created: string;
  updated: string;
  // Expanded relations
  expand?: {
    category?: ProductCategory;
  };
}

export interface Order {
  id: string;
  order_number: string;
  customer: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  subtotal: number; // cents
  discount_percent: number;
  discount_amount: number; // cents
  total: number; // cents
  square_payment_id?: string;
  square_checkout_id?: string;
  invoice_terms?: string;
  shipping_address?: string;
  tracking_number?: string;
  shipped_date?: string;
  delivered_date?: string;
  follow_up_date?: string;
  follow_up_sent: boolean;
  notes?: string;
  created: string;
  updated: string;
  // Expanded relations
  expand?: {
    customer?: Customer;
    order_items_via_order?: OrderItem[];
  };
}

export interface OrderItem {
  id: string;
  order: string;
  product: string;
  quantity: number;
  unit_price: number; // cents
  line_total: number; // cents
  created: string;
  updated: string;
  expand?: {
    order?: Order;
    product?: Product;
  };
}

export interface CuratedProduct {
  id: string;
  customer: string;
  product: string;
  sort_order: number;
  created: string;
  updated: string;
  expand?: {
    customer?: Customer;
    product?: Product;
  };
}

export interface Favorite {
  id: string;
  customer: string;
  product: string;
  created: string;
  updated: string;
  expand?: {
    customer?: Customer;
    product?: Product;
  };
}

export interface Invoice {
  id: string;
  order: string;
  customer: string;
  invoice_number: string;
  amount: number; // cents
  due_date: string;
  status: InvoiceStatus;
  square_invoice_id?: string;
  square_payment_id?: string;
  paid_date?: string;
  paid_amount?: number;
  sent_date?: string;
  notes?: string;
  created: string;
  updated: string;
  expand?: {
    order?: Order;
    customer?: Customer;
  };
}

export interface Communication {
  id: string;
  customer: string;
  type: CommunicationType;
  subject?: string;
  content?: string;
  date: string;
  logged_by?: string;
  created: string;
  updated: string;
  expand?: {
    customer?: Customer;
  };
}

export interface DiscountTier {
  id: string;
  name: string;
  min_order_amount: number; // cents
  discount_percent: number;
  description?: string;
  is_active: boolean;
  created: string;
  updated: string;
}

// ---- API Types ----

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

// ---- Cart Types (client-side) ----

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
  lineTotal: number; // cents
}

export interface CartSummary {
  items: CartItemWithProduct[];
  subtotal: number; // cents
  discountPercent: number;
  discountAmount: number; // cents
  total: number; // cents
  tierName: string;
  itemCount: number;
}

// ---- Dashboard Stats ----

export interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  monthlyOrders: number;
  activeCustomers: number;
  averageOrderValue: number;
  recentOrders: Order[];
  ordersByStatus: Record<OrderStatus, number>;
}
