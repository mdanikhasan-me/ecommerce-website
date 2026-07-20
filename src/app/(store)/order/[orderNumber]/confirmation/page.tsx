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
    where: { orderNumber, ...(isOrderAdmin ? {} : { userId: session.user.id }) },
    include: { items: true, address: true },
  })

  if (!order) notFound()

  const placedOn = new Intl.DateTimeFormat('en-BD', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(order.createdAt)
  const receiptPath = getInvoicePdfDownloadPath(order.id)
  const receiptFilename = buildInvoiceDownloadFilename(order.orderNumber)
  const formatEnumLabel = (value: string) => value.toLowerCase().split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
  const actions = (
    <>
      <Link href={`/account/orders/${order.id}`} className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#121212] px-4 text-sm font-semibold text-white">
        <LocalIcon name="truck" className="h-4 w-4" /> Track Order <LocalIcon name="arrow-right" className="h-4 w-4" />
      </Link>
      <a href={receiptPath} download={receiptFilename} className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold">
        <LocalIcon name="download" className="h-4 w-4" /> Download receipt
      </a>
      <Link href="/" className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold">
        <LocalIcon name="shopping-bag" className="h-4 w-4" /> Continue shopping
      </Link>
    </>
  )

  return (
    <div className="container-site py-6 sm:py-8 lg:py-10">
      <div className="w-full">
        <section className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5 rounded-xl border border-emerald-100 bg-emerald-50/60 px-5 py-6 sm:px-8 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-600 bg-emerald-50 sm:h-[4.5rem] sm:w-[4.5rem]">
            <LocalIcon name="check" className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-[-0.035em] sm:text-3xl">Order placed successfully</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">We&apos;ll send updates as your order progresses.</p>
          </div>
          <div className="col-span-2 flex items-center gap-3 rounded-lg border border-white/80 bg-card px-4 py-3 lg:col-span-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><LocalIcon name="receipt-text" className="h-5 w-5" /></span>
            <span className="min-w-0 text-sm"><span className="block text-muted-foreground">Order ID <strong className="ml-1 font-mono text-foreground">{order.orderNumber}</strong></span><span className="mt-0.5 block text-muted-foreground">Placed on {placedOn}</span></span>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(20rem,1fr)]">
          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4 text-sm font-semibold sm:px-6"><LocalIcon name="shopping-bag" className="h-4 w-4" /> Order items</div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-4 sm:gap-4 sm:px-6">
                  <div className="product-media-frame h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30 sm:h-[4.25rem] sm:w-[4.25rem]">
                    {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-full w-full object-contain p-1" loading="lazy" decoding="async" /> : null}
                  </div>
                  <div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-semibold sm:text-base">{item.productName}</p>{item.variantName ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.variantName}</p> : null}<p className="mt-1 text-sm text-muted-foreground">Qty: {item.quantity}</p></div>
                  <span className="shrink-0 text-sm font-semibold sm:text-base">{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-border px-5 py-4 text-sm sm:px-6">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</span></div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold sm:text-lg"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
            <div className="hidden grid-cols-3 gap-3 border-t border-border p-5 lg:grid lg:p-6">{actions}</div>
          </section>

          <aside className="space-y-5">
            {order.address ? (
              <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                <h2 className="flex items-center gap-2 text-sm font-semibold"><LocalIcon name="location" className="h-4 w-4" /> Delivery address</h2>
                <div className="mt-4 space-y-0.5 text-sm leading-5 text-muted-foreground"><p className="font-semibold text-foreground">{order.address.fullName}</p><p>{order.address.phone}</p><p>{order.address.addressLine1}</p><p>{order.address.city}, {order.address.district}</p><p>{order.address.division}</p></div>
              </section>
            ) : null}
            <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold"><LocalIcon name="credit-card" className="h-4 w-4" /> Payment &amp; delivery</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-4"><span className="text-muted-foreground">Payment method</span><span className="text-right font-medium">{formatEnumLabel(order.paymentMethod)}</span></div>
                <div className="flex items-center justify-between gap-4"><span className="text-muted-foreground">Payment status</span><span className={`font-medium ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-amber-500'}`}>{formatEnumLabel(order.paymentStatus)}</span></div>
                <div className="mt-3 flex items-center justify-between gap-4 border-t border-border pt-3"><span className="text-muted-foreground">Delivery method</span><span className="text-right font-medium">Standard delivery {order.shippingFee === 0 ? '· Free' : `· ${formatPrice(order.shippingFee)}`}</span></div>
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-5 grid gap-3 lg:hidden">{actions}</div>
        <section className="mt-5 flex flex-col gap-4 rounded-xl border border-border bg-card px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3"><LocalIcon name="headset" className="h-6 w-6" /><span><strong className="block text-foreground">Need help with your order?</strong><span className="text-muted-foreground">Our support team is here for you.</span></span></div>
          <div className="flex divide-x divide-border font-semibold"><Link href="/help" className="flex items-center gap-2 pr-4"><LocalIcon name="message-circle" className="h-4 w-4" /> Help Center</Link><Link href="/contact" className="flex items-center gap-2 pl-4"><LocalIcon name="mail" className="h-4 w-4" /> Contact support</Link></div>
        </section>
      </div>
    </div>
  )
}
