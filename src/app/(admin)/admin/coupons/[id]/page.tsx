import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { CouponEditorForm } from '@/frontend/components/admin/CouponEditorForm'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata = { title: 'Admin Edit Coupon' }

export default async function AdminCouponDetailPage({ params }: Props) {
  const { id } = await params
  const [coupon, categories, products] = await Promise.all([
    db.coupon.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        type: true,
        value: true,
        minOrderAmount: true,
        maxDiscount: true,
        usageLimit: true,
        perUserLimit: true,
        isActive: true,
        startsAt: true,
        expiresAt: true,
        categoryIds: true,
        productIds: true,
      },
    }),
    db.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, parent: { select: { name: true } } },
      orderBy: { name: 'asc' },
    }),
    db.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, sku: true, category: { select: { name: true } } },
      orderBy: { name: 'asc' },
      take: 1000,
    }),
  ])

  if (!coupon) notFound()

  return (
    <div className="space-y-6">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{coupon.code}</h1>
          <p className="admin-page-description">Update the offer, qualifying items, limits, and publishing schedule.</p>
        </div>
        <Link href="/admin/coupons" className="btn-outline">
          Back to coupons
        </Link>
      </header>

      <CouponEditorForm
        categories={categories
          .map((category) => ({
            id: category.id,
            name: category.parent ? `${category.parent.name} / ${category.name}` : category.name,
          }))
          .sort((left, right) => left.name.localeCompare(right.name))}
        products={products.map((product) => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          categoryName: product.category.name,
        }))}
        coupon={coupon}
      />
    </div>
  )
}
