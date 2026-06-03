import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { db } from '@/backend/database'
import {
  buildEffectivePriceWhere,
  getEffectivePriceSortDirection,
  orderProductsById,
  selectEffectivePricePage,
} from '@/backend/catalog/product-price-filter'
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
  if (params.isNew) andClauses.push({ isNew: true })
  const effectivePriceWhere = buildEffectivePriceWhere(
    params.minPrice,
    params.maxPrice,
  )
  if (effectivePriceWhere) andClauses.push(effectivePriceWhere)
  const where: Prisma.ProductWhereInput = andClauses.length === 1 ? andClauses[0] : { AND: andClauses }
  const effectivePriceSort = getEffectivePriceSortDirection(params.sort)

  let orderBy: Prisma.ProductOrderByWithRelationInput = { soldCount: 'desc' }
  if (params.sort === 'newest') orderBy = { createdAt: 'desc' }
  else if (params.sort === 'rating') orderBy = { rating: 'desc' }

  const productInclude = {
    images: { where: { isPrimary: true }, take: 1 },
    category: { select: { name: true, slug: true } },
  } satisfies Prisma.ProductInclude

  const [products, total] = await Promise.all([
    effectivePriceSort
      ? db.product.findMany({
          where,
          orderBy: { id: 'asc' },
          select: { id: true, basePrice: true, salePrice: true },
        }).then(async (items) => {
          const pageIds = selectEffectivePricePage(items, effectivePriceSort, skip, limit).map((item) => item.id)
          if (pageIds.length === 0) return []

          const pageProducts = await db.product.findMany({
            where: getBuyerVisibleProductWhere({ id: { in: pageIds } }),
            include: productInclude,
          })

          return orderProductsById(pageProducts, pageIds)
        })
      : db.product.findMany({
          where, orderBy, skip, take: limit,
          include: productInclude,
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
