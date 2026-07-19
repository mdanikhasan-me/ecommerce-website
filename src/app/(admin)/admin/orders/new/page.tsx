import Link from 'next/link'

import { db } from '@/backend/database'
import { getBuyerVisibleProductWhere } from '@/backend/catalog/product-visibility'
import { AdminCreateOrderForm } from '@/frontend/components/admin/AdminCreateOrderForm'
import { AdminListHeader } from '@/frontend/components/admin/AdminListPrimitives'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

export const metadata = { title: 'Create order | Admin' }

export default async function AdminCreateOrderPage() {
  const [customers, products] = await Promise.all([
    db.user.findMany({
      where: { role: 'CUSTOMER', isActive: true },
      orderBy: [{ name: 'asc' }, { email: 'asc' }],
      take: 500,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        addresses: {
          where: { isSaved: true },
          orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
          select: {
            id: true,
            fullName: true,
            phone: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            district: true,
            division: true,
            postalCode: true,
          },
        },
      },
    }),
    db.product.findMany({
      where: getBuyerVisibleProductWhere({ stockQuantity: { gt: 0 } }),
      orderBy: { name: 'asc' },
      take: 1000,
      select: {
        id: true,
        name: true,
        sku: true,
        basePrice: true,
        salePrice: true,
        stockQuantity: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 1, select: { url: true } },
        variants: {
          where: { isActive: true, stockQuantity: { gt: 0 } },
          orderBy: { sortOrder: 'asc' },
          select: { id: true, name: true, sku: true, price: true, salePrice: true, stockQuantity: true },
        },
      },
    }),
  ])

  return (
    <div className="admin-list-page">
      <AdminListHeader
        title="Create order"
        description="Create a customer order using live catalog prices, stock and delivery data."
        actions={
          <Link href="/admin/orders" className="admin-list-action">
            <LocalIcon name="arrow-left" className="h-4 w-4" /> Back to orders
          </Link>
        }
      />
      <AdminCreateOrderForm
        customers={customers}
        products={products.map((product) => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: product.salePrice ?? product.basePrice,
          stockQuantity: product.stockQuantity,
          imageUrl: product.images[0]?.url ?? null,
          variants: product.variants,
        }))}
      />
    </div>
  )
}
