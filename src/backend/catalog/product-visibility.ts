import { Prisma, SellerStatus } from '@prisma/client'

export type ProductLifecycleState =
  | 'DRAFT'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'REJECTED'
  | 'ARCHIVED'
  | 'DISCONTINUED'
  | 'DELETED'

export const PRODUCT_LIFECYCLE_CONTRACT: Record<ProductLifecycleState, {
  buyerVisible: boolean
  sitemapEligible: boolean
  merchantFeedEligible: boolean
  seoBehavior: 'index' | 'not-public' | 'future-410-or-redirect'
}> = {
  DRAFT: {
    buyerVisible: false,
    sitemapEligible: false,
    merchantFeedEligible: false,
    seoBehavior: 'not-public',
  },
  ACTIVE: {
    buyerVisible: true,
    sitemapEligible: true,
    merchantFeedEligible: true,
    seoBehavior: 'index',
  },
  INACTIVE: {
    buyerVisible: false,
    sitemapEligible: false,
    merchantFeedEligible: false,
    seoBehavior: 'not-public',
  },
  REJECTED: {
    buyerVisible: false,
    sitemapEligible: false,
    merchantFeedEligible: false,
    seoBehavior: 'not-public',
  },
  ARCHIVED: {
    buyerVisible: false,
    sitemapEligible: false,
    merchantFeedEligible: false,
    seoBehavior: 'not-public',
  },
  DISCONTINUED: {
    buyerVisible: false,
    sitemapEligible: false,
    merchantFeedEligible: false,
    seoBehavior: 'future-410-or-redirect',
  },
  DELETED: {
    buyerVisible: false,
    sitemapEligible: false,
    merchantFeedEligible: false,
    seoBehavior: 'not-public',
  },
}

export const buyerVisibleProductBaseWhere = {
  isActive: true,
  category: { isActive: true },
  seller: { status: SellerStatus.APPROVED },
} satisfies Prisma.ProductWhereInput

export function andProductWhere(
  ...clauses: Array<Prisma.ProductWhereInput | null | undefined>
): Prisma.ProductWhereInput {
  const activeClauses = clauses.filter((clause): clause is Prisma.ProductWhereInput => Boolean(clause))

  if (activeClauses.length === 0) return {}
  if (activeClauses.length === 1) return activeClauses[0]

  return { AND: activeClauses }
}

export function getBuyerVisibleProductWhere(extra?: Prisma.ProductWhereInput): Prisma.ProductWhereInput {
  return andProductWhere(buyerVisibleProductBaseWhere, extra)
}

export function getSitemapVisibleProductWhere(extra?: Prisma.ProductWhereInput): Prisma.ProductWhereInput {
  return getBuyerVisibleProductWhere(extra)
}

export function getPublicProductDetailWhere(slug: string): Prisma.ProductWhereInput {
  return getBuyerVisibleProductWhere({ slug })
}

export function getLegacyProductLifecycleState(product: { isActive: boolean }): ProductLifecycleState {
  return product.isActive ? 'ACTIVE' : 'INACTIVE'
}

export function isProductBuyerVisible(product: {
  isActive: boolean
  category?: { isActive: boolean } | null
  seller?: { status: SellerStatus | string } | null
}) {
  return (
    product.isActive &&
    product.category?.isActive === true &&
    product.seller?.status === SellerStatus.APPROVED
  )
}

export function getProductAvailabilityForJsonLd(product: {
  stockQuantity?: number | null
  lifecycleState?: ProductLifecycleState
}) {
  if (product.lifecycleState === 'DISCONTINUED') return 'https://schema.org/Discontinued'

  return (product.stockQuantity ?? 1) > 0
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock'
}
