// ─── Product Types ───────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  name: string;
  type: 'color' | 'storage' | 'ram' | 'size';
  value: string;
  priceModifier: number; // positive or negative offset from base price
  inStock: boolean;
  sku: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  images: string[];
  price: number;
  originalPrice: number;
  discount: number; // percentage, e.g. 9 = 9%
  inStock: boolean;
  stockCount: number;
  isNew: boolean;
  isFeatured: boolean;
  isFlashSale: boolean;
  flashSaleEndsAt: number | null; // Unix timestamp in ms
  rating: number;
  reviewCount: number;
  shortDescription: string;
  description: string;
  specs: Record<string, string>;
  variants: ProductVariant[];
  tags: string[];
  warranty: string;
  sku: string;
  createdAt: string; // ISO date string
}

// ─── Cart Types ──────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

// ─── Wishlist Types ──────────────────────────────────────────────────────────

export interface WishlistItem {
  product: Product;
  addedAt: string; // ISO date string
}

// ─── Compare Types ───────────────────────────────────────────────────────────

export interface CompareItem {
  product: Product;
}

// ─── Category & Brand Types ──────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // Lucide icon name
  image: string;
  productCount: number;
  description: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  productCount: number;
}

// ─── Review Types ────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  createdAt: string;
  helpful: number;
  verified: boolean;
}

// ─── Address & Order Types ───────────────────────────────────────────────────

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  altPhone: string;
  division: string;
  district: string;
  thana: string;
  streetAddress: string;
  postalCode: string;
  isDefault: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentMethod =
  | 'cod'
  | 'bkash'
  | 'nagad'
  | 'rocket'
  | 'card'
  | 'bank';

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  address: Address;
  paymentMethod: PaymentMethod;
  trackingId: string;
  courier: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Checkout Types ──────────────────────────────────────────────────────────

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  altPhone: string;
  division: string;
  district: string;
  thana: string;
  streetAddress: string;
  postalCode: string;
  paymentMethod: PaymentMethod;
  couponCode: string;
  notes: string;
}
