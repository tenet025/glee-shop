import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, WishlistItem, Product } from '@/types';
import { products, coupons } from '@/data/products';

interface StoreState {
  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (sku: string) => void;
  updateCartQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  
  // Wishlist
  wishlist: WishlistItem[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  
  // Coupon
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  
  // Computed
  getCartTotal: () => { subtotal: number; discount: number; shipping: number; total: number };
  getCartItemCount: () => number;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      appliedCoupon: null,

      addToCart: (item) => {
        set((state) => {
          const existingIndex = state.cart.findIndex(
            (cartItem) => cartItem.variantSku === item.variantSku
          );
          
          if (existingIndex > -1) {
            const newCart = [...state.cart];
            newCart[existingIndex].quantity += item.quantity;
            return { cart: newCart };
          }
          
          return { cart: [...state.cart, item] };
        });
      },

      removeFromCart: (sku) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.variantSku !== sku),
        }));
      },

      updateCartQuantity: (sku, quantity) => {
        set((state) => ({
          cart: state.cart.map((item) =>
            item.variantSku === sku ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        }));
      },

      clearCart: () => set({ cart: [], appliedCoupon: null }),

      addToWishlist: (productId) => {
        set((state) => {
          if (state.wishlist.some((item) => item.productId === productId)) {
            return state;
          }
          return {
            wishlist: [...state.wishlist, { productId, addedAt: new Date().toISOString() }],
          };
        });
      },

      removeFromWishlist: (productId) => {
        set((state) => ({
          wishlist: state.wishlist.filter((item) => item.productId !== productId),
        }));
      },

      isInWishlist: (productId) => {
        return get().wishlist.some((item) => item.productId === productId);
      },

      applyCoupon: (code) => {
        const coupon = coupons.find(
          (c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive
        );
        
        if (!coupon) {
          return { success: false, message: 'Invalid coupon code' };
        }
        
        const { subtotal } = get().getCartTotal();
        
        if (subtotal < coupon.minOrderValue) {
          return {
            success: false,
            message: `Minimum order value of $${coupon.minOrderValue} required`,
          };
        }
        
        set({ appliedCoupon: coupon.code });
        return { success: true, message: 'Coupon applied successfully!' };
      },

      removeCoupon: () => set({ appliedCoupon: null }),

      getCartTotal: () => {
        const state = get();
        let subtotal = 0;
        
        state.cart.forEach((cartItem) => {
          const product = products.find((p) => p.id === cartItem.productId);
          if (product) {
            const variant = product.variants.find((v) => v.sku === cartItem.variantSku);
            if (variant) {
              subtotal += variant.price * cartItem.quantity;
            }
          }
        });
        
        let discount = 0;
        if (state.appliedCoupon) {
          const coupon = coupons.find((c) => c.code === state.appliedCoupon);
          if (coupon) {
            if (coupon.discountType === 'percentage') {
              discount = (subtotal * coupon.discountValue) / 100;
              if (coupon.maxDiscount) {
                discount = Math.min(discount, coupon.maxDiscount);
              }
            } else {
              discount = coupon.discountValue;
            }
          }
        }
        
        const shipping = subtotal > 100 ? 0 : 9.99;
        const total = subtotal - discount + shipping;
        
        return { subtotal, discount, shipping, total: Math.max(0, total) };
      },

      getCartItemCount: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'stylehub-store',
    }
  )
);
