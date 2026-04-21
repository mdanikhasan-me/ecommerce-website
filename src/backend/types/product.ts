// PRODUCT TYPES
export interface ProductCardData {
  id: string
  name: string
  slug: string
  basePrice: number
  salePrice?: number | null
  rating: number
  reviewCount: number
  soldCount: number
  stockQuantity: number
  isFeatured: boolean
  isNew: boolean
  isBestSeller: boolean
  images: { url: string; isPrimary: boolean }[]
  category: { name: string; slug: string }
}

export interface ProductDetailData extends ProductCardData {
  description: string
  shortDescription?: string | null
  sku: string
  tags: string[]
  variants: VariantData[]
  attributes: { name: string; value: string }[]
  specifications: { group?: string | null; name: string; value: string }[]
  reviews: ReviewData[]
}

export interface VariantData {
  id: string
  name: string
  sku: string
  price?: number | null
  salePrice?: number | null
  stockQuantity: number
  image?: string | null
  options: { name: string; value: string }[]
}

// REVIEW TYPES
export interface ReviewData {
  id: string
  rating: number
  title?: string | null
  body: string
  images: string[]
  isVerifiedBuy: boolean
  helpfulCount: number
  createdAt: Date
  user: { name?: string | null; image?: string | null }
}
