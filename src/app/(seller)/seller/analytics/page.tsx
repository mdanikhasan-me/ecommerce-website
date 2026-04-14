import { auth } from '@/backend/auth'
import { redirect } from 'next/navigation'
import { db } from '@/backend/database'
import { formatPrice } from '@/backend/utils'
import { TrendingUp, ShoppingBag, Package, Star, Eye, ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Seller Analytics' }

export default async function SellerAnalyticsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const seller = await db.seller.findUnique({ where: { userId: session.user.id } })
  if (!seller) redirect('/seller/register')

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [totalRevenue, monthlyRevenue, totalOrders, monthlyOrders, productCount, avgRating, topProducts] = await Promise.all([
    db.orderItem.aggregate({
      where: { product: { sellerId: seller.id }, order: { status: { not: 'CANCELLED' } } },
      _sum: { total: true },
    }),
    db.orderItem.aggregate({
      where: {
        product: { sellerId: seller.id },
        order: { status: { not: 'CANCELLED' }, createdAt: { gte: thirtyDaysAgo } },
      },
      _sum: { total: true },
    }),
    db.order.count({
      where: { items: { some: { product: { sellerId: seller.id } } }, status: { not: 'CANCELLED' } },
    }),
    db.order.count({
      where: {
        items: { some: { product: { sellerId: seller.id } } },
        status: { not: 'CANCELLED' },
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    db.product.count({ where: { sellerId: seller.id, isActive: true } }),
    db.review.aggregate({
      where: { product: { sellerId: seller.id }, status: 'APPROVED' },
      _avg: { rating: true },
    }),
    db.product.findMany({
      where: { sellerId: seller.id, isActive: true },
      orderBy: { soldCount: 'desc' },
      take: 5,
      select: { id: true, name: true, soldCount: true, price: true, salePrice: true, images: { where: { isPrimary: true }, take: 1 } },
    }),
  ])

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue._sum.total ?? 0), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
    { label: 'Monthly Revenue', value: formatPrice(monthlyRevenue._sum.total ?? 0), icon: ArrowUpRight, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Total Orders', value: totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
    { label: 'Monthly Orders', value: monthlyOrders.toString(), icon: ShoppingBag, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Active Products', value: productCount.toString(), icon: Package, color: 'text-purple-600 bg-purple-50' },
    { label: 'Average Rating', value: avgRating._avg.rating ? avgRating._avg.rating.toFixed(1) : 'N/A', icon: Star, color: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Your store performance overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`size-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="size-4" />
              </div>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="font-display font-bold text-xl">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Top Products */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-display font-semibold mb-4">Top Selling Products</h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sales data yet</p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((product, idx) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground w-5">{idx + 1}</span>
                <div className="size-10 rounded-lg bg-secondary overflow-hidden shrink-0">
                  {product.images[0] ? (
                    <img src={product.images[0].url} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="size-full bg-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(product.salePrice ?? product.price)}</p>
                </div>
                <span className="text-sm font-semibold">{product.soldCount} sold</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
