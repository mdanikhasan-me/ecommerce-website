import { auth } from '@/backend/auth'
import { redirect } from 'next/navigation'
import { db } from '@/backend/database'
import { formatPrice, formatDate } from '@/backend/utils'
import { Package, Eye, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Seller Orders' }

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
      address: true,
    },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {orders.length} orders containing your products
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-20 text-center">
          <Package className="mx-auto mb-4 size-12 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold">No orders yet</h2>
          <p className="text-sm text-muted-foreground">
            Orders will appear here once customers start buying
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const statusConf = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING
            const StatusIcon = statusConf.icon
            const sellerTotal = order.items.reduce((sum, item) => sum + item.total, 0)

            return (
              <div
                key={order.id}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/20"
              >
                <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold">{order.orderNumber}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusConf.color} ${statusConf.bg}`}
                    >
                      <StatusIcon className="size-3" />
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatDate(order.createdAt)}</span>
                    <span className="font-semibold text-foreground">{formatPrice(sellerTotal)}</span>
                    <Link
                      href={`/seller/orders/${order.id}`}
                      className="rounded-lg p-1.5 transition-colors hover:bg-secondary"
                    >
                      <Eye className="size-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {order.items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="flex shrink-0 items-center gap-2 rounded-lg bg-secondary px-2.5 py-1.5"
                    >
                      <div className="size-6 overflow-hidden rounded bg-background">
                        {item.product.images[0] ? (
                          <img src={item.product.images[0].url} alt="" className="size-full object-cover" />
                        ) : (
                          <div className="size-full bg-muted" />
                        )}
                      </div>
                      <span className="max-w-[120px] truncate text-xs">{item.product.name}</span>
                      <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      +{order.items.length - 4} more
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs text-muted-foreground">
                  {order.user?.name ?? 'Guest'} · {order.address?.city ?? 'Unknown location'}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
