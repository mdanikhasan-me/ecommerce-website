import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { db } from '@/backend/database'
import {
  buildEffectivePriceWhere,
  getEffectivePriceSortDirection,
  orderProductsById,
  parsePriceParam,
  selectEffectivePricePage,
} from '@/backend/catalog/product-price-filter'
import { getBuyerVisibleProductWhere } from '@/backend/catalog/product-visibility'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const page = Math.max(1, parseInt(sp.get('page') ?? '1'))
  const limit = Math.min(50, parseInt(sp.get('limit') ?? '24'))
  const skip = (page - 1) * limit

  const andClauses: Prisma.ProductWhereInput[] = [getBuyerVisibleProductWhere()]

  // Wishlist / multi-ID lookup
  const ids = sp.get('ids')
  if (ids) {
    const idList = ids.split(',').map((s) => s.trim()).filter(Boolean)
    if (idList.length > 0) andClauses.push({ id: { in: idList } })
  }

  if (sp.get('q')) {
    andClauses.push({
      OR: [
        { name: { contains: sp.get('q')!, mode: 'insensitive' } },
        { tags: { has: sp.get('q')!.toLowerCase() } },
      ],
    })
  }
  const category = sp.get('category')
  if (category) andClauses.push({ category: { slug: category } })
  if (sp.get('featured') === 'true') andClauses.push({ isFeatured: true })
  if (sp.get('new') === 'true') andClauses.push({ isNew: true })
  const effectivePriceWhere = buildEffectivePriceWhere(
    parsePriceParam(sp.get('minPrice')),
    parsePriceParam(sp.get('maxPrice')),
  )
  if (effectivePriceWhere) andClauses.push(effectivePriceWhere)
  const where: Prisma.ProductWhereInput = andClauses.length === 1 ? andClauses[0] : { AND: andClauses }
  const effectivePriceSort = getEffectivePriceSortDirection(sp.get('sort'))

  let orderBy: Prisma.ProductOrderByWithRelationInput = { soldCount: 'desc' }
  const sort = sp.get('sort')
  if (sort === 'newest') orderBy = { createdAt: 'desc' }
  else if (sort === 'rating') orderBy = { rating: 'desc' }

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
