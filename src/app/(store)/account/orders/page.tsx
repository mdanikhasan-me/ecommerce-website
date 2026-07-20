import { getActiveUserSession } from '@/backend/auth/active-user'
import { redirect } from 'next/navigation'
import { db } from '@/backend/database'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/backend/utils'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

export const metadata = { title: 'Boilabin Orders' }

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-700',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  PACKED: 'bg-indigo-50 text-indigo-700',
  SHIPPED: 'bg-sky-50 text-sky-700',
  DELIVERED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700',
  RETURNED: 'bg-slate-100 text-slate-700',
}

export default async function AccountOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNumber?: string }>
}) {
  const session = await getActiveUserSession()
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
    <div className="container-site py-8 sm:py-10 lg:py-12">
      <div className="w-full">
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
          <h1 className="font-display text-[clamp(1.75rem,2.4vw,2.25rem)] font-bold tracking-[-0.04em]">My Orders</h1>
          <p className="pb-1 text-right text-sm text-muted-foreground">{orders.length} order{orders.length === 1 ? '' : 's'} shown</p>
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
          <div className="space-y-3 sm:space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                aria-label={`View order ${order.orderNumber}`}
                data-order-history-card
                className="group block overflow-hidden rounded-xl border border-border bg-card transition-colors min-[1025px]:hover:border-foreground/30"
              >
                <div className="grid gap-4 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-6 sm:py-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="inline-flex items-center gap-2 text-sm font-bold tracking-[-0.01em] text-foreground">
                        <LocalIcon name="package" className="h-4 w-4" />
                        {order.orderNumber}
                      </span>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_COLORS[order.status] ?? 'bg-slate-100 text-slate-700'}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <LocalIcon name="calendar-days" className="h-3.5 w-3.5" />
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-end justify-between gap-4 border-t border-border pt-3 sm:block sm:border-0 sm:pt-0 sm:text-right">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Total</p>
                    <p className="mt-1 font-display text-lg font-bold tracking-[-0.03em] sm:text-xl">{formatPrice(order.total)}</p>
                  </div>
                </div>

                <div className="border-t border-border px-4 py-4 sm:px-6">
                  <div className="flex items-center gap-3 sm:gap-5">
                    <div className="flex shrink-0 gap-2">
                      {order.items.map((item, index) => (
                        <div
                          key={`${item.productName}-${index}`}
                          className="product-media-frame relative w-12 overflow-hidden rounded-lg border border-border bg-muted/30 sm:w-[3.5rem]"
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="h-full w-full object-contain p-1"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : null}
                        </div>
                      ))}
                    </div>
                    <p className="min-w-0 flex-1 text-sm leading-6 text-muted-foreground line-clamp-2 sm:line-clamp-1">
                      {order.items.map((item, i) => (
                        <span key={i}>
                          {item.productName}
                          {i < order.items.length - 1 && <>, </>}
                        </span>
                      ))}
                      {order._count.items > 3 && <span> +{order._count.items - 3} more</span>}
                    </p>
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors min-[1025px]:group-hover:border-foreground/40 min-[1025px]:group-hover:text-foreground">
                      <LocalIcon name="chevron-right" className="h-4 w-4" />
                    </span>
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
