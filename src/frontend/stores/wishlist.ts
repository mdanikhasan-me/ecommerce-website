import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  items: string[] // productIds
  toggle: (productId: string) => void
  has: (productId: string) => boolean
  reconcileAvailable: (requestedIds: string[], availableIds: string[]) => void
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
      reconcileAvailable: (requestedIds, availableIds) => {
        const requested = new Set(requestedIds)
        const available = new Set(availableIds)
        set((state) => {
          const nextItems = state.items.filter((id) => !requested.has(id) || available.has(id))
          return nextItems.length === state.items.length ? state : { items: nextItems }
        })
      },
      clear: () => set({ items: [] }),
    }),
    { name: 'boilabin-wishlist' }
  )
)
