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
  if (minPrice === null && maxPrice === null) return null

  return {
    effectivePrice: {
      ...(minPrice !== null ? { gte: minPrice } : {}),
      ...(maxPrice !== null ? { lte: maxPrice } : {}),
    },
  }
}

export type EffectivePriceSortDirection = 'asc' | 'desc'

export function getEffectivePriceSortDirection(
  sort: string | null | undefined,
): EffectivePriceSortDirection | null {
  if (sort === 'price_asc') return 'asc'
  if (sort === 'price_desc') return 'desc'
  return null
}

export function buildEffectivePriceOrderBy(
  direction: EffectivePriceSortDirection | null,
): Prisma.ProductOrderByWithRelationInput[] | null {
  if (!direction) return null
  return [{ effectivePrice: direction }, { id: 'asc' }]
}

export function calculateEffectivePrice(basePrice: number, salePrice: number | null | undefined) {
  return salePrice ?? basePrice
}
