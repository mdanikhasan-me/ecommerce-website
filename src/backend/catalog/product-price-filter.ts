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

type EffectivePriceProduct = {
  id: string
  basePrice: number
  salePrice?: number | null
}

export function getEffectivePriceSortDirection(
  sort: string | null | undefined,
): EffectivePriceSortDirection | null {
  if (sort === 'price_asc') return 'asc'
  if (sort === 'price_desc') return 'desc'
  return null
}

export function sortProductsByEffectivePrice<
  T extends EffectivePriceProduct,
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

export function selectEffectivePricePage<T extends EffectivePriceProduct>(
  products: T[],
  direction: EffectivePriceSortDirection,
  skip: number,
  take: number,
): T[] {
  return sortProductsByEffectivePrice(products, direction).slice(skip, skip + take)
}

export function orderProductsById<T extends { id: string }>(
  products: T[],
  orderedIds: string[],
): T[] {
  const productById = new Map(products.map((product) => [product.id, product]))

  return orderedIds.flatMap((id) => {
    const product = productById.get(id)
    return product ? [product] : []
  })
}
