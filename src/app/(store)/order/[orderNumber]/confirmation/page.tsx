import Link from 'next/link'
import { notFound } from 'next/navigation'

import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { buildInvoiceDownloadFilename, getInvoicePdfDownloadPath } from '@/backend/orders/order-invoice'
import { generateNoIndexPageMetadata } from '@/backend/seo'
import { formatPrice } from '@/backend/utils'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
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

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true },
  })
  const isOrderAdmin = Boolean(currentUser?.isActive && ['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role))
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

  const placedOn = new Intl.DateTimeFormat('en-BD', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(order.createdAt)
  const receiptPath = getInvoicePdfDownloadPath(order.id)
  const receiptFilename = buildInvoiceDownloadFilename(order.orderNumber)
  const formatEnumLabel = (value: string) => value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

  return (
    <div className="container-site py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <LocalIcon name="check-circle" className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="font-display text-3xl font-bold">Order placed successfully</h1>
          <p className="mt-2 text-muted-foreground">
            We&apos;ll send updates as your order progresses.
          </p>
          <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-lg border border-border bg-card px-5 py-2.5">
            <span className="text-sm text-muted-foreground">Order ID:</span>
            <span className="font-mono text-lg font-bold">{order.orderNumber}</span>
            <span className="text-sm text-muted-foreground">· Placed on {placedOn}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4 font-semibold">
              <LocalIcon name="package" className="h-4 w-4 text-primary" /> Order Items
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
            <div className="space-y-1 border-t border-border bg-black/[0.025] px-5 py-3 text-sm">
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
                  <LocalIcon name="location" className="h-4 w-4 text-primary" /> Delivery Address
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
                <LocalIcon name="credit-card" className="h-4 w-4 text-primary" /> Payment
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium">{formatEnumLabel(order.paymentMethod)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-amber-500'}`}>
                    {formatEnumLabel(order.paymentStatus)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">Standard delivery {order.shippingFee === 0 ? '· Free' : `· ${formatPrice(order.shippingFee)}`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Link href={`/account/orders/${order.id}`} className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#121212] px-4 text-sm font-semibold text-white focus-visible:bg-black/80">
            Track Order <LocalIcon name="arrow-right" className="h-4 w-4" />
          </Link>
          <a href={receiptPath} download={receiptFilename} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold focus-visible:bg-black/[0.04]">
            <LocalIcon name="download" className="h-4 w-4" /> Download receipt
          </a>
          <Link href="/" className="flex min-h-11 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-semibold focus-visible:bg-black/[0.04]">
            Continue Shopping
          </Link>
        </div>

        <div className="mt-8 border-t border-border pt-5 text-center text-sm text-muted-foreground">
          <p>Need help with this order?</p>
          <div className="mt-2 flex justify-center gap-4 font-semibold text-foreground">
            <Link href="/help" className="min-[1025px]:hover:underline">Help Center</Link>
            <Link href="/contact" className="min-[1025px]:hover:underline">Contact support</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
