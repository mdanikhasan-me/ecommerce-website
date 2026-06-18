// SEARCH TYPES
export interface SearchFilters {
  q?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  inStock?: boolean
  bestSeller?: boolean
  sort?: 'popular' | 'newest' | 'price_asc' | 'price_desc' | 'rating'
  page?: number
  limit?: number
}
