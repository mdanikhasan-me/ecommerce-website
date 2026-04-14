import { auth } from '@/backend/auth'
import { redirect } from 'next/navigation'
import { db } from '@/backend/database'
import { formatPrice, formatDate } from '@/backend/utils'
import { Package, Eye, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Orders | Boilabin Seller' }

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  PENDING: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  CONFIRMED: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
  PACKED: { icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
  SHIPPED: { icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  DELIVERED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  CANCELLED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
}

export default async function SellerOrdersPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const seller = await db.seller.findUnique({ where: { userId: session.user.id } })
  if (!seller) redirect('/seller/register')

  const orders = await db.order.findMany({
    where: { items: { some: { product: { sellerId: seller.id } } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      user: { select: { name: true, email: true } },
      items: {
        where: { product: { sellerId: seller.id } },
        include: {
          product: { select: { name: true, images: { where: { isPrimary: true }, take: 1 } } },
        },
      },
      shippingAddress: true,
    },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{orders.length} orders containing your products</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <Package className="size-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display font-semibold text-lg mb-2">No orders yet</h2>
          <p className="text-muted-foreground text-sm">Orders will appear here once customers start buying</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const statusConf = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING
            const StatusIcon = statusConf.icon
            const sellerTotal = order.items.reduce((s, i) => s + i.total, 0)

            return (
              <div key={order.id} className="bg-card rounded-xl border border-border p-4 hover:border-primary/20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold">{order.orderNumber}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusConf.color} ${statusConf.bg}`}>
                      <StatusIcon className="size-3" />
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatDate(order.createdAt)}</span>
                    <span className="font-semibold text-foreground">{formatPrice(sellerTotal)}</span>
                    <Link href={`/seller/orders/${order.id}`} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                      <Eye className="size-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {order.items.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 shrink-0 bg-secondary rounded-lg px-2.5 py-1.5">
                      <div className="size-6 rounded bg-background overflow-hidden">
                        {item.product.images[0] ? (
                          <img src={item.product.images[0].url} alt="" className="size-full object-cover" />
                        ) : (
                          <div className="size-full bg-muted" />
                        )}
                      </div>
                      <span className="text-xs truncate max-w-[120px]">{item.product.name}</span>
                      <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <span className="text-xs text-muted-foreground shrink-0">+{order.items.length - 4} more</span>
                  )}
                </div>

                <div className="mt-2 text-xs text-muted-foreground">
                  {order.user?.name ?? 'Guest'} · {order.shippingAddress?.city ?? 'Unknown location'}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
