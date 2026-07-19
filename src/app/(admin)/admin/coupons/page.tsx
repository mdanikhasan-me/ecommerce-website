import Link from 'next/link'

import { db } from '@/backend/database'
import { parseAdminListPage } from '@/backend/admin/list-filters'
import { formatDate, formatPrice } from '@/backend/utils'
import {
  AdminFiltersButton,
  AdminListAction,
  AdminListHeader,
  AdminListPagination,
  AdminListSummary,
  AdminListTabs,
  AdminSearchField,
  AdminSelectField,
} from '@/frontend/components/admin/AdminListPrimitives'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

export const metadata = { title: 'Admin Coupons' }

type CouponStatus = 'active' | 'scheduled' | 'expired' | 'disabled' | 'limit'

function getCouponStatus(coupon: {
  isActive: boolean
  startsAt: Date | null
  expiresAt: Date | null
  usageLimit: number | null
  usageCount: number
}, now: Date): { value: CouponStatus; label: string; tone: 'success' | 'info' | 'danger' | 'neutral' | 'warning' } {
  if (!coupon.isActive) return { value: 'disabled', label: 'Disabled', tone: 'neutral' }
  if (coupon.startsAt && coupon.startsAt > now) return { value: 'scheduled', label: 'Scheduled', tone: 'info' }
  if (coupon.expiresAt && coupon.expiresAt < now) return { value: 'expired', label: 'Expired', tone: 'danger' }
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return { value: 'limit', label: 'Limit reached', tone: 'warning' }
  return { value: 'active', label: 'Active', tone: 'success' }
}

const TYPE_VALUES = new Set(['PERCENTAGE', 'FIXED'])
const ELIGIBILITY_VALUES = new Set(['catalog', 'restricted'])
const SCHEDULE_VALUES = new Set(['no_expiry', 'scheduled', 'expired'])
const SORT_VALUES = new Set(['created', 'name', 'usage', 'expiry'])

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    q?: string
    type?: string
    eligibility?: string
    schedule?: string
    status?: string
    sort?: string
  }>
}) {
  const params = await searchParams
  const page = parseAdminListPage(params.page)
  const limit = 20
  const q = params.q?.trim().slice(0, 120).toLowerCase() ?? ''
  const type = TYPE_VALUES.has(params.type ?? '') ? params.type! : ''
  const eligibility = ELIGIBILITY_VALUES.has(params.eligibility ?? '') ? params.eligibility! : ''
  const schedule = SCHEDULE_VALUES.has(params.schedule ?? '') ? params.schedule! : ''
  const status = ['active', 'scheduled', 'expired', 'restricted'].includes(params.status ?? '') ? params.status! : ''
  const sort = SORT_VALUES.has(params.sort ?? '') ? params.sort! : 'created'
  const coupons = await db.coupon.findMany()
  const now = new Date()

  const statusRows = coupons.map((coupon) => ({ coupon, status: getCouponStatus(coupon, now) }))
  const activeCount = statusRows.filter((item) => item.status.value === 'active').length
  const scheduledCount = statusRows.filter((item) => item.status.value === 'scheduled').length
  const expiredCount = statusRows.filter((item) => item.status.value === 'expired').length
  const restrictedCount = coupons.filter((coupon) => coupon.categoryIds.length + coupon.productIds.length > 0).length

  const filtered = statusRows.filter(({ coupon, status: couponStatus }) => {
    if (q && !coupon.code.toLowerCase().includes(q) && !coupon.name.toLowerCase().includes(q)) return false
    if (type && coupon.type !== type) return false
    const isRestricted = coupon.categoryIds.length + coupon.productIds.length > 0
    if (eligibility === 'catalog' && isRestricted) return false
    if (eligibility === 'restricted' && !isRestricted) return false
    if (schedule === 'no_expiry' && coupon.expiresAt) return false
    if (schedule === 'scheduled' && couponStatus.value !== 'scheduled') return false
    if (schedule === 'expired' && couponStatus.value !== 'expired') return false
    if (status === 'restricted' && !isRestricted) return false
    if (status && status !== 'restricted' && couponStatus.value !== status) return false
    return true
  }).sort((a, b) => {
    if (sort === 'name') return a.coupon.code.localeCompare(b.coupon.code)
    if (sort === 'usage') return b.coupon.usageCount - a.coupon.usageCount
    if (sort === 'expiry') return (a.coupon.expiresAt?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.coupon.expiresAt?.getTime() ?? Number.MAX_SAFE_INTEGER)
    return b.coupon.createdAt.getTime() - a.coupon.createdAt.getTime()
  })

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const skip = (page - 1) * limit
  const visibleCoupons = filtered.slice(skip, skip + limit)
  const pageHref = (targetPage: number) => {
    const search = new URLSearchParams()
    if (targetPage > 1) search.set('page', String(targetPage))
    if (q) search.set('q', q)
    if (type) search.set('type', type)
    if (eligibility) search.set('eligibility', eligibility)
    if (schedule) search.set('schedule', schedule)
    if (status) search.set('status', status)
    if (sort !== 'created') search.set('sort', sort)
    const suffix = search.toString()
    return suffix ? `/admin/coupons?${suffix}` : '/admin/coupons'
  }

  return (
    <div className="admin-list-page">
      <AdminListHeader
        title="Coupons"
        description="Manage discounts, eligibility, schedules and redemption limits."
        actions={<AdminListAction href="/admin/coupons/new" icon="plus" primary>Create coupon</AdminListAction>}
      />

      <AdminListTabs
        label="Coupon status"
        tabs={[
          { label: 'All coupons', count: coupons.length, href: '/admin/coupons', active: !status },
          { label: 'Active', count: activeCount, href: '/admin/coupons?status=active', active: status === 'active' },
          { label: 'Scheduled', count: scheduledCount, href: '/admin/coupons?status=scheduled', active: status === 'scheduled' },
          { label: 'Expired', count: expiredCount, href: '/admin/coupons?status=expired', active: status === 'expired' },
          { label: 'Restricted', count: restrictedCount, href: '/admin/coupons?status=restricted', active: status === 'restricted' },
        ]}
      />

      <form className="admin-list-toolbar" action="/admin/coupons">
        <AdminSearchField defaultValue={q} placeholder="Search coupon code or offer" />
        <AdminSelectField label="Discount type" name="type" defaultValue={type}>
          <option value="">All types</option>
          <option value="PERCENTAGE">Percentage</option>
          <option value="FIXED">Fixed amount</option>
        </AdminSelectField>
        <AdminSelectField label="Eligibility" name="eligibility" defaultValue={eligibility}>
          <option value="">All audiences</option>
          <option value="catalog">Entire catalog</option>
          <option value="restricted">Restricted offers</option>
        </AdminSelectField>
        <AdminSelectField label="Schedule" name="schedule" defaultValue={schedule}>
          <option value="">Any date</option>
          <option value="no_expiry">No expiry</option>
          <option value="scheduled">Scheduled</option>
          <option value="expired">Expired</option>
        </AdminSelectField>
        <AdminFiltersButton />
        <AdminSelectField label="Sort" name="sort" defaultValue={sort} className="admin-list-sort">
          <option value="created">Recently created</option>
          <option value="name">Code A–Z</option>
          <option value="usage">Most used</option>
          <option value="expiry">Expiring first</option>
        </AdminSelectField>
      </form>

      <AdminListSummary strong={`${total} ${total === 1 ? 'coupon' : 'coupons'}`} detail={`${activeCount} active · ${expiredCount} expired`} />

      <section className="admin-list-card" aria-label="Coupons">
        <div className="admin-list-table-wrap">
          <table className="admin-list-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Offer</th>
                <th>Eligibility</th>
                <th>Minimum spend</th>
                <th>Usage</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleCoupons.length === 0 ? (
                <tr><td colSpan={8} className="admin-empty-cell text-center text-muted-foreground">No coupons match these filters.</td></tr>
              ) : visibleCoupons.map(({ coupon, status: couponStatus }) => {
                const scopeCount = coupon.categoryIds.length + coupon.productIds.length
                const offer = coupon.type === 'PERCENTAGE'
                  ? `${coupon.value}% off${coupon.maxDiscount ? ` up to ${formatPrice(coupon.maxDiscount)}` : ''}`
                  : `${formatPrice(coupon.value)} off`
                return (
                  <tr key={coupon.id}>
                    <td data-primary>
                      <p className="admin-table-primary text-blue-700">{coupon.code}</p>
                      <p className="admin-table-secondary">Coupon code</p>
                    </td>
                    <td data-label="Offer"><p className="admin-table-primary">{offer}</p><p className="admin-table-secondary">{coupon.name}</p></td>
                    <td data-label="Eligibility"><p className="admin-table-primary">{scopeCount ? `${scopeCount} selected ${scopeCount === 1 ? 'item' : 'items'}` : 'Entire catalog'}</p><p className="admin-table-secondary">All customers</p></td>
                    <td data-label="Minimum spend"><p className="admin-table-primary">{coupon.minOrderAmount > 0 ? formatPrice(coupon.minOrderAmount) : 'None'}</p><p className="admin-table-secondary">Minimum order value</p></td>
                    <td data-label="Usage"><p className="admin-table-primary">{coupon.usageCount} / {coupon.usageLimit ?? '∞'}</p><p className="admin-table-secondary">Redemptions</p></td>
                    <td data-label="Schedule" className={couponStatus.value === 'expired' ? 'text-red-600' : 'text-muted-foreground'}>{coupon.expiresAt ? `Ends ${formatDate(coupon.expiresAt)}` : 'No expiry'}</td>
                    <td data-label="Status"><span className="admin-table-status" data-tone={couponStatus.tone}>{couponStatus.label}</span></td>
                    <td data-action>
                      <Link href={`/admin/coupons/${coupon.id}`} className="admin-table-action" aria-label={`Edit ${coupon.code}`}>
                        <span className="sm:sr-only">Edit coupon</span><LocalIcon name="pencil" className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <AdminListPagination
        page={page}
        totalPages={totalPages}
        summary={total === 0 ? 'No coupons shown' : `Showing ${skip + 1}–${Math.min(skip + limit, total)} of ${total} coupons`}
        pageHref={pageHref}
      />
    </div>
  )
}
