import Link from 'next/link'
import { Pencil, Plus, Ticket } from 'lucide-react'
import { db } from '@/backend/database'
import { formatDate, formatPrice } from '@/backend/utils'

export const metadata = { title: 'Admin Coupons' }

function getCouponStatus(coupon: {
  isActive: boolean
  startsAt: Date | null
  expiresAt: Date | null
  usageLimit: number | null
  usageCount: number
}, now: Date) {
  if (!coupon.isActive) return { label: 'Disabled', className: 'bg-red-50 text-red-700' }
  if (coupon.startsAt && coupon.startsAt > now) return { label: 'Scheduled', className: 'bg-blue-50 text-blue-700' }
  if (coupon.expiresAt && coupon.expiresAt < now) return { label: 'Expired', className: 'bg-red-50 text-red-700' }
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return { label: 'Limit reached', className: 'bg-amber-50 text-amber-700' }
  return { label: 'Active', className: 'bg-green-50 text-green-700' }
}

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  const now = new Date()
  const activeCount = coupons.filter((coupon) => getCouponStatus(coupon, now).label === 'Active').length
  const restrictedCount = coupons.filter((coupon) => coupon.categoryIds.length || coupon.productIds.length).length

  return (
    <div className="space-y-6">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Coupons</h1>
          <p className="admin-page-description">Manage discounts, eligibility, schedules, and redemption limits.</p>
        </div>
        <Link href="/admin/coupons/new" className="btn-primary gap-2">
          <Plus className="h-4 w-4" /> Create coupon
        </Link>
      </header>

      <section className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Coupon summary">
        <div className="admin-card p-3 sm:p-4">
          <p className="text-xs text-muted-foreground">Total coupons</p>
          <p className="mt-1 admin-page-title">{coupons.length}</p>
        </div>
        <div className="admin-card p-3 sm:p-4">
          <p className="text-xs text-muted-foreground">Active now</p>
          <p className="mt-1 admin-page-title text-green-600">{activeCount}</p>
        </div>
        <div className="admin-card p-3 sm:p-4">
          <p className="text-xs text-muted-foreground">Restricted offers</p>
          <p className="mt-1 admin-page-title">{restrictedCount}</p>
        </div>
      </section>

      <section className="admin-card p-3" aria-label="Coupon list">
        {coupons.length === 0 ? (
          <div className="py-14 text-center text-muted-foreground">
            <Ticket className="mx-auto mb-3 h-8 w-8 opacity-35" />
            <p className="text-sm font-medium">No coupons created yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="hidden grid-cols-[minmax(7rem,0.8fr)_minmax(10rem,1.4fr)_minmax(9rem,1fr)_minmax(8rem,0.9fr)_minmax(7rem,0.7fr)_minmax(7rem,0.75fr)_2.5rem] gap-3 px-4 pb-1 text-[11px] font-semibold text-muted-foreground lg:grid">
              <span>Code</span>
              <span>Offer</span>
              <span>Eligibility</span>
              <span>Minimum spend</span>
              <span>Usage</span>
              <span>Status</span>
              <span className="sr-only">Edit</span>
            </div>
            {coupons.map((coupon) => {
              const status = getCouponStatus(coupon, now)
              const scopeCount = coupon.categoryIds.length + coupon.productIds.length
              const offer = coupon.type === 'PERCENTAGE'
                ? `${coupon.value}%${coupon.maxDiscount ? ` up to ${formatPrice(coupon.maxDiscount)}` : ''}`
                : formatPrice(coupon.value)

              return (
                <article
                  key={coupon.id}
                  className="relative grid grid-cols-2 gap-x-3 gap-y-4 rounded-lg bg-secondary/45 px-3 py-4 sm:px-4 lg:grid-cols-[minmax(7rem,0.8fr)_minmax(10rem,1.4fr)_minmax(9rem,1fr)_minmax(8rem,0.9fr)_minmax(7rem,0.7fr)_minmax(7rem,0.75fr)_2.5rem] lg:items-center"
                >
                  <div className="col-span-2 pr-12 lg:col-span-1 lg:pr-0">
                    <p className="font-mono text-sm font-bold text-primary">{coupon.code}</p>
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <p className="text-sm font-semibold">{offer}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{coupon.name}</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{scopeCount ? `${scopeCount} selected` : 'Entire catalog'}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Qualifying items</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{coupon.minOrderAmount > 0 ? formatPrice(coupon.minOrderAmount) : 'None'}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Eligible spend</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{coupon.usageCount}{coupon.usageLimit ? ` of ${coupon.usageLimit}` : ''}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Redemptions</p>
                  </div>
                  <div>
                    <span className={`admin-status-pill ${status.className}`}>{status.label}</span>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'No expiry'}
                    </p>
                  </div>
                  <Link href={`/admin/coupons/${coupon.id}`} className="admin-icon-button absolute right-3 top-3 lg:static" aria-label={`Edit ${coupon.code}`} title={`Edit ${coupon.code}`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
