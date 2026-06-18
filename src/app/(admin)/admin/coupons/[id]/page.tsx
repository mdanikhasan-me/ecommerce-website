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

  if (!coupon) notFound()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{coupon.code}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update coupon schedule, restrictions, value, and usage rules.
          </p>
        </div>
        <Link href="/admin/coupons" className="btn-outline">
          Back to Coupons
        </Link>
      </div>

      <div className="rounded-md border border-border bg-card p-5">
        <CouponEditorForm categories={categories} products={products} coupon={coupon} />
      </div>
    </div>
  )
}
