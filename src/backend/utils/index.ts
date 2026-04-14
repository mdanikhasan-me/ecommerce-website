/**
 * Utility Functions — Barrel Export
 *
 * Organized into categorized modules:
 *   cn.ts       → Tailwind className merge utility
 *   format.ts   → Currency, date, rating & stock formatting
 *   commerce.ts → Shipping, coupons & order number generation
 *   string.ts   → Slugify, truncate, search params & image placeholders
 */

export { cn } from './cn'

export {
  formatPrice,
  calculateDiscount,
  formatDate,
  formatDateRelative,
  getRatingLabel,
  getStockStatus,
} from './format'

export {
  generateOrderNumber,
  calculateShipping,
  applyCoupon,
} from './commerce'

export {
  slugify,
  truncate,
  buildSearchParams,
  getImagePlaceholder,
} from './string'
