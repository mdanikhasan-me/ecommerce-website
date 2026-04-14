import Link from 'next/link'
import { db } from '@/backend/database'
import { CouponEditorForm } from '@/frontend/components/admin/CouponEditorForm'

export const metadata = { title: 'Admin Create Coupon' }

export default async function AdminNewCouponPage() {
  const [categories, products] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    db.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, sku: true },
      orderBy: { name: 'asc' },
      take: 200,
    }),
  ])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Create Coupon</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build coupons with scheduling, limits, and category or product restrictions.
          </p>
        </div>
        <Link href="/admin/coupons" className="btn-outline">
          Back to Coupons
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <CouponEditorForm categories={categories} products={products} />
      </div>
    </div>
  )
}
