import { db } from '@/backend/database'
import { formatDate, formatPrice } from '@/backend/utils'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  Package,
  Plus,
  RefreshCcw,
  ShoppingBag,
  Star,
  TrendingUp,
  Truck,
  Users,
  Warehouse,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'

async function getDashboardData() {
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)

  const [
    totalOrders,
    prevOrders,
    totalRevenue,
    prevRevenue,
    totalUsers,
    prevUsers,
    totalProducts,
    recentOrders,
    pendingOrders,
    lowStockProducts,
    ordersByStatus,
    pendingReviews,
  ] = await Promise.all([
    db.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.order.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    db.order.aggregate({ where: { createdAt: { gte: thirtyDaysAgo }, status: { not: 'CANCELLED' } }, _sum: { total: true } }),
    db.order.aggregate({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, status: { not: 'CANCELLED' } }, _sum: { total: true } }),
    db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    db.product.count({ where: { isActive: true } }),
    db.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { take: 1, select: { productName: true } },
      },
    }),
    db.order.count({ where: { status: 'PENDING' } }),
    db.product.findMany({
      where: { isActive: true, stockQuantity: { lte: 5 } },
      take: 5,
      select: { id: true, name: true, stockQuantity: true },
      orderBy: { stockQuantity: 'asc' },
    }),
    db.order.groupBy({ by: ['status'], _count: { id: true } }),
    db.review.count({ where: { status: 'PENDING' } }),
  ])

  return {
    totalOrders,
    prevOrders,
    totalRevenue: totalRevenue._sum.total ?? 0,
    prevRevenue: prevRevenue._sum.total ?? 0,
    totalUsers,
    prevUsers,
    totalProducts,
    recentOrders,
    pendingOrders,
    lowStockProducts,
    ordersByStatus,
    pendingReviews,
  }
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export default async function AdminDashboard() {
  const data = await getDashboardData()
  const statusMap: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    PENDING: { label: 'Pending', color: 'text-amber-600', icon: Clock },
    CONFIRMED: { label: 'Confirmed', color: 'text-blue-600', icon: CheckCircle },
    PACKED: { label: 'Packed', color: 'text-purple-600', icon: Package },
    SHIPPED: { label: 'Shipped', color: 'text-purple-600', icon: Truck },
    DELIVERED: { label: 'Delivered', color: 'text-green-600', icon: CheckCircle },
    CANCELLED: { label: 'Cancelled', color: 'text-red-600', icon: XCircle },
    RETURN_REQUESTED: { label: 'Return requested', color: 'text-amber-600', icon: RefreshCcw },
    RETURNED: { label: 'Returned', color: 'text-blue-600', icon: RefreshCcw },
    REFUND_REQUESTED: { label: 'Refund requested', color: 'text-amber-600', icon: RefreshCcw },
    REFUNDED: { label: 'Refunded', color: 'text-green-600', icon: CheckCircle },
  }
  const stats = [
    { title: 'Revenue', caption: 'Last 30 days', value: formatPrice(data.totalRevenue), change: pctChange(data.totalRevenue, data.prevRevenue), icon: TrendingUp, tone: 'bg-green-50 text-green-600' },
    { title: 'Orders', caption: 'Last 30 days', value: data.totalOrders.toString(), change: pctChange(data.totalOrders, data.prevOrders), icon: ShoppingBag, tone: 'bg-blue-50 text-blue-600' },
    { title: 'New customers', caption: 'Last 30 days', value: data.totalUsers.toString(), change: pctChange(data.totalUsers, data.prevUsers), icon: Users, tone: 'bg-purple-50 text-purple-600' },
    { title: 'Active products', caption: 'Live catalog', value: data.totalProducts.toString(), change: null, icon: Package, tone: 'bg-amber-50 text-amber-600' },
  ]
  const attentionItems = [
    { label: 'Pending orders', detail: 'Ready for confirmation', value: data.pendingOrders, href: '/admin/orders?status=PENDING', icon: Clock, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Reviews to moderate', detail: 'Awaiting a decision', value: data.pendingReviews, href: '/admin/reviews?status=PENDING', icon: Star, tone: 'bg-blue-50 text-blue-700' },
    { label: 'Low stock products', detail: 'Five units or fewer', value: data.lowStockProducts.length, href: '/admin/inventory', icon: Warehouse, tone: 'bg-red-50 text-red-700' },
  ]
  const quickActions = [
    { label: 'Add product', href: '/admin/products/new', icon: Plus },
    { label: 'Create banner', href: '/admin/banners/new', icon: ImageIcon },
    { label: 'Adjust inventory', href: '/admin/inventory', icon: Warehouse },
    { label: 'Open analytics', href: '/admin/reports', icon: BarChart3 },
  ]
  const todayLabel = new Intl.DateTimeFormat('en-BD', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date())
  const orderStatusTotal = data.ordersByStatus.reduce((total, status) => total + status._count.id, 0)
  const chartColors: Record<string, string> = {
    PENDING: '#b28743',
    CONFIRMED: '#71869a',
    PACKED: '#7b748b',
    SHIPPED: '#52748b',
    DELIVERED: '#4f7d64',
    CANCELLED: '#955d5d',
    RETURN_REQUESTED: '#9a7442',
    RETURNED: '#6d7882',
    REFUND_REQUESTED: '#9a7442',
    REFUNDED: '#52745f',
  }
  let chartCursor = 0
  const chartSegments = data.ordersByStatus
    .filter((status) => status._count.id > 0)
    .map((status) => {
      const start = chartCursor
      chartCursor += orderStatusTotal ? (status._count.id / orderStatusTotal) * 100 : 0
      return `${chartColors[status.status] ?? '#77808a'} ${start}% ${chartCursor}%`
    })
  const chartBackground = chartSegments.length
    ? `conic-gradient(${chartSegments.join(', ')})`
    : 'conic-gradient(#d5d8dc 0 100%)'
  const revenueMaximum = Math.max(data.totalRevenue, data.prevRevenue, 1)
  const currentRevenueWidth = Math.max((data.totalRevenue / revenueMaximum) * 100, data.totalRevenue ? 4 : 0)
  const previousRevenueWidth = Math.max((data.prevRevenue / revenueMaximum) * 100, data.prevRevenue ? 4 : 0)
  const deliveredCount = data.ordersByStatus.find((status) => status.status === 'DELIVERED')?._count.id ?? 0
  const deliveryRate = orderStatusTotal ? Math.round((deliveredCount / orderStatusTotal) * 100) : 0

  return (
    <div className="space-y-6">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-description">Sales, fulfilment, inventory, and the work that needs attention today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-card px-3 py-2 text-xs font-medium text-muted-foreground">{todayLabel}</span>
          <Link href="/admin/products/new" className="btn-primary gap-2">
            <Plus className="h-4 w-4" /> Add product
          </Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Performance metrics">
        {stats.map((stat) => (
          <div key={stat.title} className="admin-card min-h-[7.75rem] p-4 sm:min-h-[9rem] sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{stat.title}</p>
                <p className="text-xs text-muted-foreground">{stat.caption}</p>
              </div>
              <span className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-md min-[430px]:flex sm:h-10 sm:w-10 ${stat.tone}`}>
                <stat.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 truncate font-display text-[1.28rem] font-bold tracking-tight sm:mt-4 sm:text-[1.7rem]">{stat.value}</p>
            {stat.change === null ? (
              <p className="mt-1 text-xs text-muted-foreground">Available to customers</p>
            ) : (
              <p className={`mt-1 flex items-center gap-1 text-xs font-semibold ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                <span className="sm:hidden">{Math.abs(stat.change)}% vs prior</span>
                <span className="hidden sm:inline">{Math.abs(stat.change)}% from previous period</span>
              </p>
            )}
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]" aria-label="Business overview">
        <div className="admin-card p-4 sm:p-5 lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="admin-section-title">Revenue comparison</h2>
              <p className="mt-1 text-xs text-muted-foreground">Completed and active orders, excluding cancellations</p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">30-day periods</span>
          </div>
          <div className="mt-6 space-y-5">
            <RevenueBar label="Current period" value={formatPrice(data.totalRevenue)} width={currentRevenueWidth} emphasized />
            <RevenueBar label="Previous period" value={formatPrice(data.prevRevenue)} width={previousRevenueWidth} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 rounded-lg bg-secondary/55 p-3.5 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Movement</p>
              <p className="mt-1 font-semibold">{pctChange(data.totalRevenue, data.prevRevenue)}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current orders</p>
              <p className="mt-1 font-semibold">{data.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="admin-card p-4 sm:p-5 lg:p-6">
          <div>
            <h2 className="admin-section-title">Order distribution</h2>
            <p className="mt-1 text-xs text-muted-foreground">All recorded order states</p>
          </div>
          <div className="mt-5 grid items-center gap-6 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <div className="relative mx-auto h-36 w-36 rounded-full sm:h-40 sm:w-40" style={{ background: chartBackground }}>
              <div className="absolute inset-[1.15rem] flex flex-col items-center justify-center rounded-full bg-card text-center">
                <span className="font-display text-2xl font-bold">{orderStatusTotal}</span>
                <span className="text-[11px] text-muted-foreground">total orders</span>
              </div>
            </div>
            <div className="grid gap-2.5">
              {data.ordersByStatus.slice(0, 6).map((status) => {
                const info = statusMap[status.status]
                return (
                  <div key={status.status} className="flex items-center justify-between gap-3 text-xs">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: chartColors[status.status] ?? '#77808a' }} />
                      <span className="truncate text-muted-foreground">{info?.label ?? status.status.replace('_', ' ')}</span>
                    </span>
                    <span className="font-semibold">{status._count.id}</span>
                  </div>
                )
              })}
              <div className="mt-1 rounded-md bg-secondary/55 px-3 py-2.5 text-xs">
                <span className="text-muted-foreground">Delivered share</span>
                <span className="float-right font-semibold">{deliveryRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-card grid gap-2.5 p-3 sm:gap-4 sm:p-5 md:grid-cols-2 xl:grid-cols-[minmax(14rem,0.8fr)_repeat(3,minmax(0,1fr))]" aria-labelledby="attention-heading">
        <div className="flex flex-col justify-center md:col-span-2 xl:col-span-1">
          <h2 id="attention-heading" className="admin-section-title">Action queue</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Open the areas that need an admin decision.</p>
        </div>
        {attentionItems.map((item) => (
          <Link key={item.label} href={item.href} className="flex min-h-[4.25rem] items-center gap-3 rounded-lg bg-secondary/55 px-3 py-2.5 sm:min-h-[5rem] sm:px-4 sm:py-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${item.tone}`}>
              <item.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="block truncate text-xs text-muted-foreground">{item.detail}</span>
            </span>
            <span className="admin-page-title">{item.value}</span>
          </Link>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.75fr)_minmax(20rem,0.75fr)]">
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
          <div className="space-y-2 p-3">
            {data.recentOrders.length ? data.recentOrders.map((order) => {
              const statusInfo = statusMap[order.status] ?? { label: order.status, color: 'text-muted-foreground', icon: Clock }
              const StatusIcon = statusInfo.icon
              return (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg bg-secondary/40 px-3 py-3 sm:grid-cols-[8.5rem_minmax(0,1fr)_7rem_7.5rem] sm:px-4 sm:py-3.5">
                  <span>
                    <span className="block font-mono text-xs font-bold">{order.orderNumber}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{order.user?.name ?? order.guestEmail}</span>
                  </span>
                  <span className="col-span-2 truncate text-xs text-muted-foreground sm:col-span-1">{order.items[0]?.productName ?? 'Order items'}</span>
                  <span className="text-right">
                    <span className="block text-xs font-bold">{formatPrice(order.total)}</span>
                    <span className="block text-[11px] text-muted-foreground">{formatDate(order.createdAt)}</span>
                  </span>
                  <span className={`flex items-center justify-end gap-1 text-[11px] font-semibold ${statusInfo.color}`}>
                    <StatusIcon className="h-3.5 w-3.5" /> {statusInfo.label}
                  </span>
                </Link>
              )
            }) : (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">No recent orders.</p>
            )}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="admin-card p-5" aria-labelledby="quick-actions-heading">
            <h2 id="quick-actions-heading" className="admin-section-title">Quick actions</h2>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href} className="flex min-h-24 flex-col justify-between rounded-lg bg-secondary/60 p-3.5 text-xs font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-card text-primary">
                    <action.icon className="h-4 w-4" />
                  </span>
                  {action.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="admin-card p-5" aria-labelledby="order-status-heading">
            <h2 id="order-status-heading" className="admin-section-title">Order status</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {data.ordersByStatus.map((status) => {
                const info = statusMap[status.status]
                if (!info) return null
                const Icon = info.icon
                return (
                  <div key={status.status} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3.5 py-2.5 text-xs">
                    <span className={`flex items-center gap-2 font-semibold ${info.color}`}>
                      <Icon className="h-3.5 w-3.5" /> {info.label}
                    </span>
                    <span className="font-bold">{status._count.id}</span>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="admin-card p-5" aria-labelledby="stock-heading">
            <div className="flex items-center justify-between gap-3">
              <h2 id="stock-heading" className="admin-section-title">Low stock</h2>
              <Link href="/admin/inventory" className="text-xs font-semibold text-primary">Manage</Link>
            </div>
            <div className="mt-4 space-y-2">
              {data.lowStockProducts.length ? data.lowStockProducts.map((product) => (
                <Link key={product.id} href={`/admin/products/${product.id}`} className="flex items-center justify-between gap-3 rounded-lg bg-secondary/40 px-3.5 py-2.5 text-xs">
                  <span className="truncate font-medium">{product.name}</span>
                  <span className={product.stockQuantity === 0 ? 'font-bold text-red-600' : 'font-bold text-amber-600'}>
                    {product.stockQuantity === 0 ? 'Out' : product.stockQuantity}
                  </span>
                </Link>
              )) : (
                <p className="rounded-md bg-green-50 px-3 py-3 text-xs font-medium text-green-700">Inventory levels look healthy.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function RevenueBar({
  label,
  value,
  width,
  emphasized = false,
}: {
  label: string
  value: string
  width: number
  emphasized?: boolean
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full ${emphasized ? 'bg-foreground' : 'bg-muted-foreground/45'}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}
