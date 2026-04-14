import { auth } from '@/backend/auth'
import { redirect } from 'next/navigation'
import { db } from '@/backend/database'
import { formatPrice } from '@/backend/utils'
import { Package, ShoppingBag, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Seller Dashboard | Boilabin' }

export default async function SellerDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const seller = await db.seller.findUnique({
    where: { userId: session.user.id },
    include: {
      products: { select: { id: true }, where: { isActive: true } },
      _count: { select: { products: true } },
    },
  })
  if (!seller) redirect('/seller/register')

  const [recentOrders, totalRevenue] = await Promise.all([
    db.order.findMany({
      where: { items: { some: { product: { sellerId: seller.id } } }, status: { not: 'CANCELLED' } },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: { where: { product: { sellerId: seller.id } }, take: 1 } },
    }),
    db.orderItem.aggregate({
      where: { product: { sellerId: seller.id }, order: { status: { not: 'CANCELLED' } } },
      _sum: { total: true },
    }),
  ])

  const revenue = totalRevenue._sum.total ?? 0

  return (
    <div className="container-site py-8">
      <div className="max-w-5xl">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold">Welcome, {seller.storeName}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Here's your store overview</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Revenue', value: formatPrice(revenue), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
            { label: 'Total Orders', value: seller.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
            { label: 'Active Products', value: seller._count.products.toString(), icon: Package, color: 'text-purple-600 bg-purple-50' },
            { label: 'Store Rating', value: seller.rating > 0 ? seller.rating.toFixed(1) : 'N/A', icon: Star, color: 'text-amber-600 bg-amber-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
              <div className={`inline-flex p-2 rounded-xl mb-3 ${stat.color.split(' ')[1]}`}>
                <stat.icon className={`h-4 w-4 ${stat.color.split(' ')[0]}`} />
              </div>
              <p className="font-display text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/seller/products/new" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-sm">
                <Package className="h-4 w-4 text-primary" /> Add New Product
              </Link>
              <Link href="/seller/orders" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-sm">
                <ShoppingBag className="h-4 w-4 text-primary" /> View Orders
              </Link>
              <Link href="/seller/products" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-sm">
                <Package className="h-4 w-4 text-primary" /> Manage Products
              </Link>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Recent Orders</h2>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs">{order.orderNumber}</span>
                    <span className="font-semibold">{formatPrice(order.total)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
