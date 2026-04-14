import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  items: string[] // productIds
  toggle: (productId: string) => void
  has: (productId: string) => boolean
  clear: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (productId) => {
        set((s) =>
          s.items.includes(productId)
            ? { items: s.items.filter((id) => id !== productId) }
            : { items: [...s.items, productId] }
        )
      },
      has: (productId) => get().items.includes(productId),
      clear: () => set({ items: [] }),
    }),
    { name: 'boilabin-wishlist' }
  )
)
