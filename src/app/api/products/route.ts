import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { db } from '@/backend/database'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const page = Math.max(1, parseInt(sp.get('page') ?? '1'))
  const limit = Math.min(50, parseInt(sp.get('limit') ?? '24'))
  const skip = (page - 1) * limit

  const where: Prisma.ProductWhereInput = { isActive: true }

  // Wishlist / multi-ID lookup
  const ids = sp.get('ids')
  if (ids) {
    const idList = ids.split(',').map((s) => s.trim()).filter(Boolean)
    if (idList.length > 0) where.id = { in: idList }
  }

  if (sp.get('q')) {
    where.OR = [
      { name: { contains: sp.get('q')!, mode: 'insensitive' } },
      { tags: { has: sp.get('q')!.toLowerCase() } },
    ]
  }
  const category = sp.get('category')
  if (category) where.category = { slug: category }
  if (sp.get('featured') === 'true') where.isFeatured = true
  if (sp.get('new') === 'true') where.isNew = true
  const priceFilter: Prisma.FloatFilter<'Product'> = {}
  const minPrice = Number(sp.get('minPrice'))
  const maxPrice = Number(sp.get('maxPrice'))
  if (Number.isFinite(minPrice)) priceFilter.gte = minPrice
  if (Number.isFinite(maxPrice)) priceFilter.lte = maxPrice
  if (priceFilter.gte !== undefined || priceFilter.lte !== undefined) where.basePrice = priceFilter

  let orderBy: Prisma.ProductOrderByWithRelationInput = { soldCount: 'desc' }
  const sort = sp.get('sort')
  if (sort === 'newest') orderBy = { createdAt: 'desc' }
  else if (sort === 'price_asc') orderBy = { basePrice: 'asc' }
  else if (sort === 'price_desc') orderBy = { basePrice: 'desc' }
  else if (sort === 'rating') orderBy = { rating: 'desc' }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where, orderBy, skip, take: limit,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true, slug: true } },
      },
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
