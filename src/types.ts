export interface ProductVariant {
  id: string;
  name: string;
  type: 'size' | 'color' | 'material' | 'other';
  price?: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  material?: string;
  stock: number;
  isFeatured?: boolean;
  variants?: ProductVariant[];
  tags?: string[];
  vendorId?: string;
  seoTitle?: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  role: 'customer' | 'admin' | 'vendor';
  addresses?: Address[];
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'processed' | 'shipped' | 'delivered' | 'cancelled' | 'pending_payment';
  shippingAddress: Address;
  paymentId?: string;
  trackingNumber?: string;
  courierName?: string;
  createdAt: any;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  link?: string;
  order: number;
  active?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  expiryDate?: string;
  active: boolean;
}
