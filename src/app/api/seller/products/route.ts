import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { slugify } from '@/backend/utils'

async function getSellerOrFail() {
  const session = await auth()
  if (!session?.user) return null
  return db.seller.findFirst({ where: { userId: session.user.id, status: 'APPROVED' } })
}

function sellerString(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

export async function POST(req: NextRequest) {
  try {
    const seller = await getSellerOrFail()
    if (!seller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const name = sellerString(body.name, 200)
    const sku = sellerString(body.sku, 80)
    const description = sellerString(body.description, 10000)
    const categoryId = typeof body.categoryId === 'string' ? body.categoryId : null
    const basePrice = Number(body.price)
    if (!name || !sku || !categoryId || !Number.isFinite(basePrice) || basePrice < 0) {
      return NextResponse.json({ error: 'Invalid product fields' }, { status: 400 })
    }
    const slug = slugify(name) + '-' + Date.now().toString(36)

    const product = await db.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription: body.shortDescription ? sellerString(body.shortDescription, 500) : null,
        sku,
        basePrice,
        salePrice: body.salePrice != null ? Number(body.salePrice) : null,
        costPrice: body.costPrice != null ? Number(body.costPrice) : null,
        stockQuantity: Math.max(0, Math.floor(Number(body.stockQuantity) || 0)),
        weight: body.weight != null ? Number(body.weight) : null,
        categoryId,
        brandId: typeof body.brandId === 'string' ? body.brandId : null,
        sellerId: seller.id,
        isActive: false, // new seller products require admin review
        isFeatured: false,
        isBestSeller: false,
        isNew: true,
        metaTitle: body.metaTitle ? sellerString(body.metaTitle, 200) : null,
        metaDescription: body.metaDescription ? sellerString(body.metaDescription, 400) : null,
        variants: body.variants?.length > 0 ? {
          create: body.variants.map((v: any, idx: number) => ({
            name: v.name,
            value: v.value,
            price: v.price,
            stockQuantity: v.stockQuantity || 0,
            sortOrder: idx,
          })),
        } : undefined,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error: any) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Could not save product' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const seller = await getSellerOrFail()
    if (!seller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 })

    const existing = await db.product.findFirst({ where: { id, sellerId: seller.id } })
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const body = await req.json()
    const name = sellerString(body.name, 200)
    const sku = sellerString(body.sku, 80)
    const description = sellerString(body.description, 10000)
    const categoryId = typeof body.categoryId === 'string' ? body.categoryId : null
    const basePrice = Number(body.price)
    if (!name || !sku || !categoryId || !Number.isFinite(basePrice) || basePrice < 0) {
      return NextResponse.json({ error: 'Invalid product fields' }, { status: 400 })
    }

    // Delete old variants and recreate
    await db.productVariant.deleteMany({ where: { productId: id } })

    const product = await db.product.update({
      where: { id },
      data: {
        name,
        description,
        shortDescription: body.shortDescription ? sellerString(body.shortDescription, 500) : null,
        sku,
        basePrice,
        salePrice: body.salePrice != null ? Number(body.salePrice) : null,
        costPrice: body.costPrice != null ? Number(body.costPrice) : null,
        stockQuantity: Math.max(0, Math.floor(Number(body.stockQuantity) || 0)),
        weight: body.weight != null ? Number(body.weight) : null,
        categoryId,
        brandId: typeof body.brandId === 'string' ? body.brandId : null,
        // Sellers can toggle own product visibility on/off but cannot self-feature.
        isActive: Boolean(body.isActive ?? existing.isActive),
        isFeatured: existing.isFeatured,
        isBestSeller: existing.isBestSeller,
        isNew: existing.isNew,
        metaTitle: body.metaTitle ? sellerString(body.metaTitle, 200) : null,
        metaDescription: body.metaDescription ? sellerString(body.metaDescription, 400) : null,
        variants: body.variants?.length > 0 ? {
          create: body.variants.map((v: any, idx: number) => ({
            name: v.name,
            value: v.value,
            price: v.price,
            stockQuantity: v.stockQuantity || 0,
            sortOrder: idx,
          })),
        } : undefined,
      },
    })

    return NextResponse.json({ product })
  } catch (error: any) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Could not save product' }, { status: 500 })
  }
}
