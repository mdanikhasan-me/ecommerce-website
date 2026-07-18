import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  variantId?: string
  name: string
  slug: string
  price: number
  originalPrice: number
  image: string
  quantity: number
  stockQuantity: number
  variantName?: string
  sku: string
}

export interface CartCoupon {
  id: string
  code: string
  name: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  maxDiscount?: number | null
  discount: number
  qualifyingSubtotal: number
  hasRestrictions: boolean
}

interface CartState {
  items: CartItem[]
  appliedCoupon: CartCoupon | null
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  setAppliedCoupon: (coupon: CartCoupon) => void
  clearAppliedCoupon: () => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          )
          if (existing) {
            const newQty = Math.min(
              existing.quantity + (item.quantity ?? 1),
              existing.stockQuantity
            )
            return {
              appliedCoupon: null,
              items: state.items.map((i) =>
                i.productId === item.productId && i.variantId === item.variantId
                  ? { ...i, quantity: newQty }
                  : i
              ),
            }
          }
          return {
            appliedCoupon: null,
            items: [...state.items, { ...item, quantity: item.quantity ?? 1 }],
          }
        })
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          appliedCoupon: null,
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }))
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }
        set((state) => ({
          appliedCoupon: null,
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: Math.min(quantity, i.stockQuantity) }
              : i
          ),
        }))
      },

      setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
      clearAppliedCoupon: () => set({ appliedCoupon: null }),
      clearCart: () => set({ items: [], appliedCoupon: null }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getItemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      getSubtotal: () =>
        get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    }),
    {
      name: 'boilabin-cart',
      version: 2,
      migrate: (persistedState) => ({
        ...(persistedState as Partial<CartState>),
        appliedCoupon: null,
      }),
    }
  )
)
