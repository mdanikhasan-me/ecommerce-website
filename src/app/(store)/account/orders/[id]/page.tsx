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
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import type { StorefrontIconName } from '@/shared/storefront-icons'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Boilabin Order Details' }

const RETURN_WINDOW_DAYS = 7
const SHIPPING_METHOD_LABEL = 'Standard Delivery'

const STEP_ICONS = ['receipt-text', 'check-circle', 'package', 'truck', 'check-circle'] as const satisfies readonly StorefrontIconName[]

const STATUS_BADGE_CLASSES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-100',
  CONFIRMED: 'bg-green-50 text-green-700 ring-green-100',
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
  REFUNDED: 'bg-amber-50 text-amber-700 ring-amber-100',
  PARTIALLY_REFUNDED: 'bg-orange-50 text-orange-700 ring-orange-100',
}

const STATUS_DESCRIPTIONS: Record<string, string> = {
  PENDING: 'Your order has been received and is waiting for confirmation.',
  CONFIRMED: 'Your order is confirmed and will be processed soon.',
  PACKED: 'Your order is packed and ready for shipping.',
  SHIPPED: 'Your order is on the way.',
  DELIVERED: 'Your order has been delivered.',
  CANCELLED: 'This order was cancelled.',
  RETURN_REQUESTED: 'A return request is being reviewed.',
  RETURNED: 'This order has been returned.',
  REFUND_REQUESTED: 'A refund request is being reviewed.',
  REFUNDED: 'This order has been refunded.',
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

function formatOrderTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
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

function getEstimatedDeliveryLabel(order: {
  status: string
  deliveredAt: Date | null
  statusHistory: { status: string; createdAt: Date }[]
}) {
  const deliveredAt = order.deliveredAt ?? order.statusHistory.find((entry) => entry.status === 'DELIVERED')?.createdAt
  if (order.status === 'DELIVERED' && deliveredAt) return formatDate(deliveredAt)
  return '-'
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
  const statusDescription = STATUS_DESCRIPTIONS[order.status] ?? 'Your order status has been updated.'
  const statusHistoryByStatus = new Map<string, Date>()

  for (const entry of [...order.statusHistory].reverse()) {
    if (!statusHistoryByStatus.has(entry.status)) statusHistoryByStatus.set(entry.status, entry.createdAt)
  }

  return (
    <main className="container-site py-4 sm:py-7 lg:py-9">
      <div className="w-full">
        <div className="mb-4 sm:mb-5">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors md:hover:text-foreground"
          >
            <LocalIcon name="arrow-left" className="h-4 w-4" />
            Back to orders
          </Link>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
            Order Details
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Here&apos;s everything about your order.
          </p>
        </div>

        <section className="rounded-2xl border border-border bg-card shadow-[0_16px_42px_rgba(23,18,15,0.045)]">
          <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-[minmax(12rem,1fr)_minmax(14rem,1.12fr)_minmax(10rem,0.82fr)_minmax(12rem,0.95fr)_minmax(13rem,1fr)_minmax(12rem,0.95fr)] xl:gap-0 xl:p-6">
            <div className="min-w-0 xl:pr-6">
              <p className="text-xs font-medium text-muted-foreground">Order ID</p>
              <div className="mt-2 flex min-w-0 items-center gap-2">
                <p className="truncate font-mono text-base font-bold tracking-[0.02em]">
                  {order.orderNumber}
                </p>
                <CopyOrderNumberButton orderNumber={order.orderNumber} />
              </div>
            </div>

            <div className="border-border xl:border-l xl:px-6">
              <p className="text-xs font-medium text-muted-foreground">Status</p>
              <span className={cn(
                'mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1',
                STATUS_BADGE_CLASSES[order.status] ?? 'bg-secondary text-foreground ring-border',
              )}>
                <LocalIcon name="check-circle" className="h-3.5 w-3.5" />
                {orderStatusLabel}
              </span>
              <p className="mt-2 max-w-[16rem] text-xs leading-5 text-muted-foreground">
                {statusDescription}
              </p>
            </div>

            <div className="border-border xl:border-l xl:px-6">
              <p className="text-xs font-medium text-muted-foreground">Placed on</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
                <LocalIcon name="calendar-days" className="h-4 w-4 text-muted-foreground" />
                {formatDate(order.createdAt)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{formatOrderTime(order.createdAt)}</p>
            </div>

            <div className="border-border xl:border-l xl:px-6">
              <p className="text-xs font-medium text-muted-foreground">Total Amount</p>
              <p className="mt-2 flex items-center gap-2 font-display text-2xl font-bold tracking-[-0.04em]">
                <LocalIcon name="credit-card" className="h-5 w-5 text-foreground" />
                {formatPrice(order.total)}
              </p>
            </div>

            <div className="border-border xl:border-l xl:px-6">
              <p className="text-xs font-medium text-muted-foreground">Payment Method</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
                <LocalIcon name="credit-card" className="h-4 w-4 text-muted-foreground" />
                {paymentMethodLabel}
              </p>
              <span className={cn(
                'mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
                PAYMENT_BADGE_CLASSES[order.paymentStatus] ?? 'bg-secondary text-foreground ring-border',
              )}>
                {paymentStatusLabel}
              </span>
            </div>

            <div className="grid gap-3 border-border xl:border-l xl:pl-6">
              <a
                href={invoicePdfPath}
                download={invoicePdfFilename}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-semibold text-background transition-colors md:hover:bg-foreground/90"
              >
                <LocalIcon name="download" className="h-4 w-4" />
                Download Invoice
              </a>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold transition-colors md:hover:bg-secondary"
              >
                <LocalIcon name="subcategory-headphones" className="h-4 w-4" />
                Contact Support
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-4 sm:mt-5 lg:grid-cols-[16rem_minmax(0,1fr)_20rem] lg:items-start">
          <section className="rounded-2xl border border-border bg-card p-4 shadow-[0_12px_30px_rgba(23,18,15,0.035)] sm:p-5">
            <h2 className="font-display text-lg font-semibold">Delivery Journey</h2>
            <ol className="mt-6 space-y-0">
              {ORDER_PROGRESS_STEPS.map((step, index) => {
                const StepIcon = STEP_ICONS[index]
                const isComplete = isOrderProgressStepComplete(progress, index)
                const isCurrent = isOrderProgressStepCurrent(progress, index)
                const stepDate = index === 0 ? order.createdAt : statusHistoryByStatus.get(step.key)

                return (
                  <li key={step.key} className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 pb-6 last:pb-0">
                    {index < ORDER_PROGRESS_STEPS.length - 1 ? (
                      <span className="absolute left-4 top-9 h-[calc(100%-2.25rem)] border-l border-dashed border-border" aria-hidden="true" />
                    ) : null}
                    <span
                      className={cn(
                        'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs transition-colors',
                        isComplete
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-secondary text-muted-foreground',
                        isCurrent && progress.tone === 'cancelled' && 'border-red-600 bg-red-600 text-white',
                        isCurrent && progress.tone === 'return' && 'border-orange-500 bg-orange-500 text-white',
                      )}
                    >
                      <LocalIcon name={StepIcon} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-sm font-semibold">{step.label}</p>
                      {isComplete && stepDate ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(stepDate)} - {formatOrderTime(stepDate)}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">Pending</p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>

          <section className="rounded-2xl border border-border bg-card shadow-[0_12px_30px_rgba(23,18,15,0.035)]">
            <div className="border-b border-border px-4 py-4 sm:px-5">
              <h2 className="font-display text-lg font-semibold">Order Items ({order.items.length})</h2>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              {order.items.map((item) => {
                const displayName = item.productName || item.product.name
                const imageUrl = item.imageUrl ?? item.product.images[0]?.url

                return (
                  <article key={item.id} className="rounded-xl border border-border p-3 sm:p-4">
                    <div className="grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
                      <div className="h-32 overflow-hidden rounded-lg bg-secondary sm:h-36">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={displayName}
                            width={160}
                            height={144}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <LocalIcon name="package" className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <Link href={`/products/${item.product.slug}`} className="text-base font-semibold transition-colors md:hover:text-primary sm:text-lg">
                          {displayName}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">SKU: {item.productSku}</p>
                        {item.variantName ? (
                          <p className="mt-1 text-xs text-muted-foreground">{item.variantName}</p>
                        ) : null}

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
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors md:hover:text-primary/80"
                              >
                                <LocalIcon name="star" className="h-3.5 w-3.5" />
                                Leave a review
                              </Link>
                            ) : null}
                          </div>
                        ) : null}

                        <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Quantity</p>
                            <p className="mt-2 font-medium">{item.quantity}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Unit Price</p>
                            <p className="mt-2 font-medium">{formatPrice(item.price)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Line Total</p>
                            <p className="mt-2 font-display text-lg font-bold tracking-[-0.03em]">{formatPrice(item.total)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}

              <div className="border-t border-border pt-4">
                <div className="ml-auto max-w-sm space-y-2 text-sm">
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
                    <span>Total Amount</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-[0_12px_30px_rgba(23,18,15,0.035)] sm:p-5">
            <h2 className="font-display text-lg font-semibold">Order Information</h2>

            <div className="mt-5 space-y-5">
              <div>
                <div className="flex items-center gap-3">
                  <LocalIcon name="truck" className="h-5 w-5" />
                  <h3 className="font-semibold">Shipping</h3>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Method</span>
                    <span className="text-right font-medium">{SHIPPING_METHOD_LABEL}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Estimated Delivery</span>
                    <span className="text-right font-medium">{getEstimatedDeliveryLabel(order)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <div className="flex items-center gap-3">
                  <LocalIcon name="credit-card" className="h-5 w-5" />
                  <h3 className="font-semibold">Payment</h3>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Method</span>
                    <span className="text-right font-medium">{paymentMethodLabel}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Status</span>
                    <span className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
                      PAYMENT_BADGE_CLASSES[order.paymentStatus] ?? 'bg-secondary text-foreground ring-border',
                    )}>
                      {paymentStatusLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <div className="flex items-center gap-3">
                  <LocalIcon name="refresh-ccw" className="h-5 w-5" />
                  <h3 className="font-semibold">Returns & Refunds</h3>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {returnState.canReturn ? returnState.reason : 'Return becomes available after delivery.'}
                </p>
                <div className="mt-4">
                  <ReturnRequestButton
                    orderId={order.id}
                    disabled={!returnState.canReturn}
                    disabledReason={returnState.reason}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
