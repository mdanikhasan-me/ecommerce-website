import Link from 'next/link'
import { ArrowRight, Eye, Package, ShoppingBag, Star, TrendingUp, Users } from 'lucide-react'

import { requireAdminSession } from '@/backend/admin/admin-utils'
import {
  ADMIN_REPORT_EXPORT_METADATA,
  canExportAdminReport,
  getAdminReportData,
  parseAdminReportRange,
} from '@/backend/admin/reports'
import { trafficSourceLabel } from '@/backend/analytics/traffic-source'
import { formatDate, formatPrice } from '@/backend/utils'
import { AdminReportExportLink } from '@/frontend/components/admin/AdminReportExportLink'

export const metadata = { title: 'Admin Analytics' }

const REPORT_TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'sales', label: 'Sales' },
  { value: 'products', label: 'Products' },
  { value: 'customers', label: 'Customers' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'traffic', label: 'Traffic' },
] as const

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

function buildChartPoints(values: number[]) {
  const width = 680
  const height = 170
  const padding = 12
  const maximum = Math.max(...values, 1)
  return values.map((value, index) => ({
    x: padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2),
    y: height - padding - (value / maximum) * (height - padding * 2),
  }))
}

function TrendChart({
  title,
  description,
  values,
  start,
  end,
}: {
  title: string
  description: string
  values: number[]
  start: Date
  end: Date
}) {
  const points = buildChartPoints(values.length ? values : [0, 0])
  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ')
  const areaPath = `M ${points[0].x} 170 L ${points.map((point) => `${point.x} ${point.y}`).join(' L ')} L ${points.at(-1)?.x ?? 668} 170 Z`
  const dateFormat = new Intl.DateTimeFormat('en-BD', { day: 'numeric', month: 'short' })

  return (
    <article className="admin-card p-4 sm:p-5">
      <h2 className="admin-section-title">{title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <div className="mt-4 rounded-lg bg-secondary/45 p-3">
        <svg viewBox="0 0 680 170" className="h-40 w-full text-foreground" role="img" aria-label={title}>
          <path d={areaPath} className="fill-foreground/5" />
          <polyline points={polyline} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="mt-2 flex justify-between text-[11px] font-medium text-muted-foreground">
          <span>{dateFormat.format(start)}</span>
          <span>{dateFormat.format(end)}</span>
        </div>
      </div>
    </article>
  )
}

interface Props {
  searchParams: Promise<{ from?: string; to?: string; tab?: string }>
}

export default async function AdminReportsPage({ searchParams }: Props) {
  const session = await requireAdminSession()
  const filters = await searchParams
  const activeTab = REPORT_TABS.some((tab) => tab.value === filters.tab) ? filters.tab! : 'overview'
  const range = parseAdminReportRange(filters.from, filters.to)
  const report = await getAdminReportData(range)
  const exportQuery = `from=${toDateInputValue(range.from)}&to=${toDateInputValue(range.to)}`
  const tabQuery = (tab: string) => `/admin/reports?tab=${tab}&${exportQuery}`
  const dailySalesValues = report.dailySales.map((row) => Number(row.revenue))
  const dailyViewValues = report.dailyViews.map((row) => Number(row.views))
  const maxTrafficViews = Math.max(...report.trafficSources.map((row) => Number(row.views)), 1)
  const maxRatingCount = Math.max(...report.reviews.ratings.map((row) => row.count), 1)
  const exportLinks = [
    { type: 'orders', label: 'Orders CSV', href: `/api/admin/reports/export?type=orders&${exportQuery}`, metadata: ADMIN_REPORT_EXPORT_METADATA.orders },
    { type: 'products', label: 'Products CSV', href: `/api/admin/reports/export?type=products&${exportQuery}`, metadata: ADMIN_REPORT_EXPORT_METADATA.products },
    { type: 'customers', label: 'Customers CSV', href: `/api/admin/reports/export?type=customers&${exportQuery}`, metadata: ADMIN_REPORT_EXPORT_METADATA.customers },
  ] as const

  const metrics = [
    { label: 'Revenue', value: formatPrice(report.summary.revenue), icon: TrendingUp },
    { label: 'Orders', value: report.summary.orders.toString(), icon: ShoppingBag },
    { label: 'Product views', value: report.summary.productViews.toString(), icon: Eye },
    { label: 'Conversion', value: `${report.summary.conversionRate}%`, icon: Package },
    { label: 'New customers', value: report.summary.newCustomers.toString(), icon: Users },
  ]

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Analytics</h1>
          <p className="admin-page-description">Sales, demand, customers, reviews, and first-party traffic in one workspace.</p>
        </div>
        <form className="admin-report-filters">
          <label>
            <span>From</span>
            <input type="date" name="from" defaultValue={toDateInputValue(range.from)} className="input-base" />
          </label>
          <label>
            <span>To</span>
            <input type="date" name="to" defaultValue={toDateInputValue(range.to)} className="input-base" />
          </label>
          <input type="hidden" name="tab" value={activeTab} />
          <button type="submit" className="btn-primary">Apply</button>
        </form>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5" aria-label="Analytics summary">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <article key={metric.label} className="admin-card min-w-0 p-4">
              <div className="flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
                <span>{metric.label}</span>
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-2 truncate font-display text-xl font-bold sm:text-2xl">{metric.value}</p>
            </article>
          )
        })}
      </section>

      <div className="admin-report-toolbar">
        <nav className="admin-report-tabs" aria-label="Analytics reports">
          {REPORT_TABS.map((tab) => (
            <Link key={tab.value} href={tabQuery(tab.value)} data-active={activeTab === tab.value}>
              {tab.label}
            </Link>
          ))}
        </nav>
        <details className="admin-export-menu">
          <summary>Export data</summary>
          <div>
            {exportLinks.map((item) => canExportAdminReport(item.type, session.user.role) ? (
              <AdminReportExportLink
                key={item.type}
                href={item.href}
                label={item.label}
                reportSensitivityLabel={item.metadata.reportSensitivityLabel}
                warningLabel={item.metadata.warningLabel}
              />
            ) : (
              <span key={item.type} className="rounded-md bg-secondary px-3 py-2 text-xs text-muted-foreground">{item.label}: super admin only</span>
            ))}
          </div>
        </details>
      </div>

      {activeTab === 'overview' && (
        <>
          <section className="grid gap-5 xl:grid-cols-2">
            <TrendChart
              title="Sales trend"
              description="Daily order value excluding cancellations"
              values={dailySalesValues}
              start={range.from}
              end={range.to}
            />
            <TrendChart
              title="Product interest"
              description="Unique first-party product views"
              values={dailyViewValues}
              start={range.from}
              end={range.to}
            />
          </section>
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
            <article className="admin-card p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="admin-section-title">Most viewed products</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Demand signals before a purchase happens</p>
                </div>
                <Link href={tabQuery('products')} className="admin-action-link">Products <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
              <div className="mt-4 grid gap-2">
                {report.topViewedProducts.slice(0, 6).map((row, index) => (
                  <Link key={row.productId} href={row.product ? `/admin/products/${row.productId}` : '/admin/products'} className="admin-ranked-row">
                    <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{row.product?.name ?? 'Deleted product'}</span>
                    <span className="text-xs font-semibold">{row.views} views</span>
                  </Link>
                ))}
              </div>
            </article>
            <article className="admin-card p-4 sm:p-5">
              <h2 className="admin-section-title">Quality and fulfilment</h2>
              <p className="mt-1 text-xs text-muted-foreground">Signals that may need an admin decision</p>
              <div className="mt-4 grid gap-3">
                <Link href={tabQuery('reviews')} className="admin-summary-row">
                  <span>Reviews needing attention</span><strong>{report.reviews.attention}</strong>
                </Link>
                <div className="admin-summary-row">
                  <span>Average rating</span><strong>{report.reviews.averageRating.toFixed(1)} / 5</strong>
                </div>
                {report.orderStatuses.slice(0, 5).map((row) => (
                  <div key={row.status} className="admin-summary-row">
                    <span>{row.status.replaceAll('_', ' ').toLowerCase()}</span><strong>{row.count}</strong>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </>
      )}

      {activeTab === 'sales' && (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.6fr)]">
          <div className="admin-card overflow-hidden">
            <div className="admin-card-header"><h2 className="admin-section-title">Orders in range</h2></div>
            <table className="admin-responsive-table w-full text-sm">
              <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th className="text-right">Total</th><th className="text-right">Date</th></tr></thead>
              <tbody>
                {report.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td data-mobile data-primary><Link href={`/admin/orders/${order.id}`} className="font-mono font-semibold">{order.orderNumber}</Link></td>
                    <td data-mobile data-full data-label="Customer">{order.user?.name || order.user?.email}</td>
                    <td data-mobile data-label="Status">{order.status.replaceAll('_', ' ')}</td>
                    <td data-mobile data-label="Total" className="text-right font-semibold">{formatPrice(order.total)}</td>
                    <td data-mobile data-full data-label="Date" className="text-right text-muted-foreground">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <aside className="admin-card p-4 sm:p-5">
            <h2 className="admin-section-title">Sales summary</h2>
            <div className="mt-4 grid gap-3">
              <div className="admin-summary-row"><span>Gross revenue</span><strong>{formatPrice(report.summary.revenue)}</strong></div>
              <div className="admin-summary-row"><span>Average order</span><strong>{formatPrice(report.summary.averageOrderValue)}</strong></div>
              <div className="admin-summary-row"><span>Orders</span><strong>{report.summary.orders}</strong></div>
              <div className="admin-summary-row"><span>View-to-order rate</span><strong>{report.summary.conversionRate}%</strong></div>
            </div>
          </aside>
        </section>
      )}

      {activeTab === 'products' && (
        <section className="grid gap-5 xl:grid-cols-2">
          <article className="admin-card overflow-hidden">
            <div className="admin-card-header"><h2 className="admin-section-title">Top sellers</h2></div>
            <table className="admin-responsive-table w-full text-sm">
              <thead><tr><th>Product</th><th>SKU</th><th className="text-right">Units</th><th className="text-right">Revenue</th></tr></thead>
              <tbody>{report.topProducts.map((product) => (
                <tr key={`${product.productId}-${product.productSku}`}>
                  <td data-mobile data-primary className="font-semibold">{product.productName}</td>
                  <td data-mobile data-full data-label="SKU" className="font-mono text-xs">{product.productSku}</td>
                  <td data-mobile data-label="Units" className="text-right">{product.quantitySold}</td>
                  <td data-mobile data-label="Revenue" className="text-right font-semibold">{formatPrice(product.revenue)}</td>
                </tr>
              ))}</tbody>
            </table>
          </article>
          <article className="admin-card p-4 sm:p-5">
            <h2 className="admin-section-title">Most viewed</h2>
            <div className="mt-4 grid gap-2">
              {report.topViewedProducts.map((row, index) => (
                <Link key={row.productId} href={`/admin/products/${row.productId}`} className="admin-ranked-row">
                  <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{row.product?.name ?? 'Deleted product'}</span>
                    <span className="block text-xs text-muted-foreground">{row.product?.soldCount ?? 0} sold</span>
                  </span>
                  <strong>{row.views}</strong>
                </Link>
              ))}
            </div>
          </article>
        </section>
      )}

      {activeTab === 'customers' && (
        <div className="admin-card overflow-hidden">
          <div className="admin-card-header"><h2 className="admin-section-title">Top customers</h2></div>
          <table className="admin-responsive-table w-full text-sm">
            <thead><tr><th>Customer</th><th>Role</th><th className="text-right">Orders</th><th className="text-right">Revenue</th></tr></thead>
            <tbody>{report.topCustomers.map((row) => (
              <tr key={row.userId}>
                <td data-mobile data-primary><p className="font-semibold">{row.customer?.name || row.customer?.email || 'Unknown user'}</p><p className="text-xs text-muted-foreground">{row.customer?.email}</p></td>
                <td data-mobile data-label="Role">{row.customer?.role || 'Unknown'}</td>
                <td data-mobile data-label="Orders" className="text-right">{row.orders}</td>
                <td data-mobile data-full data-label="Revenue" className="text-right font-semibold">{formatPrice(row.revenue)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {activeTab === 'reviews' && (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <article className="admin-card p-4 sm:p-5">
            <h2 className="admin-section-title">Rating distribution</h2>
            <p className="mt-1 text-xs text-muted-foreground">Every rating below 5 is included in attention</p>
            <div className="mt-5 grid gap-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = report.reviews.ratings.find((row) => row.rating === rating)?.count ?? 0
                return (
                  <div key={rating} className="grid grid-cols-[3rem_minmax(0,1fr)_3rem] items-center gap-3 text-xs">
                    <span className="font-semibold">{rating} star</span>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className={rating === 5 ? 'h-full bg-green-700' : 'h-full bg-amber-700'} style={{ width: `${(count / maxRatingCount) * 100}%` }} /></div>
                    <strong className="text-right">{count}</strong>
                  </div>
                )
              })}
            </div>
          </article>
          <aside className="admin-card p-4 sm:p-5">
            <h2 className="admin-section-title">Review quality</h2>
            <div className="mt-4 grid gap-3">
              <div className="admin-summary-row"><span>Total reviews</span><strong>{report.reviews.total}</strong></div>
              <div className="admin-summary-row"><span>Average rating</span><strong>{report.reviews.averageRating.toFixed(1)}</strong></div>
              <Link href="/admin/reviews" className="admin-summary-row"><span>Needs attention</span><strong>{report.reviews.attention}</strong></Link>
            </div>
          </aside>
        </section>
      )}

      {activeTab === 'traffic' && (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <article className="admin-card p-4 sm:p-5">
            <h2 className="admin-section-title">Traffic sources</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">First-touch attribution from the existing anonymous product-view cookie. Older views remain direct / unknown.</p>
            <div className="mt-5 grid gap-3">
              {report.trafficSources.map((row) => (
                <div key={row.source}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span>{trafficSourceLabel(row.source)}</span><strong>{row.views}</strong></div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-foreground" style={{ width: `${(Number(row.views) / maxTrafficViews) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </article>
          <article className="admin-card p-4 sm:p-5">
            <h2 className="admin-section-title">Products attracting traffic</h2>
            <div className="mt-4 grid gap-2">
              {report.topViewedProducts.map((row, index) => (
                <Link key={row.productId} href={`/admin/products/${row.productId}`} className="admin-ranked-row">
                  <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{row.product?.name ?? 'Deleted product'}</span>
                  <span className="text-xs font-semibold">{row.views} views</span>
                </Link>
              ))}
            </div>
          </article>
        </section>
      )}
    </div>
  )
}
