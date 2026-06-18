import Image from 'next/image'
import { notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { formatDate, formatPrice } from '@/backend/utils'
import { OrderStatusUpdater } from '@/frontend/components/admin/OrderStatusUpdater'
import { PaymentStatusUpdater } from '@/frontend/components/admin/PaymentStatusUpdater'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata = { title: 'Admin Order Details' }

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      address: true,
      items: { include: { product: { select: { slug: true } } } },
      payment: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
      coupon: { select: { code: true, name: true } },
    },
  })

  if (!order) notFound()

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="break-words font-mono text-lg font-bold tracking-[0.04em] sm:text-xl">
            Order {order.orderNumber}
          </h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <div className="border-b border-border px-5 py-4 font-semibold">Order Items</div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 p-4 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:gap-4">
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-xs text-muted-foreground">{item.variantName}</p>
                    )}
                    <p className="text-xs font-mono text-muted-foreground">{item.productSku}</p>
                  </div>
                  <div className="col-span-2 flex items-center justify-between gap-3 border-t border-border pt-3 text-sm sm:col-span-1 sm:block sm:border-t-0 sm:pt-0 sm:text-right">
                    <p className="font-semibold">{formatPrice(item.total)}</p>
                    <p className="text-muted-foreground">
                      {formatPrice(item.price)} x {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 border-t border-border bg-secondary p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.coupon ? `(${order.coupon.code})` : ''}</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="mt-1.5 flex justify-between border-t border-border pt-1.5 text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-border bg-card">
            <div className="border-b border-border px-5 py-4 font-semibold">Order Timeline</div>
            <div className="p-5">
              <div className="space-y-4">
                {order.statusHistory.map((entry, index) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${
                          index === order.statusHistory.length - 1
                            ? 'bg-primary'
                            : 'bg-muted-foreground/30'
                        }`}
                      />
                      {index < order.statusHistory.length - 1 && (
                        <div className="mt-1 h-full w-0.5 bg-border" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-semibold">{entry.status.replace(/_/g, ' ')}</p>
                      {entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <div className="border-b border-border px-5 py-4 font-semibold">Customer</div>
            <div className="space-y-2 p-5 text-sm">
              <p className="font-medium">{order.user?.name ?? 'Guest'}</p>
              <p className="text-muted-foreground">{order.user?.email ?? order.guestEmail}</p>
              {order.user?.phone && <p className="text-muted-foreground">{order.user.phone}</p>}
              {order.isGuestOrder && (
                <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  Guest order
                </span>
              )}
            </div>
          </div>

          {order.address && (
            <div className="overflow-hidden rounded-md border border-border bg-card">
              <div className="border-b border-border px-5 py-4 font-semibold">
                Delivery Address
              </div>
              <div className="space-y-1 p-5 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{order.address.fullName}</p>
                <p>{order.address.phone}</p>
                <p>{order.address.addressLine1}</p>
                {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                <p>
                  {order.address.city}, {order.address.district}
                </p>
                <p>{order.address.division}</p>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-md border border-border bg-card">
            <div className="border-b border-border px-5 py-4 font-semibold">Payment</div>
            <div className="space-y-4 p-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{order.paymentMethod.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`font-medium ${
                    order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-amber-500'
                  }`}
                >
                  {order.paymentStatus.replace(/_/g, ' ')}
                </span>
              </div>
              {order.payment?.transactionId && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-xs">{order.payment.transactionId}</span>
                </div>
              )}
              <PaymentStatusUpdater orderId={order.id} currentStatus={order.paymentStatus} />
            </div>
          </div>

          {order.notes && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <p className="mb-1 text-xs font-semibold text-amber-700">Order Note</p>
              <p className="text-sm text-amber-800">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
