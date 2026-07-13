import Link from 'next/link'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Eye,
  Image as ImageIcon,
  Package,
  Plus,
  RotateCcw,
  ShoppingBag,
  Star,
  TrendingUp,
  Warehouse,
} from 'lucide-react'

import { db } from '@/backend/database'
import { formatDate, formatPrice } from '@/backend/utils'
import { AdminDashboardVisuals } from '@/frontend/components/admin/AdminDashboardVisuals'

const DAY_MS = 24 * 60 * 60 * 1000
const CHART_RANGES = [7, 14, 30] as const
const ACTIVE_REVENUE_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'RETURN_REQUESTED',
  'REFUND_REQUESTED',
] as const

type ChartRange = (typeof CHART_RANGES)[number]
type ChartMetric = 'revenue' | 'orders'

function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseChartRange(value: string | undefined): ChartRange {
  const parsed = Number(value)
  return CHART_RANGES.includes(parsed as ChartRange) ? parsed as ChartRange : 14
}

function parseChartMetric(value: string | undefined): ChartMetric {
  return value === 'orders' ? 'orders' : 'revenue'
}

async function getDashboardData(chartDays: ChartRange, outcomeDays: ChartRange) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * DAY_MS)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * DAY_MS)
  const chartStart = new Date(now.getTime() - (chartDays - 1) * DAY_MS)
  chartStart.setHours(0, 0, 0, 0)
  const outcomeStart = new Date(now.getTime() - (outcomeDays - 1) * DAY_MS)
  outcomeStart.setHours(0, 0, 0, 0)

  const [
    currentOrders,
    previousOrders,
    productViews,
    previousProductViews,
    totalProducts,
    recentOrders,
    lowStockCount,
    outOfStockCount,
    ordersByStatus,
    orderOutcomes,
    reviewAttention,
    returnRequests,
  ] = await Promise.all([
    db.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { total: true, status: true, createdAt: true },
    }),
    db.order.findMany({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      select: { total: true, status: true },
    }),
    db.productView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.productView.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    db.product.count({ where: { isActive: true } }),
    db.order.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { take: 1, select: { productName: true } },
      },
    }),
    db.product.count({ where: { isActive: true, stockQuantity: { gt: 0, lte: 5 } } }),
    db.product.count({ where: { isActive: true, stockQuantity: { lte: 0 } } }),
    db.order.groupBy({ by: ['status'], _count: { id: true } }),
    db.order.groupBy({
      by: ['status', 'paymentStatus'],
      where: { createdAt: { gte: outcomeStart } },
      _count: { id: true },
    }),
    db.review.count({ where: { OR: [{ status: 'PENDING' }, { rating: { lt: 5 } }] } }),
    db.returnRequest.count({ where: { status: 'REQUESTED' } }),
  ])

  const currentRevenue = currentOrders
    .filter((order) => ACTIVE_REVENUE_STATUSES.includes(order.status as (typeof ACTIVE_REVENUE_STATUSES)[number]))
    .reduce((sum, order) => sum + order.total, 0)
  const previousRevenue = previousOrders
    .filter((order) => ACTIVE_REVENUE_STATUSES.includes(order.status as (typeof ACTIVE_REVENUE_STATUSES)[number]))
    .reduce((sum, order) => sum + order.total, 0)
  const activeOrderCount = currentOrders.filter((order) => order.status !== 'CANCELLED').length
  const previousOrderCount = previousOrders.filter((order) => order.status !== 'CANCELLED').length

  const dailyActivity = Array.from({ length: chartDays }, (_, index) => {
    const date = new Date(chartStart.getTime() + index * DAY_MS)
    const key = getDateKey(date)
    const orders = currentOrders.filter(
      (order) => getDateKey(order.createdAt) === key && order.status !== 'CANCELLED',
    )
    return {
      date,
      revenue: orders.reduce((sum, order) => sum + order.total, 0),
      orders: orders.length,
    }
  })

  return {
    currentRevenue,
    previousRevenue,
    activeOrderCount,
    previousOrderCount,
    averageOrderValue: activeOrderCount ? currentRevenue / activeOrderCount : 0,
    productViews,
    previousProductViews,
    totalProducts,
    recentOrders,
    lowStockCount,
    outOfStockCount,
    ordersByStatus,
    orderOutcomes,
    reviewAttention,
    returnRequests,
    dailyActivity,
  }
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

function formatCount(value: number) {
  return new Intl.NumberFormat('en-BD', { notation: value >= 10_000 ? 'compact' : 'standard' }).format(value)
}

interface AdminDashboardProps {
  searchParams: Promise<{ range?: string; chartRange?: string; outcomeRange?: string; metric?: string }>
}

export default async function AdminDashboard({ searchParams }: AdminDashboardProps) {
  const query = await searchParams
  const chartDays = parseChartRange(query.chartRange ?? query.range)
  const outcomeDays = parseChartRange(query.outcomeRange ?? query.range)
  const chartMetric = parseChartMetric(query.metric)
  const data = await getDashboardData(chartDays, outcomeDays)
  const revenueChange = percentageChange(data.currentRevenue, data.previousRevenue)
  const orderChange = percentageChange(data.activeOrderCount, data.previousOrderCount)
  const viewsChange = percentageChange(data.productViews, data.previousProductViews)
  const statusCounts = new Map<string, number>()
  const outcomeCounts = new Map<string, number>([
    ['completed', 0],
    ['in-progress', 0],
    ['returned', 0],
    ['refunded', 0],
    ['partially-refunded', 0],
    ['cancelled', 0],
  ])
  data.ordersByStatus.forEach((row) => {
    statusCounts.set(row.status, row._count.id)
  })
  data.orderOutcomes.forEach((row) => {
    let outcome = 'in-progress'
    if (row.paymentStatus === 'PARTIALLY_REFUNDED') outcome = 'partially-refunded'
    else if (row.paymentStatus === 'REFUNDED' || row.status === 'REFUNDED') outcome = 'refunded'
    else if (row.status === 'RETURN_REQUESTED' || row.status === 'RETURNED' || row.status === 'REFUND_REQUESTED') outcome = 'returned'
    else if (row.status === 'DELIVERED') outcome = 'completed'
    else if (row.status === 'CANCELLED') outcome = 'cancelled'
    outcomeCounts.set(outcome, (outcomeCounts.get(outcome) ?? 0) + row._count.id)
  })
  const chartDateFormatter = new Intl.DateTimeFormat('en-BD', { day: 'numeric', month: 'short' })
  const chartActivity = data.dailyActivity.map((item) => ({
    date: item.date.toISOString(),
    label: chartDateFormatter.format(item.date),
    revenue: item.revenue,
    orders: item.orders,
  }))
  const orderOutcomes = [
    {
      id: 'completed',
      label: 'Delivered',
      description: 'Successfully completed',
      count: outcomeCounts.get('completed') ?? 0,
      color: '#2f7d5d',
    },
    {
      id: 'in-progress',
      label: 'In progress',
      description: 'Pending through shipping',
      count: outcomeCounts.get('in-progress') ?? 0,
      color: '#426b99',
    },
    {
      id: 'returned',
      label: 'Returned',
      description: 'Return or refund requested',
      count: outcomeCounts.get('returned') ?? 0,
      color: '#b47b2f',
    },
    {
      id: 'refunded',
      label: 'Refunded',
      description: 'Full payment refunded',
      count: outcomeCounts.get('refunded') ?? 0,
      color: '#a24f5b',
    },
    {
      id: 'partially-refunded',
      label: 'Partial refund',
      description: 'Part of payment returned',
      count: outcomeCounts.get('partially-refunded') ?? 0,
      color: '#725da0',
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      description: 'Cancelled before completion',
      count: outcomeCounts.get('cancelled') ?? 0,
      color: '#6b7280',
    },
  ]
  const todayLabel = new Intl.DateTimeFormat('en-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date())

  const metrics = [
    {
      label: 'Revenue',
      detail: 'Last 30 days',
      value: formatPrice(data.currentRevenue),
      change: revenueChange,
      icon: TrendingUp,
    },
    {
      label: 'Orders',
      detail: 'Active and completed',
      value: formatCount(data.activeOrderCount),
      change: orderChange,
      icon: ShoppingBag,
    },
    {
      label: 'Product views',
      detail: 'Unique first-party views',
      value: formatCount(data.productViews),
      change: viewsChange,
      icon: Eye,
    },
    {
      label: 'Average order',
      detail: `${data.totalProducts} active products`,
      value: formatPrice(data.averageOrderValue),
      change: null,
      icon: Package,
    },
  ]

  const workQueue = [
    {
      label: 'Pending orders',
      detail: 'Need confirmation',
      value: statusCounts.get('PENDING') ?? 0,
      href: '/admin/orders?status=PENDING',
      icon: Clock3,
      tone: 'warning',
    },
    {
      label: 'Stock attention',
      detail: `${data.outOfStockCount} out, ${data.lowStockCount} low`,
      value: data.outOfStockCount + data.lowStockCount,
      href: '/admin/inventory',
      icon: Warehouse,
      tone: data.outOfStockCount ? 'critical' : 'warning',
    },
    {
      label: 'Review attention',
      detail: 'Pending or below 5 stars',
      value: data.reviewAttention,
      href: '/admin/reviews',
      icon: Star,
      tone: data.reviewAttention ? 'warning' : 'neutral',
    },
    {
      label: 'Return requests',
      detail: 'Waiting for a decision',
      value: data.returnRequests,
      href: '/admin/returns?status=REQUESTED',
      icon: RotateCcw,
      tone: data.returnRequests ? 'warning' : 'neutral',
    },
  ]

  const statusStyle: Record<string, string> = {
    DELIVERED: 'text-green-700',
    PENDING: 'text-amber-700',
    CANCELLED: 'text-red-700',
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="admin-page-header items-center">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-description">A concise view of demand, fulfilment, and work that needs a decision.</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <span className="rounded-md bg-card px-3 py-2 text-xs font-semibold text-muted-foreground">{todayLabel}</span>
          <Link href="/admin/products/new" className="btn-primary flex-1 gap-2 sm:flex-none">
            <Plus className="h-4 w-4" /> Add product
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Business summary">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <article key={metric.label} className="admin-card min-w-0 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground">{metric.label}</p>
                  <p className="mt-2 font-display text-lg font-bold tracking-tight sm:text-2xl">{metric.value}</p>
                </div>
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
              <div className="mt-2 min-h-5 text-[11px] sm:text-xs">
                {metric.change === null ? (
                  <span className="text-muted-foreground">{metric.detail}</span>
                ) : (
                  <span className={`inline-flex items-center gap-1 font-semibold ${metric.change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {metric.change >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {Math.abs(metric.change)}% <span className="hidden text-muted-foreground sm:inline">vs prior period</span>
                  </span>
                )}
              </div>
            </article>
          )
        })}
      </section>

      <section className="admin-card overflow-hidden" aria-labelledby="sales-trend-heading">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/70 px-4 py-4 sm:px-5 lg:px-6">
          <div>
            <h2 id="sales-trend-heading" className="admin-section-title">
              Performance and order outcomes
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">Two independent views for activity and fulfilment quality.</p>
          </div>
          <Link href="/admin/reports?tab=sales" className="admin-action-link">
            Full analytics <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <AdminDashboardVisuals
          activity={chartActivity}
          chartDays={chartDays}
          metric={chartMetric}
          outcomeDays={outcomeDays}
          outcomes={orderOutcomes}
        />
      </section>

      <section className="admin-card p-4 sm:p-5" aria-labelledby="operations-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="operations-heading" className="admin-section-title">Operations queue</h2>
            <p className="mt-1 text-xs text-muted-foreground">Every item that currently needs an admin decision.</p>
          </div>
          <div className="flex gap-2 text-xs font-semibold">
            <Link href="/admin/inventory" className="admin-compact-link"><Warehouse className="h-3.5 w-3.5" /> Inventory</Link>
            <Link href="/admin/banners/new" className="admin-compact-link"><ImageIcon className="h-3.5 w-3.5" /> New banner</Link>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {workQueue.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.label} href={item.href} className="admin-work-item" data-tone={item.tone}>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{item.detail}</span>
                </span>
                <strong className="font-display text-xl">{item.value}</strong>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="admin-card overflow-hidden" aria-labelledby="recent-orders-heading">
        <div className="admin-card-header">
          <div>
            <h2 id="recent-orders-heading" className="admin-section-title">Recent orders</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Latest customer activity</p>
          </div>
          <Link href="/admin/orders" className="admin-action-link">
            View orders <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-2 p-3 sm:p-4">
          {data.recentOrders.length ? data.recentOrders.map((order) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`} className="admin-order-row">
              <span className="min-w-0">
                <span className="block font-mono text-xs font-bold">{order.orderNumber}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{order.user?.name ?? order.guestEmail}</span>
              </span>
              <span className="hidden truncate text-xs text-muted-foreground sm:block">{order.items[0]?.productName ?? 'Order items'}</span>
              <span className="text-right">
                <span className="block text-xs font-bold">{formatPrice(order.total)}</span>
                <span className="block text-[11px] text-muted-foreground">{formatDate(order.createdAt)}</span>
              </span>
              <span className={`text-right text-[11px] font-semibold ${statusStyle[order.status] ?? 'text-muted-foreground'}`}>
                {order.status.replaceAll('_', ' ')}
              </span>
            </Link>
          )) : (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">No recent orders.</p>
          )}
        </div>
      </section>
    </div>
  )
}
