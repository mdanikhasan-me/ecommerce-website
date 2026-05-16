import { auth } from '@/backend/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { formatPrice, formatDate } from '@/backend/utils'
import { ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle, Truck, Star, ReceiptText } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ReturnRequestButton } from '@/frontend/components/account/ReturnRequestButton'

export const metadata: Metadata = { title: 'Boilabin Order Details' }

const TIMELINE_STEPS = [
  { status: 'PENDING', label: 'Order Placed', icon: Clock },
  { status: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
  { status: 'PACKED', label: 'Packed', icon: Package },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
]

const TIMELINE_PROGRESS_WIDTH_CLASSES = ['w-0', 'w-1/4', 'w-2/4', 'w-3/4', 'w-full'] as const
const RETURN_WINDOW_DAYS = 7

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

  const isCancelled = order.status === 'CANCELLED'
  const statusIdx = TIMELINE_STEPS.findIndex((s) => s.status === order.status)
  const progressWidthClass = TIMELINE_PROGRESS_WIDTH_CLASSES[Math.max(0, statusIdx)] ?? 'w-0'
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

  return (
    <div className="container-site py-8 lg:py-10">
      <div className="max-w-6xl">
        <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="size-3.5" /> Back to orders
        </Link>

        <section className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_16px_42px_rgba(23,18,15,0.05)]">
          <div className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center lg:p-6">
            <div className="min-w-0">
              <p className="section-kicker">Order Details</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-2 font-mono text-sm font-bold tracking-[0.04em] text-foreground sm:text-base">
                  <ReceiptText className="h-4 w-4 text-primary" />
                  {order.orderNumber}
                </span>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                  isCancelled ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'
                }`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className="rounded-2xl bg-secondary px-5 py-4 sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Order total</p>
              <p className="mt-1 font-display text-2xl font-bold tracking-[-0.04em]">{formatPrice(order.total)}</p>
            </div>
          </div>
        </section>

        {/* Timeline */}
        {!isCancelled && (
          <div className="bg-card rounded-2xl border border-border p-5 mb-6 shadow-[0_12px_30px_rgba(23,18,15,0.04)]">
            <div className="flex items-center justify-between relative">
              {/* Background line */}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
              <div className={`absolute top-4 left-0 h-0.5 bg-primary transition-all ${progressWidthClass}`} />

              {TIMELINE_STEPS.map((step, idx) => {
                const isCompleted = idx <= statusIdx
                const isCurrent = idx === statusIdx
                const StepIcon = step.icon
                return (
                  <div key={step.status} className="relative flex flex-col items-center z-10">
                    <div className={`size-8 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                    } ${isCurrent ? 'ring-2 ring-primary/30 ring-offset-2' : ''}`}>
                      <StepIcon className="size-3.5" />
                    </div>
                    <span className={`text-[11px] sm:text-xs mt-2 ${isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
          {/* Items */}
          <div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_12px_30px_rgba(23,18,15,0.04)]">
              <div className="border-b border-border px-5 py-4">
                <h2 className="font-display text-lg font-semibold">Items</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">{order.items.length} product{order.items.length === 1 ? '' : 's'} in this order</p>
              </div>
              <div className="divide-y divide-border">
                {order.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-[4rem_minmax(0,1fr)] gap-3 p-4 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:gap-4 sm:p-5">
                    <div className="size-16 rounded-xl bg-secondary overflow-hidden shrink-0 sm:size-[4.5rem]">
                      {item.product.images[0] ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          loading="lazy"
                          decoding="async"
                          className="size-full object-cover"
                        />
                      ) : <div className="size-full bg-muted" />}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/products/${item.product.slug}`} className="font-medium text-sm hover:text-primary transition-colors">
                        {item.product.name}
                      </Link>
                      {item.variantName && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.variantName}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">Qty {item.quantity}</span>
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">{formatPrice(item.price)} each</span>
                      </div>
                      {order.status === 'DELIVERED' && (
                        <div className="mt-2">
                          {reviewStatusByProductId.get(item.productId) === 'APPROVED' && (
                            <span className="text-xs font-medium text-green-600">Review submitted</span>
                          )}
                          {reviewStatusByProductId.get(item.productId) === 'PENDING' && (
                            <span className="text-xs font-medium text-amber-600">Review pending</span>
                          )}
                          {reviewStatusByProductId.get(item.productId) === 'REJECTED' && (
                            <span className="text-xs font-medium text-red-600">Review unavailable</span>
                          )}
                          {!reviewStatusByProductId.has(item.productId) && (
                            <Link
                              href={`/products/${item.product.slug}#write-review`}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                              <Star className="size-3.5" />
                              Leave a review
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center justify-between border-t border-border pt-3 sm:col-span-1 sm:block sm:border-t-0 sm:pt-0 sm:text-right">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:block">Line total</span>
                      <span className="font-display text-lg font-bold tracking-[-0.03em] sm:mt-1 sm:block">{formatPrice(item.total)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-border bg-secondary/40 p-5 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatPrice(order.shippingFee)}</span></div>
                {order.discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-green-600">-{formatPrice(order.discount)}</span></div>}
                <div className="flex justify-between font-semibold text-base pt-1.5 border-t border-border"><span>Total</span><span>{formatPrice(order.total)}</span></div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {order.address && (
              <div className="bg-card rounded-2xl border border-border p-5 shadow-[0_12px_30px_rgba(23,18,15,0.04)]">
                <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><MapPin className="size-4" /> Shipping</h3>
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p className="font-medium text-foreground">{order.address.fullName}</p>
                  <p>{order.address.addressLine1}</p>
                  {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                  <p>{order.address.city}, {order.address.district}</p>
                  <p>{order.address.phone}</p>
                </div>
              </div>
            )}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-[0_12px_30px_rgba(23,18,15,0.04)]">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><CreditCard className="size-4" /> Payment</h3>
              <div className="text-sm space-y-1.5">
                <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span>{order.paymentMethod.replace(/_/g, ' ')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
                  <span className={order.paymentStatus === 'PAID' ? 'text-green-600 font-medium' : 'text-amber-600'}>{order.paymentStatus}</span>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5 shadow-[0_12px_30px_rgba(23,18,15,0.04)]">
              <h3 className="font-display font-semibold mb-3">Return</h3>
              <ReturnRequestButton
                orderId={order.id}
                disabled={!returnState.canReturn}
                disabledReason={returnState.reason}
              />
              {returnState.canReturn ? (
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{returnState.reason}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
