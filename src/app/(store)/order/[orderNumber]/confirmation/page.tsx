import { db } from '@/backend/database'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, MapPin, CreditCard, ArrowRight } from 'lucide-react'
import { formatPrice, formatDate } from '@/backend/utils'

interface Props { params: { orderNumber: string } }

export default async function OrderConfirmationPage({ params }: Props) {
  const order = await db.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: {
      items: true,
      address: true,
    },
  })

  if (!order) notFound()

  return (
    <div className="container-site py-12">
      <div className="max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="font-display text-3xl font-bold">Order Confirmed!</h1>
          <p className="text-muted-foreground mt-2">
            Thank you for your order. We'll send you updates as it progresses.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-secondary rounded-xl px-5 py-2.5">
            <span className="text-sm text-muted-foreground">Order Number:</span>
            <span className="font-mono font-bold text-lg">{order.orderNumber}</span>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-4">
          {/* Items */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2 font-semibold">
              <Package className="h-4 w-4 text-primary" /> Order Items
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    {item.variantName && <p className="text-xs text-muted-foreground">{item.variantName}</p>}
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold">{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-secondary border-t border-border space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</span></div>
              <div className="flex justify-between font-bold text-base border-t border-border pt-1.5 mt-0.5"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>

          {/* Delivery & Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {order.address && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 font-semibold mb-3 text-sm">
                  <MapPin className="h-4 w-4 text-primary" /> Delivery Address
                </div>
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p className="font-medium text-foreground">{order.address.fullName}</p>
                  <p>{order.address.phone}</p>
                  <p>{order.address.addressLine1}</p>
                  <p>{order.address.city}, {order.address.district}</p>
                  <p>{order.address.division}</p>
                </div>
              </div>
            )}

            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 font-semibold mb-3 text-sm">
                <CreditCard className="h-4 w-4 text-primary" /> Payment
              </div>
              <div className="text-sm space-y-1">
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated</span>
                  <span className="font-medium">1–3 business days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link href="/account/orders" className="btn-primary flex-1 flex items-center justify-center gap-2">
            Track Order <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/" className="btn-outline flex-1 flex items-center justify-center">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
