import Link from 'next/link'
import { ArrowRight, Download, Eye, Package, ShoppingBag, TrendingUp, Users } from 'lucide-react'

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
import { AdminTrendChart, type AdminTrendChartPoint } from '@/frontend/components/admin/AdminTrendChart'

import styles from './analytics.module.css'

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

const DAY_MS = 24 * 60 * 60 * 1000

function chartDayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function parseChartDay(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

function buildCalendarPoints(
  rows: Array<{ day: Date; value: number }>,
  fromValue: string,
  toValue: string,
  formatter: Intl.DateTimeFormat,
): AdminTrendChartPoint[] {
  const start = parseChartDay(fromValue)
  const end = parseChartDay(toValue)
  const span = Math.max(end.getTime() - start.getTime(), 0)
  const dayCount = Math.floor(span / DAY_MS) + 1
  const sortedRows = [...rows].sort((left, right) => left.day.getTime() - right.day.getTime())
  const valuesByDay = new Map(sortedRows.map((row) => [chartDayKey(row.day), Math.max(Number(row.value), 0)]))

  if (dayCount <= 62) {
    return Array.from({ length: dayCount }, (_, index) => {
      const day = new Date(start.getTime() + index * DAY_MS)
      return {
        label: formatter.format(day),
        value: valuesByDay.get(chartDayKey(day)) ?? 0,
      }
    })
  }

  const representativeRows = sortedRows.length <= 62
    ? sortedRows
    : (() => {
        const selectedIndices = new Set<number>()
        const sampleCount = 61
        for (let index = 0; index < sampleCount; index += 1) {
          selectedIndices.add(Math.round((index / (sampleCount - 1)) * (sortedRows.length - 1)))
        }
        const peakIndex = sortedRows.reduce(
          (currentPeak, row, index) => row.value > sortedRows[currentPeak].value ? index : currentPeak,
          0,
        )
        selectedIndices.add(peakIndex)
        return Array.from(selectedIndices)
          .sort((left, right) => left - right)
          .map((index) => sortedRows[index])
      })()

  return representativeRows.map((row) => ({
    label: formatter.format(row.day),
    value: Math.max(Number(row.value), 0),
    position: span ? Math.min(Math.max((row.day.getTime() - start.getTime()) / span, 0), 1) : 0.5,
  }))
}

function buildSparklinePath(values: number[], width: number, height: number) {
  const safeValues = values.length ? values : [0]
  const maximum = Math.max(...safeValues, 0)
  const step = width / Math.max(safeValues.length - 1, 1)
  const baseline = height - 5
  const amplitude = Math.min(26, height * 0.5)
  const points = safeValues.map((value, index) => ({
    x: safeValues.length === 1 ? width / 2 : step * index,
    y: maximum ? baseline - (value / maximum) * amplitude : height / 2,
  }))
  const line = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ')
  return {
    line,
    area: `${line} L ${points.at(-1)?.x ?? width} ${height} L ${points[0].x} ${height} Z`,
  }
}

function MetricSparkline({ values, label, unavailable = false }: { values: number[]; label: string; unavailable?: boolean }) {
  const width = 300
  const height = 54
  const path = buildSparklinePath(values, width, height)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={styles.metricSparkline}
      role="img"
      aria-label={unavailable ? `${label} daily trend unavailable` : `${label} trend`}
    >
      {unavailable ? (
        <line x1="0" x2={width} y1={height / 2} y2={height / 2} stroke="currentColor" strokeWidth="1.8" opacity="0.72" />
      ) : (
        <>
          <path d={path.area} fill="currentColor" opacity="0.09" />
          <path d={path.line} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </>
      )}
    </svg>
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
  const fromValue = toDateInputValue(range.from)
  const toValue = toDateInputValue(range.to)
  const exportQuery = `from=${fromValue}&to=${toValue}`
  const tabQuery = (tab: string) => `/admin/reports?tab=${tab}&${exportQuery}`
  const chartDateFormat = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' })
  const dailySalesFactPoints = report.dailySales.map((row) => ({
    label: chartDateFormat.format(row.day),
    value: Number(row.revenue),
  }))
  const dailyViewFactPoints = report.dailyViews.map((row) => ({
    label: chartDateFormat.format(row.day),
    value: Number(row.views),
  }))
  const dailySalesPoints = buildCalendarPoints(
    report.dailySales.map((row) => ({ day: row.day, value: Number(row.revenue) })),
    fromValue,
    toValue,
    chartDateFormat,
  )
  const dailyOrderPoints = buildCalendarPoints(
    report.dailySales.map((row) => ({ day: row.day, value: Number(row.orders) })),
    fromValue,
    toValue,
    chartDateFormat,
  )
  const dailyViewPoints = buildCalendarPoints(
    report.dailyViews.map((row) => ({ day: row.day, value: Number(row.views) })),
    fromValue,
    toValue,
    chartDateFormat,
  )
  const conversionRows = new Map<string, { day: Date; orders: number; views: number }>()
  report.dailySales.forEach((row) => {
    conversionRows.set(chartDayKey(row.day), { day: row.day, orders: Number(row.orders), views: 0 })
  })
  report.dailyViews.forEach((row) => {
    const key = chartDayKey(row.day)
    const current = conversionRows.get(key)
    conversionRows.set(key, {
      day: row.day,
      orders: current?.orders ?? 0,
      views: Number(row.views),
    })
  })
  const dailyConversionPoints = buildCalendarPoints(
    Array.from(conversionRows.values()).map((row) => ({
      day: row.day,
      value: row.views ? (row.orders / row.views) * 100 : 0,
    })),
    fromValue,
    toValue,
    chartDateFormat,
  )
  const chartStart = parseChartDay(fromValue)
  const chartEnd = parseChartDay(toValue)
  const chartMiddle = new Date(chartStart.getTime() + Math.max(chartEnd.getTime() - chartStart.getTime(), 0) / 2)
  const chartAxisLabels = [
    chartDateFormat.format(chartStart),
    chartDateFormat.format(chartMiddle),
    chartDateFormat.format(chartEnd),
  ] as const
  const maxTrafficViews = Math.max(...report.trafficSources.map((row) => Number(row.views)), 1)
  const maxRatingCount = Math.max(...report.reviews.ratings.map((row) => row.count), 1)
  const exportLinks = [
    { type: 'orders', label: 'Orders CSV', href: `/api/admin/reports/export?type=orders&${exportQuery}`, metadata: ADMIN_REPORT_EXPORT_METADATA.orders },
    { type: 'products', label: 'Products CSV', href: `/api/admin/reports/export?type=products&${exportQuery}`, metadata: ADMIN_REPORT_EXPORT_METADATA.products },
    { type: 'customers', label: 'Customers CSV', href: `/api/admin/reports/export?type=customers&${exportQuery}`, metadata: ADMIN_REPORT_EXPORT_METADATA.customers },
  ] as const

  const metrics = [
    { label: 'Revenue', value: formatPrice(report.summary.revenue), icon: TrendingUp, tone: 'blue', series: dailySalesPoints.map((point) => point.value), sparklineUnavailable: false },
    { label: 'Orders', value: report.summary.orders.toString(), icon: ShoppingBag, tone: 'mint', series: dailyOrderPoints.map((point) => point.value), sparklineUnavailable: false },
    { label: 'Product views', value: report.summary.productViews.toString(), icon: Eye, tone: 'purple', series: dailyViewPoints.map((point) => point.value), sparklineUnavailable: false },
    { label: 'Conversion', value: `${report.summary.conversionRate}%`, icon: Package, tone: 'amber', series: dailyConversionPoints.map((point) => point.value), sparklineUnavailable: false },
    { label: 'New customers', value: report.summary.newCustomers.toString(), icon: Users, tone: 'teal', series: [0, 0], sparklineUnavailable: report.summary.newCustomers > 0 },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div className={styles.headingCopy}>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.description}>Sales, demand, customers, reviews, and first-party traffic in one workspace.</p>
        </div>
        <div className={styles.controls} aria-label="Reporting period and export controls">
          <form className={styles.filterForm}>
            <label className={styles.filterField}>
              <span>From</span>
              <input type="date" name="from" defaultValue={fromValue} className={styles.dateInput} />
            </label>
            <label className={styles.filterField}>
              <span>To</span>
              <input type="date" name="to" defaultValue={toValue} className={styles.dateInput} />
            </label>
            <input type="hidden" name="tab" value={activeTab} />
            <button type="submit" className={styles.applyButton}>Apply</button>
          </form>
          <details className={`${styles.exportMenu} admin-export-menu`}>
            <summary><Download aria-hidden="true" className="h-4 w-4" /> Export data</summary>
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
      </header>

      <section className={styles.metrics} aria-label="Analytics summary">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <article key={metric.label} className={styles.metricCard} data-tone={metric.tone}>
              <div className={styles.metricTop}>
                <span className={styles.metricLabel}>{metric.label}</span>
                <Icon className={styles.metricIcon} aria-hidden="true" />
              </div>
              <p className={styles.metricValue}>{metric.value}</p>
              <MetricSparkline values={metric.series} label={metric.label} unavailable={metric.sparklineUnavailable} />
            </article>
          )
        })}
      </section>

      <div className={styles.tabFrame}>
        <nav className={styles.tabs} aria-label="Analytics reports">
          {REPORT_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={tabQuery(tab.value)}
              className={`${styles.tab} ${activeTab === tab.value ? styles.tabActive : ''}`}
              aria-current={activeTab === tab.value ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <>
          <section className={styles.chartGrid}>
            <AdminTrendChart
              key={`sales-${fromValue}-${toValue}`}
              title="Sales trend"
              description="Daily order value excluding cancellations"
              points={dailySalesPoints}
              summaryPoints={dailySalesFactPoints}
              valueType="currency"
              axisLabels={chartAxisLabels}
            />
            <AdminTrendChart
              key={`views-${fromValue}-${toValue}`}
              title="Product interest"
              description="Unique first-party product views"
              points={dailyViewPoints}
              summaryPoints={dailyViewFactPoints}
              variant="bar"
              axisLabels={chartAxisLabels}
            />
          </section>
          <section className={styles.lowerGrid}>
            <article className={styles.lowerCard}>
              <div className={styles.lowerHeader}>
                <div>
                  <h2 className={styles.lowerTitle}>Most viewed products</h2>
                  <p className={styles.lowerDescription}>Demand signals before a purchase happens</p>
                </div>
                <Link href={tabQuery('products')} className="admin-action-link">Products <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
              <div className={styles.lowerRows}>
                {report.topViewedProducts.slice(0, 6).map((row, index) => (
                  <Link key={row.productId} href={row.product ? `/admin/products/${row.productId}` : '/admin/products'} className="admin-ranked-row">
                    <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{row.product?.name ?? 'Deleted product'}</span>
                    <span className="text-xs font-semibold">{row.views} views</span>
                  </Link>
                ))}
              </div>
            </article>
            <article className={styles.lowerCard}>
              <h2 className={styles.lowerTitle}>Quality and fulfilment</h2>
              <p className={styles.lowerDescription}>Signals that may need an admin decision</p>
              <div className={styles.lowerRows}>
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
