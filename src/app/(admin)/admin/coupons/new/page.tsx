import Link from 'next/link'
import { db } from '@/backend/database'
import { CouponEditorForm } from '@/frontend/components/admin/CouponEditorForm'

export const metadata = { title: 'Admin Create Coupon' }

export default async function AdminNewCouponPage() {
  const [categories, products] = await Promise.all([
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

  return (
    <div className="space-y-6">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Create coupon</h1>
          <p className="admin-page-description">Build a clear offer with exact eligibility, limits, and scheduling.</p>
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
      />
    </div>
  )
}
