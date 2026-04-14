import type { Metadata } from 'next'
import { auth } from '@/backend/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { ProductForm } from '@/frontend/components/seller/ProductForm'

export const metadata: Metadata = { title: 'Seller Edit Product' }

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const seller = await db.seller.findUnique({ where: { userId: session.user.id } })
  if (!seller) redirect('/seller/register')

  const product = await db.product.findUnique({
    where: { id: params.id, sellerId: seller.id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: true,
    },
  })

  if (!product) notFound()

  const [categories, brands] = await Promise.all([
    db.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true, parentId: true } }),
    db.brand.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{product.name}</p>
      </div>
      <ProductForm categories={categories} brands={brands} sellerId={seller.id} product={product} />
    </div>
  )
}
