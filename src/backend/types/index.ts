/**
 * TypeScript Type Definitions — Barrel Export
 *
 * Organized into categorized modules:
 *   auth.ts     → NextAuth session augmentation
 *   product.ts  → Product, variant & review types
 *   order.ts    → Order, order item & address types
 *   category.ts → Category tree types
 *   payment.ts  → Payment gateway types
 *   search.ts   → Search filter types
 *   api.ts      → API response wrapper types
 */

// Auth types are declaration-merged, no explicit re-export needed
import './auth'

export type {
  ProductCardData,
  ProductDetailData,
  VariantData,
  ReviewData,
} from './product'

export type {
  OrderData,
  OrderItemData,
  AddressData,
} from './order'

export type { CategoryTree } from './category'

export type { PaymentGateway } from './payment'

export type { SearchFilters } from './search'

export type {
  ApiResponse,
  PaginatedResponse,
} from './api'
