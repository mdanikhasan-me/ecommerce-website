import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { slugify } from '@/backend/utils'

async function getSellerOrFail() {
  const session = await auth()
  if (!session?.user) return null
  return db.seller.findUnique({ where: { userId: session.user.id, status: 'APPROVED' } })
}

export async function POST(req: NextRequest) {
  try {
    const seller = await getSellerOrFail()
    if (!seller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const slug = slugify(body.name) + '-' + Date.now().toString(36)

    const product = await db.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        shortDescription: body.shortDescription || null,
        sku: body.sku,
        price: body.price,
        salePrice: body.salePrice || null,
        costPrice: body.costPrice || null,
        stockQuantity: body.stockQuantity || 0,
        weight: body.weight || null,
        categoryId: body.categoryId,
        brandId: body.brandId || null,
        sellerId: seller.id,
        isActive: body.isActive ?? false,
        isFeatured: body.isFeatured ?? false,
        isNew: body.isNew ?? true,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
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
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const seller = await getSellerOrFail()
    if (!seller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 })

    const existing = await db.product.findUnique({ where: { id, sellerId: seller.id } })
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const body = await req.json()

    // Delete old variants and recreate
    await db.productVariant.deleteMany({ where: { productId: id } })

    const product = await db.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        shortDescription: body.shortDescription || null,
        sku: body.sku,
        price: body.price,
        salePrice: body.salePrice || null,
        costPrice: body.costPrice || null,
        stockQuantity: body.stockQuantity || 0,
        weight: body.weight || null,
        categoryId: body.categoryId,
        brandId: body.brandId || null,
        isActive: body.isActive ?? false,
        isFeatured: body.isFeatured ?? false,
        isNew: body.isNew ?? false,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
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
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
