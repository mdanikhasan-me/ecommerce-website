import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle, CreditCard, MapPin, Package } from 'lucide-react'

import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { generateNoIndexPageMetadata } from '@/backend/seo'
import { formatPrice } from '@/backend/utils'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ orderNumber: string }>
}

export const metadata: Metadata = generateNoIndexPageMetadata(
  'Order Confirmation',
  'Private Boilabin order confirmation.',
  '/order/confirmation',
)

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderNumber } = await params
  const session = await auth()

  if (!session?.user) notFound()

  const isOrderAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
  const order = await db.order.findFirst({
    where: {
      orderNumber,
      ...(isOrderAdmin ? {} : { userId: session.user.id }),
    },
    include: {
      items: true,
      address: true,
    },
  })

  if (!order) notFound()

  return (
    <div className="container-site py-12">
      <div className="max-w-2xl">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="font-display text-3xl font-bold">Order Confirmed!</h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for your order. We&apos;ll send you updates as it progresses.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5">
            <span className="text-sm text-muted-foreground">Order Number:</span>
            <span className="font-mono text-lg font-bold">{order.orderNumber}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4 font-semibold">
              <Package className="h-4 w-4 text-primary" /> Order Items
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    {item.variantName ? (
                      <p className="text-xs text-muted-foreground">{item.variantName}</p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold">{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1 border-t border-border bg-secondary px-5 py-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</span>
              </div>
              <div className="mt-0.5 flex justify-between border-t border-border pt-1.5 text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {order.address ? (
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="h-4 w-4 text-primary" /> Delivery Address
                </div>
                <div className="space-y-0.5 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{order.address.fullName}</p>
                  <p>{order.address.phone}</p>
                  <p>{order.address.addressLine1}</p>
                  <p>
                    {order.address.city}, {order.address.district}
                  </p>
                  <p>{order.address.division}</p>
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <CreditCard className="h-4 w-4 text-primary" /> Payment
              </div>
              <div className="space-y-1 text-sm">
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
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">Varies by address</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/account/orders" className="btn-primary flex flex-1 items-center justify-center gap-2">
            Track Order <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/" className="btn-outline flex flex-1 items-center justify-center">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
