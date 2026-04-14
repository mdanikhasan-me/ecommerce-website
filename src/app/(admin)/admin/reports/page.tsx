import { db } from '@/backend/database'
import { formatPrice, formatDate } from '@/backend/utils'
import { TrendingUp, ShoppingBag, Users, Package } from 'lucide-react'

export const metadata = { title: 'Admin Analytics' }

export default async function AdminReportsPage() {
  const now = new Date()
  const ranges = {
    today: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
  }

  const [
    revenueToday, revenueWeek, revenueMonth, revenueTotal,
    ordersToday, ordersWeek, ordersMonth,
    topProducts, topCategories, newUsers,
  ] = await Promise.all([
    db.order.aggregate({ where: { createdAt: { gte: ranges.today }, status: { not: 'CANCELLED' } }, _sum: { total: true } }),
    db.order.aggregate({ where: { createdAt: { gte: ranges.week }, status: { not: 'CANCELLED' } }, _sum: { total: true } }),
    db.order.aggregate({ where: { createdAt: { gte: ranges.month }, status: { not: 'CANCELLED' } }, _sum: { total: true } }),
    db.order.aggregate({ where: { status: { not: 'CANCELLED' } }, _sum: { total: true } }),
    db.order.count({ where: { createdAt: { gte: ranges.today } } }),
    db.order.count({ where: { createdAt: { gte: ranges.week } } }),
    db.order.count({ where: { createdAt: { gte: ranges.month } } }),
    db.product.findMany({
      where: { isActive: true },
      orderBy: { soldCount: 'desc' },
      take: 10,
      select: { id: true, name: true, soldCount: true, sku: true, basePrice: true, salePrice: true },
    }),
    db.category.findMany({
      where: { parentId: null, isActive: true },
      take: 8,
      include: { _count: { select: { products: true } } },
      orderBy: { products: { _count: 'desc' } },
    }),
    db.user.count({ where: { createdAt: { gte: ranges.month } } }),
  ])

  const REVENUE_STATS = [
    { label: 'Today', value: revenueToday._sum.total ?? 0, orders: ordersToday },
    { label: 'This Week', value: revenueWeek._sum.total ?? 0, orders: ordersWeek },
    { label: 'This Month', value: revenueMonth._sum.total ?? 0, orders: ordersMonth },
    { label: 'All Time', value: revenueTotal._sum.total ?? 0, orders: null },
  ]

  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl font-bold">Analytics & Reports</h1>

      {/* Revenue Breakdown */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Revenue</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {REVENUE_STATS.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="font-display text-xl font-bold">{formatPrice(stat.value)}</p>
              {stat.orders !== null && (
                <p className="text-xs text-muted-foreground mt-1">{stat.orders} orders</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2 font-semibold">
            <Package className="h-4 w-4 text-primary" /> Top Selling Products
          </div>
          <div className="divide-y divide-border">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-muted-foreground text-sm w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{p.soldCount} sold</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(p.salePrice ?? p.basePrice)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2 font-semibold">
            <TrendingUp className="h-4 w-4 text-primary" /> Category Breakdown
          </div>
          <div className="divide-y divide-border">
            {topCategories.map((cat, i) => (
              <div key={cat.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-muted-foreground text-sm w-5">{i + 1}</span>
                <p className="flex-1 text-sm font-medium">{cat.name}</p>
                <span className="text-sm font-bold">{cat._count.products} products</span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-border bg-secondary text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>New customers this month</span>
              <span className="font-bold text-foreground">{newUsers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
