import Link from 'next/link'
import { formatDate, formatPrice } from '@/backend/utils'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

type RecentOrder = {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: Date
  items: Array<{ productName: string; imageUrl: string | null }>
  _count: { items: number }
}

function statusClass(status: string) {
  if (status === 'DELIVERED') return 'bg-emerald-50 text-emerald-700'
  if (['CANCELLED', 'RETURNED', 'REFUNDED'].includes(status)) return 'bg-red-50 text-red-700'
  return 'bg-blue-50 text-blue-700'
}

function statusLabel(status: string) {
  const text = status.replaceAll('_', ' ').toLowerCase()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function RecentOrderCard({ order }: { order: RecentOrder | null }) {
  return (
    <section aria-labelledby="recent-orders-heading" className="rounded-lg border border-border bg-card p-4 sm:p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="recent-orders-heading" className="font-display text-lg font-semibold tracking-[-0.02em]">Recent Orders</h2>
        <Link href="/account/orders" className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-semibold transition-colors hover:bg-black/[0.025]">
          <span className="hidden sm:inline">View All Orders</span><span className="sm:hidden">View All</span>
        </Link>
      </div>

      {order ? (
        <Link href={`/account/orders/${order.id}`} className="group grid grid-cols-[4.25rem_minmax(0,1fr)] items-center gap-3.5 sm:grid-cols-[4.75rem_minmax(0,1fr)_auto] sm:gap-4">
          <span className="product-media-frame relative w-[4.25rem] overflow-hidden rounded-md border border-border bg-black/[0.02] sm:w-[4.75rem]">
            {order.items[0]?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={order.items[0].imageUrl} alt="" className="h-full w-full object-contain p-1" loading="lazy" decoding="async" />
            ) : (
              <span className="flex h-full w-full items-center justify-center"><LocalIcon name="package" className="h-7 w-7 text-muted-foreground" /></span>
            )}
          </span>
          <span className="min-w-0">
            <strong className="block truncate font-display text-base font-semibold">Order #{order.orderNumber}</strong>
            <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>{order._count.items} {order._count.items === 1 ? 'item' : 'items'}</span><span aria-hidden="true">•</span><span>{formatDate(order.createdAt)}</span>
            </span>
            <span className={`mt-2 inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${statusClass(order.status)}`}>{statusLabel(order.status)}</span>
          </span>
          <span className="col-span-2 flex items-center justify-end gap-3 sm:col-span-1 sm:gap-6">
            <strong className="whitespace-nowrap font-display text-base font-semibold sm:text-lg">{formatPrice(order.total)}</strong>
            <LocalIcon name="chevron-right" className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ) : (
        <div className="flex items-center justify-between gap-4 rounded-lg bg-secondary/45 p-4">
          <p className="text-sm text-muted-foreground">Your recent orders will appear here.</p>
          <Link href="/" className="shrink-0 text-sm font-semibold text-primary">Start shopping</Link>
        </div>
      )}
    </section>
  )
}
