import { db } from '@/backend/database'
import { formatPrice, formatDate } from '@/backend/utils'
import { ShoppingBag, Users, Package, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'
import Link from 'next/link'

async function getDashboardData() {
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)

  const [
    totalOrders, prevOrders,
    totalRevenue, prevRevenue,
    totalUsers, prevUsers,
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
        items: { take: 1, select: { productName: true, imageUrl: true } },
      },
    }),
    db.order.count({ where: { status: 'PENDING' } }),
    db.product.findMany({
      where: { isActive: true, stockQuantity: { lte: 5 } },
      take: 5,
      select: { id: true, name: true, stockQuantity: true, sku: true },
      orderBy: { stockQuantity: 'asc' },
    }),
    db.order.groupBy({ by: ['status'], _count: { id: true } }),
    db.review.count({ where: { status: 'PENDING' } }),
  ])

  return {
    totalOrders, prevOrders,
    totalRevenue: totalRevenue._sum.total ?? 0,
    prevRevenue: prevRevenue._sum.total ?? 0,
    totalUsers, prevUsers,
    totalProducts,
    recentOrders,
    pendingOrders,
    lowStockProducts,
    ordersByStatus,
    pendingReviews,
  }
}

function pctChange(current: number, prev: number): number {
  if (prev === 0) return current > 0 ? 100 : 0
  return Math.round(((current - prev) / prev) * 100)
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  const revenueChange = pctChange(data.totalRevenue, data.prevRevenue)
  const ordersChange = pctChange(data.totalOrders, data.prevOrders)
  const usersChange = pctChange(data.totalUsers, data.prevUsers)

  const statusMap: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    PENDING: { label: 'Pending', color: 'text-amber-500', icon: Clock },
    CONFIRMED: { label: 'Confirmed', color: 'text-blue-500', icon: CheckCircle },
    SHIPPED: { label: 'Shipped', color: 'text-purple-500', icon: Truck },
    DELIVERED: { label: 'Delivered', color: 'text-green-500', icon: CheckCircle },
    CANCELLED: { label: 'Cancelled', color: 'text-red-500', icon: XCircle },
  }

  const STATS = [
    {
      title: 'Revenue (30d)', value: formatPrice(data.totalRevenue), change: revenueChange,
      icon: TrendingUp, bg: 'bg-green-50', iconColor: 'text-green-600',
    },
    {
      title: 'Orders (30d)', value: data.totalOrders.toString(), change: ordersChange,
      icon: ShoppingBag, bg: 'bg-blue-50', iconColor: 'text-blue-600',
    },
    {
      title: 'New Customers (30d)', value: data.totalUsers.toString(), change: usersChange,
      icon: Users, bg: 'bg-purple-50', iconColor: 'text-purple-600',
    },
    {
      title: 'Active Products', value: data.totalProducts.toString(), change: 0,
      icon: Package, bg: 'bg-warning/10', iconColor: 'text-warning',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          {data.pendingOrders > 0 && (
            <Link href="/admin/orders?status=PENDING" className="flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl px-3 py-2 text-sm font-medium hover:bg-amber-100 transition-colors">
              <Clock className="h-4 w-4" />
              {data.pendingOrders} pending orders
            </Link>
          )}
          {data.pendingReviews > 0 && (
            <Link href="/admin/reviews?status=PENDING" className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl px-3 py-2 text-sm font-medium hover:bg-blue-100 transition-colors">
              {data.pendingReviews} reviews to moderate
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {STATS.map((stat) => (
          <div key={stat.title} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="font-display text-2xl font-bold mt-1">{stat.value}</p>
                {stat.change !== 0 && (
                  <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${stat.change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {stat.change > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {Math.abs(stat.change)}% vs last 30 days
                  </div>
                )}
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-border">
            {data.recentOrders.map((order) => {
              const statusInfo = statusMap[order.status] ?? { label: order.status, color: 'text-muted-foreground', icon: Clock }
              const StatusIcon = statusInfo.icon
              return (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-secondary transition-colors">
                  <div>
                    <p className="text-sm font-semibold font-mono">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{order.user?.name ?? order.guestEmail}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{order.items[0]?.productName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${statusInfo.color}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:block">{statusInfo.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-5">
          {/* Order Status */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold">Order Status</h2>
            </div>
            <div className="p-5 space-y-3">
              {data.ordersByStatus.map((s) => {
                const info = statusMap[s.status]
                if (!info) return null
                const Icon = info.icon
                return (
                  <div key={s.status} className="flex items-center justify-between text-sm">
                    <div className={`flex items-center gap-2 ${info.color}`}>
                      <Icon className="h-4 w-4" />
                      <span>{info.label}</span>
                    </div>
                    <span className="font-semibold">{s._count.id}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Low Stock */}
          {data.lowStockProducts.length > 0 && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-amber-600">Low Stock Alert</h2>
                <Link href="/admin/inventory" className="text-xs text-primary">Manage</Link>
              </div>
              <div className="p-3 space-y-2">
                {data.lowStockProducts.map((p) => (
                  <Link key={p.id} href={`/admin/products/${p.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary transition-colors text-sm">
                    <span className="truncate font-medium">{p.name}</span>
                    <span className={`font-bold ml-2 ${p.stockQuantity === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                      {p.stockQuantity === 0 ? 'Out' : `${p.stockQuantity} left`}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
