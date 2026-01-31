export interface ProductVariant {
  color: string;
  colorHex: string;
  size: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
  image: string;
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  subCategory: string;
  tags: string[];
  images: string[];
  variants: ProductVariant[];
  averageRating: number;
  reviewCount: number;
  reviews: ProductReview[];
  material: string;
  fit: string;
  washCare: string[];
  featured: boolean;
  trending: boolean;
  newArrival: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  variantSku: string;
  quantity: number;
  color: string;
  size: string;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  trackingId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  addresses: Address[];
  orders: Order[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiresAt: string;
  isActive: boolean;
}
