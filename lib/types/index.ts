export type RecoveryMode = "email" | "voice";

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export interface ProductVariant {
  id: string;
  label: string;
  sku: string;
  priceDelta: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  basePrice: number;
  images: string[];
  variants: ProductVariant[];
}

export interface CartLine {
  productId: string;
  variantId: string;
  quantity: number;
  title: string;
  unitPrice: number;
}

export interface CartContact {
  email: string;
  phone: string;
  checkoutStep?: string;
  updatedAt?: number;
}

export interface CartConsent {
  marketingAndCalls: boolean;
  privacyAccepted: boolean;
  recordedAt: number;
}

export interface CartDoc {
  userId: string;
  items: CartLine[];
  contact?: CartContact;
  consent?: CartConsent;
  promoCode?: string;
  updatedAt: number;
}

export type TrackingEventType =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "checkout_start"
  | "checkout_step"
  | "checkout_abandon";

export interface TrackingEvent {
  userId: string;
  type: TrackingEventType;
  payload?: Record<string, unknown>;
  createdAt: number;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered";

export interface Order {
  id: string;
  userId: string;
  items: CartLine[];
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  contactEmail: string;
  contactPhone?: string;
  shippingAddress?: string;
  invoiceUrl?: string;
  recoverySource?: string;
  createdAt: number;
}

export interface AdminConfig {
  recoveryMode: RecoveryMode;
  voiceCartMinEuros: number;
  callDelayMinutes: number;
  discountPercentMax: number;
  cartValueForNegotiationEuros: number;
}

export type RecoveryLogStatus =
  | "pending"
  | "email_sent"
  | "call_scheduled"
  | "call_completed"
  | "recovered";

export interface RecoveryLog {
  id: string;
  userId?: string;
  cartId?: string;
  channel: RecoveryMode;
  status: RecoveryLogStatus;
  transcript?: string;
  objectionSummary?: string;
  promoCode?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PromoCodeDoc {
  code: string;
  percent: number;
  maxUses: number;
  uses: number;
  cartMinTotal: number;
  expiresAt: number;
  createdForUserId?: string;
}
