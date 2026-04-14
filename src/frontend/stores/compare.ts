import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CompareState {
  items: string[]
  add: (productId: string) => boolean
  remove: (productId: string) => void
  has: (productId: string) => boolean
  clear: () => void
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (productId) => {
        if (get().items.length >= 4) return false
        if (get().items.includes(productId)) return true
        set((s) => ({ items: [...s.items, productId] }))
        return true
      },
      remove: (productId) => set((s) => ({ items: s.items.filter((id) => id !== productId) })),
      has: (productId) => get().items.includes(productId),
      clear: () => set({ items: [] }),
    }),
    { name: 'boilabin-compare' }
  )
)
