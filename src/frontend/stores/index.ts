/**
 * Zustand Stores — Barrel Export
 *
 * Organized into separate store modules:
 *   cart.ts     → Shopping cart state & actions
 *   wishlist.ts → Wishlist state & actions
 *   compare.ts  → Product comparison state & actions
 */

export { useCartStore, type CartItem } from './cart'
export { useWishlistStore } from './wishlist'
export { useCompareStore } from './compare'
