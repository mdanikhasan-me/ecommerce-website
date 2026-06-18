import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { db } from '@/backend/database'
import {
  buildEffectivePriceOrderBy,
  buildEffectivePriceWhere,
  getEffectivePriceSortDirection,
} from '@/backend/catalog/product-price-filter'
import { productCardSelect } from '@/backend/catalog/product-card-select'
import { getBuyerVisibleProductWhere } from '@/backend/catalog/product-visibility'
import { parseProductApiParams } from '@/backend/catalog/search-params'

export async function GET(req: NextRequest) {
  const params = parseProductApiParams(req.nextUrl.searchParams)
  const page = params.page
  const limit = params.limit
  const skip = (page - 1) * limit

  const andClauses: Prisma.ProductWhereInput[] = [getBuyerVisibleProductWhere()]

  // Wishlist / multi-ID lookup
  if (params.ids.length > 0) andClauses.push({ id: { in: params.ids } })

  if (params.q) {
    andClauses.push({
      OR: [
        { name: { contains: params.q, mode: 'insensitive' } },
        { tags: { has: params.q.toLowerCase() } },
      ],
    })
  }
  if (params.category) andClauses.push({ category: { slug: params.category } })
  if (params.featured) andClauses.push({ isFeatured: true })
  if (params.bestSeller) andClauses.push({ isBestSeller: true })
  if (params.isNew) andClauses.push({ isNew: true })
  const effectivePriceWhere = buildEffectivePriceWhere(
    params.minPrice,
    params.maxPrice,
  )
  if (effectivePriceWhere) andClauses.push(effectivePriceWhere)
  const where: Prisma.ProductWhereInput = andClauses.length === 1 ? andClauses[0] : { AND: andClauses }
  const effectivePriceSort = getEffectivePriceSortDirection(params.sort)
  const effectivePriceOrderBy = buildEffectivePriceOrderBy(effectivePriceSort)

  let orderBy: Prisma.ProductOrderByWithRelationInput = { soldCount: 'desc' }
  if (params.sort === 'newest') orderBy = { createdAt: 'desc' }
  else if (params.sort === 'rating') orderBy = { rating: 'desc' }

  // Opt-in extra detail (specs + attributes) used by the compare page.
  const includeDetails = req.nextUrl.searchParams.get('details') === '1'
  const productSelect = {
    ...productCardSelect,
    ...(includeDetails
      ? {
          description: true,
          shortDescription: true,
          attributes: { select: { id: true, name: true, value: true }, orderBy: { sortOrder: 'asc' } },
          specifications: { select: { group: true, name: true, value: true, sortOrder: true }, orderBy: { sortOrder: 'asc' } },
        }
      : {}),
  } satisfies Prisma.ProductSelect

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: effectivePriceOrderBy ?? orderBy,
      skip,
      take: limit,
      select: productSelect,
    }),
    db.product.count({ where }),
  ])

  return NextResponse.json({
    items: products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}
