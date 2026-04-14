import { auth } from '@/backend/auth'
import { redirect } from 'next/navigation'
import { db } from '@/backend/database'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/backend/utils'
import { Package, ChevronRight } from 'lucide-react'

export const metadata = { title: 'Boilabin Orders' }

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  PACKED: 'bg-indigo-50 text-indigo-700',
  SHIPPED: 'bg-purple-50 text-purple-700',
  DELIVERED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
  RETURNED: 'bg-gray-50 text-gray-700',
}

export default async function AccountOrdersPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login?callbackUrl=/account/orders')

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        take: 3,
        select: { productName: true, imageUrl: true, quantity: true, total: true },
      },
      _count: { select: { items: true } },
    },
  })

  return (
    <div className="container-site py-8">
      <div className="max-w-4xl">
        <h1 className="font-display text-2xl font-bold mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
            <h2 className="font-display text-xl font-semibold">No orders yet</h2>
            <p className="text-muted-foreground mt-2">Your order history will appear here.</p>
            <Link href="/" className="btn-primary mt-5 inline-flex">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="block bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-all hover:shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-mono font-bold text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(order.total)}</p>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${STATUS_COLORS[order.status] ?? 'bg-secondary text-foreground'}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 text-sm text-muted-foreground">
                    {order.items.map((item, i) => (
                      <span key={i}>
                        {item.productName}
                        {i < order.items.length - 1 && <>, </>}
                      </span>
                    ))}
                    {order._count.items > 3 && <span> +{order._count.items - 3} more</span>}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
