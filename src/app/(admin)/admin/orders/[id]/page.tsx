import { notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { formatPrice, formatDate } from '@/backend/utils'
import { OrderStatusUpdater } from '@/frontend/components/admin/OrderStatusUpdater'
import Image from 'next/image'

interface Props { params: { id: string } }
export const metadata = { title: 'Admin Order Details' }

export default async function AdminOrderDetailPage({ params }: Props) {
  const order = await db.order.findUnique({
    where: { id: params.id },
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

  const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED']

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border font-semibold">Order Items</div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4">
                  <div className="relative h-14 w-14 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                    {item.imageUrl && <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" sizes="56px" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.productName}</p>
                    {item.variantName && <p className="text-xs text-muted-foreground">{item.variantName}</p>}
                    <p className="text-xs font-mono text-muted-foreground">{item.productSku}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">{formatPrice(item.total)}</p>
                    <p className="text-muted-foreground">{formatPrice(item.price)} × {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-secondary border-t border-border space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount {order.coupon && `(${order.coupon.code})`}</span><span>−{formatPrice(order.discount)}</span></div>}
              <div className="flex justify-between font-bold text-base border-t border-border pt-1.5 mt-1.5"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border font-semibold">Order Timeline</div>
            <div className="p-5">
              <div className="relative space-y-4">
                {order.statusHistory.map((h, i) => (
                  <div key={h.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full mt-1 flex-shrink-0 ${i === order.statusHistory.length - 1 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                      {i < order.statusHistory.length - 1 && <div className="w-0.5 h-full bg-border mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-semibold">{h.status.replace('_', ' ')}</p>
                      {h.note && <p className="text-xs text-muted-foreground">{h.note}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(h.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border font-semibold">Customer</div>
            <div className="p-5 space-y-2 text-sm">
              <p className="font-medium">{order.user?.name ?? 'Guest'}</p>
              <p className="text-muted-foreground">{order.user?.email ?? order.guestEmail}</p>
              {order.user?.phone && <p className="text-muted-foreground">{order.user.phone}</p>}
              {order.isGuestOrder && <span className="inline-block bg-secondary text-muted-foreground text-xs px-2 py-0.5 rounded-full">Guest Order</span>}
            </div>
          </div>

          {/* Address */}
          {order.address && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border font-semibold">Delivery Address</div>
              <div className="p-5 text-sm space-y-1 text-muted-foreground">
                <p className="font-medium text-foreground">{order.address.fullName}</p>
                <p>{order.address.phone}</p>
                <p>{order.address.addressLine1}</p>
                {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                <p>{order.address.city}, {order.address.district}</p>
                <p>{order.address.division}</p>
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border font-semibold">Payment</div>
            <div className="p-5 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{order.paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-medium ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-amber-500'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.payment?.transactionId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-xs">{order.payment.transactionId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-amber-700 mb-1">Order Note</p>
              <p className="text-sm text-amber-800">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
