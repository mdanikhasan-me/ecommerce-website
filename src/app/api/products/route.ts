import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const page = Math.max(1, parseInt(sp.get('page') ?? '1'))
  const limit = Math.min(50, parseInt(sp.get('limit') ?? '24'))
  const skip = (page - 1) * limit

  const where: any = { isActive: true }

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
      { brand: { name: { contains: sp.get('q')!, mode: 'insensitive' } } },
    ]
  }
  if (sp.get('category')) where.category = { slug: sp.get('category') }
  if (sp.get('brand')) where.brand = { slug: sp.get('brand') }
  if (sp.get('featured') === 'true') where.isFeatured = true
  if (sp.get('new') === 'true') where.isNew = true
  if (sp.get('minPrice')) where.basePrice = { ...where.basePrice, gte: parseFloat(sp.get('minPrice')!) }
  if (sp.get('maxPrice')) where.basePrice = { ...where.basePrice, lte: parseFloat(sp.get('maxPrice')!) }

  let orderBy: any = { soldCount: 'desc' }
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
        brand: { select: { name: true, slug: true } },
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { images, specifications, variants, ...productData } = body

    const product = await db.product.create({
      data: {
        ...productData,
        images: images?.length ? { create: images } : undefined,
        specifications: specifications?.length ? { create: specifications } : undefined,
        variants: variants?.length ? {
          create: variants.map((v: any) => ({
            ...v,
            options: v.options?.length ? { create: v.options } : undefined,
          }))
        } : undefined,
      },
      include: { images: true },
    })

    return NextResponse.json({ success: true, product }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
