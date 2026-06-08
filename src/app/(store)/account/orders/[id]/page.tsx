import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import {
  getOrderProgressState,
  isOrderProgressStepComplete,
  isOrderProgressStepCurrent,
  ORDER_PROGRESS_STEPS,
} from '@/backend/orders/order-progress'
import { buildInvoiceDownloadFilename, getInvoicePdfDownloadPath } from '@/backend/orders/order-invoice'
import { cn, formatDate, formatPrice } from '@/backend/utils'
import { CopyOrderNumberButton } from '@/frontend/components/account/CopyOrderNumberButton'
import { ReturnRequestButton } from '@/frontend/components/account/ReturnRequestButton'
import { CONTACT_EMAIL, CONTACT_PHONE } from '@/shared/contact'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  FileQuestion,
  Headphones,
  Mail,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  RotateCcw,
  Star,
  Truck,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Boilabin Order Details' }

const RETURN_WINDOW_DAYS = 7
const SUPPORT_HOURS = 'Monday to Saturday, 9am to 6pm'

const STEP_ICONS = [ReceiptText, CheckCircle2, Package, Truck, CheckCircle2] as const

const STATUS_BADGE_CLASSES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-100',
  CONFIRMED: 'bg-blue-50 text-blue-700 ring-blue-100',
  PACKED: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  SHIPPED: 'bg-purple-50 text-purple-700 ring-purple-100',
  DELIVERED: 'bg-green-50 text-green-700 ring-green-100',
  CANCELLED: 'bg-red-50 text-red-700 ring-red-100',
  RETURN_REQUESTED: 'bg-orange-50 text-orange-700 ring-orange-100',
  RETURNED: 'bg-slate-100 text-slate-700 ring-slate-200',
  REFUND_REQUESTED: 'bg-orange-50 text-orange-700 ring-orange-100',
  REFUNDED: 'bg-slate-100 text-slate-700 ring-slate-200',
}

const PAYMENT_BADGE_CLASSES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-100',
  PAID: 'bg-green-50 text-green-700 ring-green-100',
  FAILED: 'bg-red-50 text-red-700 ring-red-100',
  REFUNDED: 'bg-slate-100 text-slate-700 ring-slate-200',
  PARTIALLY_REFUNDED: 'bg-orange-50 text-orange-700 ring-orange-100',
}

function formatEnumLabel(value: string) {
  return value
    .split('_')
    .map((part, index) => {
      const lower = part.toLowerCase()
      if (index > 0 && ['on', 'of', 'and', 'to', 'for'].includes(lower)) return lower
      return part.charAt(0) + part.slice(1).toLowerCase()
    })
    .join(' ')
}

function getReturnState(order: {
  status: string
  deliveredAt: Date | null
  returnRequest: unknown
  statusHistory: { status: string; createdAt: Date }[]
}) {
  if (order.returnRequest) return { canReturn: false, reason: 'Return request already submitted.' }
  const deliveredAt = order.deliveredAt ?? order.statusHistory.find((entry) => entry.status === 'DELIVERED')?.createdAt
  if (order.status !== 'DELIVERED' || !deliveredAt) {
    return { canReturn: false, reason: 'Return becomes available after delivery.' }
  }
  const deadline = new Date(deliveredAt.getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000)
  if (Date.now() > deadline.getTime()) {
    return { canReturn: false, reason: 'The 7 day return window has closed.' }
  }
  return { canReturn: true, reason: `Available until ${formatDate(deadline)}.` }
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')
  const { id } = await params

  const order = await db.order.findFirst({
    where: { id, userId: session.user.id },
    include: {
      items: {
        include: {
          product: { select: { name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } } },
        },
      },
      address: true,
      returnRequest: { select: { id: true, status: true } },
      statusHistory: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!order) notFound()

  const progress = getOrderProgressState(order.status)
  const reviewStatuses = order.status === 'DELIVERED' && order.items.length > 0
    ? await db.review.findMany({
        where: {
          userId: session.user.id,
          productId: { in: order.items.map((item) => item.productId) },
        },
        select: { productId: true, status: true },
      })
    : []
  const reviewStatusByProductId = new Map(reviewStatuses.map((review) => [review.productId, review.status]))
  const returnState = getReturnState(order)
  const orderStatusLabel = formatEnumLabel(order.status)
  const paymentStatusLabel = formatEnumLabel(order.paymentStatus)
  const paymentMethodLabel = formatEnumLabel(order.paymentMethod)
  const invoicePdfPath = getInvoicePdfDownloadPath(order.id)
  const invoicePdfFilename = buildInvoiceDownloadFilename(order.orderNumber)

  return (
    <main className="container-site py-4 sm:py-7 lg:py-9">
      <div className="mx-auto max-w-[88rem]">
        <div className="mb-3 flex items-center justify-between lg:hidden">
          <Link
            href="/account/orders"
            aria-label="Back to orders"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-lg font-bold">Order Details</h1>
          <span className="h-10 w-10" aria-hidden="true" />
        </div>

        <Link
          href="/account/orders"
          className="mb-5 hidden items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        <section className="rounded-2xl border border-border bg-card shadow-[0_16px_42px_rgba(23,18,15,0.045)]">
          <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(13rem,1.05fr)_minmax(10rem,0.75fr)_minmax(8rem,0.58fr)_minmax(9rem,0.62fr)_auto] lg:items-center lg:p-6">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground lg:hidden">
                <ReceiptText className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Order ID</p>
                <div className="mt-1 flex min-w-0 items-center gap-2">
                  <p className="truncate font-mono text-base font-bold tracking-[0.02em] sm:text-lg">
                    {order.orderNumber}
                  </p>
                  <CopyOrderNumberButton orderNumber={order.orderNumber} />
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Placed on</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium sm:text-base">
                <CalendarDays className="h-4 w-4 text-muted-foreground lg:hidden" />
                {formatDate(order.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Status</p>
              <span className={cn(
                'mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1',
                STATUS_BADGE_CLASSES[order.status] ?? 'bg-secondary text-foreground ring-border',
              )}>
                {orderStatusLabel}
              </span>
            </div>

            <div className="flex items-end justify-between gap-4 lg:block">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Total</p>
                <p className="mt-1 font-display text-2xl font-bold tracking-[-0.04em] lg:text-xl">
                  {formatPrice(order.total)}
                </p>
              </div>
            </div>

            <a
              href={invoicePdfPath}
              download={invoicePdfFilename}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 lg:w-auto lg:bg-card lg:text-foreground lg:hover:bg-secondary"
            >
              <Download className="h-4 w-4" />
              Download Invoice
            </a>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-[0_12px_30px_rgba(23,18,15,0.035)] sm:mt-5 sm:p-5">
          <div className="relative grid grid-cols-5">
            <div className="absolute left-0 right-0 top-4 h-px bg-border sm:top-[1.125rem]" />
            <div
              className={cn(
                'absolute left-0 top-4 h-px transition-all sm:top-[1.125rem]',
                progress.tone === 'cancelled' ? 'bg-red-300' : progress.tone === 'return' ? 'bg-orange-300' : 'bg-primary',
                progress.progressWidthClass,
              )}
            />

            {ORDER_PROGRESS_STEPS.map((step, index) => {
              const StepIcon = STEP_ICONS[index]
              const isComplete = isOrderProgressStepComplete(progress, index)
              const isCurrent = isOrderProgressStepCurrent(progress, index)

              return (
                <div key={step.key} className="relative z-10 flex min-w-0 flex-col items-center text-center">
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-bold transition-colors sm:h-9 sm:w-9',
                      isComplete
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-muted-foreground',
                      isCurrent && progress.tone === 'cancelled' && 'border-red-600 bg-red-600 text-white',
                      isCurrent && progress.tone === 'return' && 'border-orange-500 bg-orange-500 text-white',
                      isCurrent && 'ring-2 ring-primary/15 ring-offset-2 ring-offset-card',
                    )}
                  >
                    <span className="hidden sm:inline-flex">
                      <StepIcon className="h-4 w-4" />
                    </span>
                    <span className="sm:hidden">{index + 1}</span>
                  </span>
                  <span
                    className={cn(
                      'mt-2 max-w-[4.8rem] text-[10px] font-medium leading-tight sm:max-w-none sm:text-xs',
                      isComplete ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>

          {progress.tone !== 'active' ? (
            <p className={cn(
              'mt-4 rounded-xl px-3 py-2 text-xs leading-5',
              progress.tone === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700',
            )}>
              Current order state: {orderStatusLabel}. Future fulfillment steps are not shown as completed unless the order reached them.
            </p>
          ) : null}
        </section>

        <div className="mt-4 grid gap-4 sm:mt-5 lg:grid-cols-[minmax(0,1.32fr)_minmax(15rem,0.62fr)_minmax(17rem,0.78fr)] lg:items-start">
          <section className="rounded-2xl border border-border bg-card shadow-[0_12px_30px_rgba(23,18,15,0.035)]">
            <div className="border-b border-border px-4 py-4 sm:px-5">
              <h2 className="font-display text-lg font-semibold">
                Order item{order.items.length === 1 ? '' : 's'}
              </h2>
            </div>

            <div className="divide-y divide-border">
              {order.items.map((item) => {
                const displayName = item.productName || item.product.name
                const imageUrl = item.imageUrl ?? item.product.images[0]?.url

                return (
                  <div key={item.id} className="grid grid-cols-[6rem_minmax(0,1fr)] gap-3 p-4 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:gap-5 sm:p-5">
                    <div className="h-24 w-24 overflow-hidden rounded-xl border border-border bg-secondary sm:h-28 sm:w-28">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={displayName}
                          width={112}
                          height={112}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <Link href={`/products/${item.product.slug}`} className="font-semibold transition-colors hover:text-primary">
                        {displayName}
                      </Link>
                      {item.variantName ? (
                        <p className="mt-1 text-xs text-muted-foreground">{item.variantName}</p>
                      ) : null}
                      <p className="mt-3 text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Unit price: {formatPrice(item.price)}</p>

                      {order.status === 'DELIVERED' ? (
                        <div className="mt-3">
                          {reviewStatusByProductId.get(item.productId) === 'APPROVED' ? (
                            <span className="text-xs font-medium text-green-600">Review submitted</span>
                          ) : null}
                          {reviewStatusByProductId.get(item.productId) === 'PENDING' ? (
                            <span className="text-xs font-medium text-amber-600">Review pending</span>
                          ) : null}
                          {reviewStatusByProductId.get(item.productId) === 'REJECTED' ? (
                            <span className="text-xs font-medium text-red-600">Review unavailable</span>
                          ) : null}
                          {!reviewStatusByProductId.has(item.productId) ? (
                            <Link
                              href={`/products/${item.product.slug}#write-review`}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                            >
                              <Star className="h-3.5 w-3.5" />
                              Leave a review
                            </Link>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="col-span-2 flex items-end justify-between border-t border-border pt-3 sm:col-span-1 sm:block sm:border-t-0 sm:pt-0 sm:text-right">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:block">
                        Line total
                      </span>
                      <span className="font-display text-xl font-bold tracking-[-0.03em] sm:mt-2 sm:block">
                        {formatPrice(item.total)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="space-y-2 border-t border-border bg-secondary/35 p-4 text-sm sm:p-5">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              {order.discount > 0 ? (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-600">-{formatPrice(order.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between gap-4 border-t border-border pt-3 font-semibold">
                <span>Item total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-[0_12px_30px_rgba(23,18,15,0.035)] sm:p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <MapPin className="h-4 w-4" />
              </span>
              <h2 className="font-display text-lg font-semibold">Delivery address</h2>
            </div>
            {order.address ? (
              <div className="mt-4 space-y-1.5 text-sm leading-6 text-muted-foreground">
                <p className="font-semibold text-foreground">{order.address.fullName}</p>
                <p>{order.address.addressLine1}</p>
                {order.address.addressLine2 ? <p>{order.address.addressLine2}</p> : null}
                <p>{order.address.city}, {order.address.district}</p>
                <p>{order.address.phone}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No saved delivery address is attached to this order.</p>
            )}
          </section>

          <div className="space-y-4">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-[0_12px_30px_rgba(23,18,15,0.035)] sm:p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <CreditCard className="h-4 w-4" />
                </span>
                <h2 className="font-display text-lg font-semibold">Payment</h2>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Method</span>
                  <span className="text-right font-medium">{paymentMethodLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Status</span>
                  <span className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
                    PAYMENT_BADGE_CLASSES[order.paymentStatus] ?? 'bg-secondary text-foreground ring-border',
                  )}>
                    {paymentStatusLabel}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-4 shadow-[0_12px_30px_rgba(23,18,15,0.035)] sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <RotateCcw className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold">Return</h2>
                  <p className="text-xs text-muted-foreground">Request a return for this order</p>
                </div>
              </div>
              <div className="sm:max-w-[14rem]">
                <ReturnRequestButton
                  orderId={order.id}
                  disabled={!returnState.canReturn}
                  disabledReason={returnState.reason}
                />
              </div>
              {returnState.canReturn ? (
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{returnState.reason}</p>
              ) : null}
            </section>
          </div>
        </div>

        <section className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-[0_12px_30px_rgba(23,18,15,0.035)] sm:mt-5 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(13rem,1.1fr)_minmax(0,0.95fr)_minmax(0,0.85fr)_minmax(0,1fr)] lg:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary">
                <Headphones className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display font-semibold">Need help?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Our support team is here to assist you.</p>
              </div>
            </div>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-secondary lg:border-0 lg:px-0"
            >
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{CONTACT_EMAIL}</span>
            </a>

            <a
              href={`tel:${CONTACT_PHONE}`}
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-secondary lg:border-0 lg:px-0"
            >
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>{CONTACT_PHONE}</span>
            </a>

            <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm lg:border-0 lg:px-0">
              <Clock3 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>{SUPPORT_HOURS}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 lg:hidden">
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-3 text-xs font-semibold transition-colors hover:bg-secondary"
            >
              <Headphones className="h-4 w-4" />
              Contact Support
            </Link>
            <Link
              href="/faq"
              className="flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-3 text-xs font-semibold transition-colors hover:bg-secondary"
            >
              <FileQuestion className="h-4 w-4" />
              FAQs
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
