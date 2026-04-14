import type { Metadata } from 'next'
import { auth } from '@/backend/auth'
import { redirect } from 'next/navigation'
import { db } from '@/backend/database'
import { ProductForm } from '@/frontend/components/seller/ProductForm'

export const metadata: Metadata = { title: 'Add Product | Boilabin Seller' }

export default async function NewProductPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const seller = await db.seller.findUnique({ where: { userId: session.user.id } })
  if (!seller) redirect('/seller/register')

  const [categories, brands] = await Promise.all([
    db.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true, parentId: true } }),
    db.brand.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Fill in the details to list a new product in your store</p>
      </div>
      <ProductForm categories={categories} brands={brands} sellerId={seller.id} />
    </div>
  )
}
