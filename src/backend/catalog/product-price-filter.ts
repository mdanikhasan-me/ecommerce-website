import type { Prisma } from '@prisma/client'

export function parsePriceParam(value: string | null | undefined) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function buildEffectivePriceWhere(
  minPrice: number | null,
  maxPrice: number | null,
): Prisma.ProductWhereInput | null {
  const clauses: Prisma.ProductWhereInput[] = []

  if (minPrice !== null) {
    clauses.push({
      OR: [
        { salePrice: { not: null, gte: minPrice } },
        { salePrice: null, basePrice: { gte: minPrice } },
      ],
    })
  }

  if (maxPrice !== null) {
    clauses.push({
      OR: [
        { salePrice: { not: null, lte: maxPrice } },
        { salePrice: null, basePrice: { lte: maxPrice } },
      ],
    })
  }

  if (clauses.length === 0) return null
  return clauses.length === 1 ? clauses[0] : { AND: clauses }
}

export type EffectivePriceSortDirection = 'asc' | 'desc'

export function getEffectivePriceSortDirection(
  sort: string | null | undefined,
): EffectivePriceSortDirection | null {
  if (sort === 'price_asc') return 'asc'
  if (sort === 'price_desc') return 'desc'
  return null
}

export function sortProductsByEffectivePrice<
  T extends { id: string; basePrice: number; salePrice?: number | null },
>(products: T[], direction: EffectivePriceSortDirection): T[] {
  const multiplier = direction === 'asc' ? 1 : -1

  return [...products].sort((a, b) => {
    const aPrice = a.salePrice ?? a.basePrice
    const bPrice = b.salePrice ?? b.basePrice
    const priceDiff = (aPrice - bPrice) * multiplier

    if (priceDiff !== 0) return priceDiff
    return a.id.localeCompare(b.id)
  })
}
