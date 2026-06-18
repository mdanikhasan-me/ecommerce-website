import { auth } from '@/backend/auth'
import { redirect } from 'next/navigation'
import { db } from '@/backend/database'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/backend/utils'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

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

export default async function AccountOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNumber?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login?callbackUrl=/account/orders')

  const params = await searchParams
  const filter = params.orderNumber?.trim()

  const orders = await db.order.findMany({
    where: {
      userId: session.user.id,
      ...(filter ? { orderNumber: { contains: filter, mode: 'insensitive' as const } } : {}),
    },
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
    <div className="container-site py-8 lg:py-10">
      <div className="max-w-5xl">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">Account</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em]">My Orders</h1>
          </div>
          <p className="text-sm text-muted-foreground">{orders.length} order{orders.length === 1 ? '' : 's'} shown</p>
        </div>
        {filter && (
          <p className="mb-4 text-sm text-muted-foreground">
            Showing results for &quot;{filter}&quot; &middot;{' '}
            <Link href="/account/orders" className="text-primary underline">clear filter</Link>
          </p>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <LocalIcon name="package" className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
            <h2 className="font-display text-xl font-semibold">No orders yet</h2>
            <p className="text-muted-foreground mt-2">Your order history will appear here.</p>
            <Link href="/" className="btn-primary mt-5 inline-flex">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="group block overflow-hidden rounded-2xl border border-border bg-card transition-colors md:hover:border-primary/30"
              >
                <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-mono text-xs font-bold tracking-[0.04em] text-foreground">
                        <LocalIcon name="receipt-text" className="h-3.5 w-3.5 text-primary" />
                        {order.orderNumber}
                      </span>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_COLORS[order.status] ?? 'bg-secondary text-foreground'}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <LocalIcon name="calendar-days" className="h-3.5 w-3.5" />
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Total</p>
                    <p className="mt-1 font-display text-xl font-bold tracking-[-0.03em]">{formatPrice(order.total)}</p>
                  </div>
                </div>

                <div className="border-t border-border bg-secondary/35 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {order.items.map((item, index) => (
                        <div
                          key={`${item.productName}-${index}`}
                          className="relative h-10 w-10 overflow-hidden rounded-xl border-2 border-card bg-background"
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : null}
                        </div>
                      ))}
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                      {order.items.map((item, i) => (
                        <span key={i}>
                          {item.productName}
                          {i < order.items.length - 1 && <>, </>}
                        </span>
                      ))}
                      {order._count.items > 3 && <span> +{order._count.items - 3} more</span>}
                    </p>
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-card text-muted-foreground transition-colors md:group-hover:bg-secondary md:group-hover:text-foreground">
                      <LocalIcon name="chevron-right" className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
