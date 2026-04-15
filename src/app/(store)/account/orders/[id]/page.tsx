import { auth } from '@/backend/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { formatPrice, formatDate } from '@/backend/utils'
import { ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle, Truck, Star } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Boilabin Order Details' }

const TIMELINE_STEPS = [
  { status: 'PENDING', label: 'Order Placed', icon: Clock },
  { status: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
  { status: 'PACKED', label: 'Packed', icon: Package },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
]

const TIMELINE_PROGRESS_WIDTH_CLASSES = ['w-0', 'w-1/4', 'w-2/4', 'w-3/4', 'w-full'] as const

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

  return (
    <div className="container-site py-8">
      <div className="max-w-3xl">
        <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="size-3.5" /> Back to orders
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">{order.orderNumber}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
            isCancelled ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'
          }`}>
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Timeline */}
        {!isCancelled && (
          <div className="bg-card rounded-xl border border-border p-5 mb-6">
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
                    <span className={`text-xs mt-2 ${isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="font-display font-semibold mb-4">Items</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="size-16 rounded-lg bg-secondary overflow-hidden shrink-0">
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
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product.slug}`} className="font-medium text-sm hover:text-primary transition-colors">
                        {item.product.name}
                      </Link>
                      {item.variantName && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.variantName}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className="text-muted-foreground">Qty: {item.quantity}</span>
                        <span className="font-semibold">{formatPrice(item.total)}</span>
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
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-border mt-4 pt-4 space-y-1.5 text-sm">
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
              <div className="bg-card rounded-xl border border-border p-5">
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
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><CreditCard className="size-4" /> Payment</h3>
              <div className="text-sm space-y-1.5">
                <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span>{order.paymentMethod.replace(/_/g, ' ')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
                  <span className={order.paymentStatus === 'PAID' ? 'text-green-600 font-medium' : 'text-amber-600'}>{order.paymentStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
