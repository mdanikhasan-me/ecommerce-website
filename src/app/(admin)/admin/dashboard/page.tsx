import Link from 'next/link'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  PackageX,
  Plus,
  RotateCcw,
  TrendingUp,
} from 'lucide-react'

import { db } from '@/backend/database'
import { formatDate, formatPrice } from '@/backend/utils'
import {
  AdminDashboardVisuals,
  DashboardRangeSelector,
  type DashboardRangeOption,
} from '@/frontend/components/admin/AdminDashboardVisuals'
import styles from '@/frontend/components/admin/AdminDashboard.module.css'

const DAY_MS = 24 * 60 * 60 * 1000
const DASHBOARD_RANGES = [7, 14, 30] as const
const ACTIVE_REVENUE_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'RETURN_REQUESTED',
  'REFUND_REQUESTED',
] as const

type DashboardRange = (typeof DASHBOARD_RANGES)[number]
type ChartMetric = 'revenue' | 'orders' | 'aov'

function startOfDay(date: Date) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDashboardRange(value: string | undefined): DashboardRange {
  const parsed = Number(value)
  return DASHBOARD_RANGES.includes(parsed as DashboardRange) ? parsed as DashboardRange : 7
}

function parseChartMetric(value: string | undefined): ChartMetric {
  if (value === 'orders' || value === 'aov') return value
  return 'revenue'
}

function periodLabel(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat('en-BD', { day: 'numeric', month: 'short' })
  return `${formatter.format(start)} – ${formatter.format(end)}`
}

function metricComparison(current: number, previous: number, previousLabel: string) {
  if (previous === 0) {
    return current > 0
      ? { label: `New vs ${previousLabel}`, direction: 'up' as const }
      : { label: `No change vs ${previousLabel}`, direction: 'flat' as const }
  }

  const change = ((current - previous) / previous) * 100
  const ratio = current / previous
  const changeLabel = ratio >= 100
    ? '100×+'
    : ratio >= 10
      ? `${Math.round(ratio)}×`
      : `${Math.abs(change).toFixed(1)}%`

  return {
    label: `${changeLabel} vs ${previousLabel}`,
    direction: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'flat' as const,
  }
}

function formatCount(value: number) {
  return new Intl.NumberFormat('en-BD', { notation: value >= 10_000 ? 'compact' : 'standard' }).format(value)
}

function MetricSparkline({ values, color }: { values: number[]; color: string }) {
  const width = 96
  const height = 42
  const minimum = Math.min(...values, 0)
  const maximum = Math.max(...values, 1)
  const range = Math.max(maximum - minimum, 1)
  const step = width / Math.max(values.length - 1, 1)
  const points = values.map((value, index) => ({
    x: values.length === 1 ? width / 2 : index * step,
    y: height - 4 - ((value - minimum) / range) * (height - 10),
  }))
  const line = points.map((point) => `${point.x},${point.y}`).join(' ')
  const area = points.length
    ? `M ${points[0].x} ${height} L ${line.replaceAll(',', ' ')} L ${points.at(-1)?.x ?? width} ${height} Z`
    : ''

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={styles.metricSparkline} aria-hidden="true">
      <path d={area} fill={color} opacity="0.08" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

async function getDashboardData(range: DashboardRange) {
  const now = new Date()
  const currentStart = startOfDay(new Date(now.getTime() - (range - 1) * DAY_MS))
  const previousStart = startOfDay(new Date(currentStart.getTime() - range * DAY_MS))
  const sevenDaysAgo = startOfDay(new Date(now.getTime() - 6 * DAY_MS))

  const [
    periodOrders,
    currentProductViews,
    previousProductViews,
    totalProducts,
    recentOrders,
    lowStockCount,
    outOfStockCount,
    orderOutcomes,
    returnRequests,
    failedPayments,
    weeklyDemandProducts,
    dailyProductViewRows,
  ] = await Promise.all([
    db.order.findMany({
      where: { createdAt: { gte: previousStart } },
      select: { total: true, status: true, createdAt: true },
    }),
    db.productView.count({ where: { createdAt: { gte: currentStart } } }),
    db.productView.count({ where: { createdAt: { gte: previousStart, lt: currentStart } } }),
    db.product.count({ where: { isActive: true } }),
    db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { take: 1, select: { productName: true } },
      },
    }),
    db.product.count({ where: { isActive: true, stockQuantity: { gt: 0, lte: 5 } } }),
    db.product.count({ where: { isActive: true, stockQuantity: { lte: 0 } } }),
    db.order.groupBy({
      by: ['status', 'paymentStatus'],
      where: { createdAt: { gte: currentStart } },
      _count: { id: true },
    }),
    db.returnRequest.count({ where: { status: 'REQUESTED' } }),
    db.order.count({ where: { paymentStatus: 'FAILED', createdAt: { gte: sevenDaysAgo } } }),
    db.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: sevenDaysAgo },
          status: { not: 'CANCELLED' },
        },
      },
      _sum: { quantity: true },
    }),
    db.$queryRaw<Array<{ day: Date; views: bigint }>>`
      SELECT DATE_TRUNC('day', "createdAt") AS "day", COUNT(*)::bigint AS "views"
      FROM "ProductView"
      WHERE "createdAt" >= ${previousStart}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY "day" ASC
    `,
  ])

  const currentOrders = periodOrders.filter((order) => order.createdAt >= currentStart)
  const previousOrders = periodOrders.filter((order) => order.createdAt < currentStart)
  const currentRevenue = currentOrders
    .filter((order) => ACTIVE_REVENUE_STATUSES.includes(order.status as (typeof ACTIVE_REVENUE_STATUSES)[number]))
    .reduce((sum, order) => sum + order.total, 0)
  const previousRevenue = previousOrders
    .filter((order) => ACTIVE_REVENUE_STATUSES.includes(order.status as (typeof ACTIVE_REVENUE_STATUSES)[number]))
    .reduce((sum, order) => sum + order.total, 0)
  const currentOrderCount = currentOrders.filter((order) => order.status !== 'CANCELLED').length
  const previousOrderCount = previousOrders.filter((order) => order.status !== 'CANCELLED').length
  const productViewsByDay = new Map(
    dailyProductViewRows.map((row) => [getDateKey(new Date(row.day)), Number(row.views)]),
  )

  const dailyActivity = Array.from({ length: range }, (_, index) => {
    const currentDate = new Date(currentStart.getTime() + index * DAY_MS)
    const previousDate = new Date(previousStart.getTime() + index * DAY_MS)
    const currentDayOrders = currentOrders.filter(
      (order) => getDateKey(order.createdAt) === getDateKey(currentDate) && order.status !== 'CANCELLED',
    )
    const previousDayOrders = previousOrders.filter(
      (order) => getDateKey(order.createdAt) === getDateKey(previousDate) && order.status !== 'CANCELLED',
    )
    const revenue = currentDayOrders.reduce((sum, order) => sum + order.total, 0)
    const previousRevenueForDay = previousDayOrders.reduce((sum, order) => sum + order.total, 0)

    return {
      date: currentDate,
      previousDate,
      revenue,
      previousRevenue: previousRevenueForDay,
      orders: currentDayOrders.length,
      previousOrders: previousDayOrders.length,
      aov: currentDayOrders.length ? revenue / currentDayOrders.length : 0,
      previousAov: previousDayOrders.length ? previousRevenueForDay / previousDayOrders.length : 0,
      views: productViewsByDay.get(getDateKey(currentDate)) ?? 0,
      previousViews: productViewsByDay.get(getDateKey(previousDate)) ?? 0,
    }
  })

  return {
    now,
    currentStart,
    previousStart,
    previousEnd: new Date(currentStart.getTime() - DAY_MS),
    currentRevenue,
    previousRevenue,
    currentOrderCount,
    previousOrderCount,
    currentAverageOrder: currentOrderCount ? currentRevenue / currentOrderCount : 0,
    previousAverageOrder: previousOrderCount ? previousRevenue / previousOrderCount : 0,
    currentProductViews,
    previousProductViews,
    totalProducts,
    recentOrders,
    lowStockCount,
    outOfStockCount,
    orderOutcomes,
    returnRequests,
    failedPayments,
    highDemandProducts: weeklyDemandProducts.filter((product) => (product._sum.quantity ?? 0) >= 3).length,
    dailyActivity,
  }
}

interface AdminDashboardProps {
  searchParams: Promise<{
    range?: string
    chartRange?: string
    outcomeRange?: string
    metric?: string
  }>
}

export default async function AdminDashboard({ searchParams }: AdminDashboardProps) {
  const query = await searchParams
  const range = parseDashboardRange(query.range ?? query.chartRange ?? query.outcomeRange)
  const metric = parseChartMetric(query.metric)
  const data = await getDashboardData(range)
  const dateFormatter = new Intl.DateTimeFormat('en-BD', { day: 'numeric', month: 'short' })
  const currentPeriodLabel = periodLabel(data.currentStart, data.now)
  const previousPeriodLabel = periodLabel(data.previousStart, data.previousEnd)
  const rangeOptions: DashboardRangeOption[] = DASHBOARD_RANGES.map((days) => ({
    value: days,
    label: periodLabel(startOfDay(new Date(data.now.getTime() - (days - 1) * DAY_MS)), data.now),
  }))

  const activity = data.dailyActivity.map((item) => ({
    date: item.date.toISOString(),
    label: dateFormatter.format(item.date),
    previousLabel: dateFormatter.format(item.previousDate),
    revenue: item.revenue,
    previousRevenue: item.previousRevenue,
    orders: item.orders,
    previousOrders: item.previousOrders,
    aov: item.aov,
    previousAov: item.previousAov,
  }))

  const outcomeCounts = new Map<string, number>([
    ['completed', 0],
    ['in-progress', 0],
    ['returned', 0],
    ['refunded', 0],
    ['partially-refunded', 0],
    ['cancelled', 0],
  ])
  data.orderOutcomes.forEach((row) => {
    let outcome = 'in-progress'
    if (row.paymentStatus === 'PARTIALLY_REFUNDED') outcome = 'partially-refunded'
    else if (row.paymentStatus === 'REFUNDED' || row.status === 'REFUNDED') outcome = 'refunded'
    else if (row.status === 'RETURN_REQUESTED' || row.status === 'RETURNED' || row.status === 'REFUND_REQUESTED') outcome = 'returned'
    else if (row.status === 'DELIVERED') outcome = 'completed'
    else if (row.status === 'CANCELLED') outcome = 'cancelled'
    outcomeCounts.set(outcome, (outcomeCounts.get(outcome) ?? 0) + row._count.id)
  })

  const outcomes = [
    { id: 'completed', label: 'Delivered', description: 'Successfully completed', count: outcomeCounts.get('completed') ?? 0, color: '#22a55b' },
    { id: 'in-progress', label: 'In progress', description: 'Pending through shipping', count: outcomeCounts.get('in-progress') ?? 0, color: '#3f73d8' },
    { id: 'returned', label: 'Returned', description: 'Return requested', count: outcomeCounts.get('returned') ?? 0, color: '#f0a421' },
    { id: 'refunded', label: 'Refunded', description: 'Full payment refunded', count: outcomeCounts.get('refunded') ?? 0, color: '#e34c5a' },
    { id: 'partially-refunded', label: 'Partial refund', description: 'Part of payment returned', count: outcomeCounts.get('partially-refunded') ?? 0, color: '#8457d8' },
    { id: 'cancelled', label: 'Cancelled', description: 'Cancelled before completion', count: outcomeCounts.get('cancelled') ?? 0, color: '#8b94a2' },
  ]

  const metrics = [
    {
      label: 'Revenue',
      value: formatPrice(data.currentRevenue),
      comparison: metricComparison(data.currentRevenue, data.previousRevenue, previousPeriodLabel),
      values: data.dailyActivity.map((item) => item.revenue),
      color: '#38a169',
    },
    {
      label: 'Orders',
      value: formatCount(data.currentOrderCount),
      comparison: metricComparison(data.currentOrderCount, data.previousOrderCount, previousPeriodLabel),
      values: data.dailyActivity.map((item) => item.orders),
      color: '#4f7ddd',
    },
    {
      label: 'Product views',
      value: formatCount(data.currentProductViews),
      comparison: metricComparison(data.currentProductViews, data.previousProductViews, previousPeriodLabel),
      values: data.dailyActivity.map((item) => item.views),
      color: '#60758f',
    },
    {
      label: 'Average order value',
      value: formatPrice(data.currentAverageOrder),
      comparison: metricComparison(data.currentAverageOrder, data.previousAverageOrder, previousPeriodLabel),
      values: data.dailyActivity.map((item) => item.aov),
      color: '#9b59d0',
    },
  ]

  const businessPulse = [
    {
      label: 'Low stock products',
      detail: `${data.outOfStockCount + data.lowStockCount} products need inventory attention.`,
      severity: data.outOfStockCount > 0 ? 'High' : 'Medium',
      action: 'View all',
      href: '/admin/inventory',
      icon: PackageX,
      tone: 'orange',
    },
    {
      label: 'Pending returns',
      detail: `${data.returnRequests} return requests need your attention.`,
      severity: data.returnRequests > 0 ? 'Medium' : 'Clear',
      action: 'Review',
      href: '/admin/returns?status=REQUESTED',
      icon: RotateCcw,
      tone: 'blue',
    },
    {
      label: 'Failed payments',
      detail: `${data.failedPayments} payments failed in the last 7 days.`,
      severity: data.failedPayments > 0 ? 'High' : 'Clear',
      action: 'View',
      href: '/admin/orders?paymentStatus=FAILED',
      icon: CreditCard,
      tone: 'red',
    },
    {
      label: 'High-demand products',
      detail: `${data.highDemandProducts} products are trending with high demand.`,
      severity: data.highDemandProducts > 0 ? 'Medium' : 'Clear',
      action: 'See list',
      href: '/admin/products',
      icon: TrendingUp,
      tone: 'purple',
    },
  ]

  const fulfillmentLabel = (status: string) => {
    if (status === 'DELIVERED') return 'Fulfilled'
    if (status === 'RETURNED' || status === 'RETURN_REQUESTED') return 'Returned'
    if (status === 'REFUNDED' || status === 'REFUND_REQUESTED') return 'Refunded'
    if (status === 'CANCELLED') return 'Cancelled'
    return 'Processing'
  }

  const statusTone = (status: string) => {
    if (status === 'DELIVERED' || status === 'PAID') return 'green'
    if (status === 'RETURNED' || status === 'RETURN_REQUESTED') return 'amber'
    if (status === 'REFUNDED' || status === 'CANCELLED' || status === 'FAILED') return 'red'
    return 'blue'
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Operations Dashboard</h1>
          <p>Live view of revenue, orders, fulfilment, and actions that need attention.</p>
        </div>
        <div className={styles.headerActions}>
          <DashboardRangeSelector value={range} options={rangeOptions} />
          <Link href="/admin/products/new" className={styles.primaryButton}>
            <Plus aria-hidden="true" /> Add product
          </Link>
        </div>
      </header>

      <section className={styles.metricGrid} aria-label="Business summary">
        {metrics.map((item) => (
          <article key={item.label} className={styles.metricCard}>
            <div className={styles.metricCopy}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small data-direction={item.comparison.direction}>
                {item.comparison.direction === 'up' ? <ArrowUpRight aria-hidden="true" /> : null}
                {item.comparison.direction === 'down' ? <ArrowDownRight aria-hidden="true" /> : null}
                {item.comparison.label}
              </small>
            </div>
            <MetricSparkline values={item.values} color={item.color} />
          </article>
        ))}
      </section>

      <AdminDashboardVisuals
        activity={activity}
        metric={metric}
        range={range}
        rangeOptions={rangeOptions}
        currentPeriodLabel={currentPeriodLabel}
        previousPeriodLabel={previousPeriodLabel}
        summaries={{
          revenue: { current: data.currentRevenue, previous: data.previousRevenue },
          orders: { current: data.currentOrderCount, previous: data.previousOrderCount },
          aov: { current: data.currentAverageOrder, previous: data.previousAverageOrder },
        }}
        outcomes={outcomes}
      />

      <div className={styles.lowerGrid}>
        <section className={styles.panel} aria-labelledby="business-pulse-heading">
          <div className={styles.panelHeader}>
            <div>
              <h2 id="business-pulse-heading">Business pulse</h2>
              <p>Key issues and opportunities that need your attention.</p>
            </div>
          </div>
          <div className={styles.pulseList}>
            {businessPulse.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className={styles.pulseRow} data-tone={item.tone}>
                  <span className={styles.pulseIcon}><Icon aria-hidden="true" /></span>
                  <span className={styles.pulseCopy}>
                    <strong>{item.label}</strong>
                    <small>{item.detail}</small>
                  </span>
                  <span className={styles.severity} data-level={item.severity.toLowerCase()}>{item.severity}</span>
                  <Link href={item.href}>{item.action}</Link>
                </div>
              )
            })}
          </div>
        </section>

        <section className={styles.panel} aria-labelledby="recent-orders-heading">
          <div className={styles.panelHeader}>
            <div>
              <h2 id="recent-orders-heading">Recent orders</h2>
              <p>Latest customer activity</p>
            </div>
            <Link href="/admin/orders" className={styles.viewAllLink}>View all orders <ArrowRight aria-hidden="true" /></Link>
          </div>
          {data.recentOrders.length ? (
            <div className={styles.orderTableWrap}>
              <table className={styles.orderTable}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Fulfilment</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => {
                    const fulfilment = fulfillmentLabel(order.status)
                    return (
                      <tr key={order.id}>
                        <td data-label="Order ID"><Link href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link></td>
                        <td data-label="Customer">{order.user?.name ?? order.guestEmail ?? 'Guest customer'}</td>
                        <td data-label="Date">{formatDate(order.createdAt)}</td>
                        <td data-label="Status"><span className={styles.statusPill} data-tone={statusTone(order.status)}>{order.status.replaceAll('_', ' ')}</span></td>
                        <td data-label="Payment"><span className={styles.statusPill} data-tone={statusTone(order.paymentStatus)}>{order.paymentStatus.replaceAll('_', ' ')}</span></td>
                        <td data-label="Fulfilment"><span className={styles.statusPill} data-tone={statusTone(fulfilment.toUpperCase())}>{fulfilment}</span></td>
                        <td data-label="Total">{formatPrice(order.total)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : <p className={styles.emptyState}>No recent orders.</p>}
        </section>
      </div>
    </div>
  )
}
