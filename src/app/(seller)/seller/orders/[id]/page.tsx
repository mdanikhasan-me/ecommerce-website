import { auth } from '@/backend/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { formatPrice, formatDate } from '@/backend/utils'
import { ArrowLeft, Package, MapPin, User, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { SellerOrderActions } from '@/frontend/components/seller/SellerOrderActions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Order Detail | Boilabin Seller' }

export default async function SellerOrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const seller = await db.seller.findUnique({ where: { userId: session.user.id } })
  if (!seller) redirect('/seller/register')

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: {
        where: { product: { sellerId: seller.id } },
        include: {
          product: { select: { name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } } },
          variant: { select: { name: true, value: true } },
        },
      },
      shippingAddress: true,
    },
  })

  if (!order || order.items.length === 0) notFound()

  const sellerTotal = order.items.reduce((s, i) => s + i.total, 0)

  return (
    <div>
      <Link href="/seller/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="size-3.5" /> Back to orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">{order.orderNumber}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <SellerOrderActions orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Package className="size-4" /> Your Items
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                  <div className="size-14 rounded-lg overflow-hidden bg-background shrink-0">
                    {item.product.images[0] ? (
                      <img src={item.product.images[0].url} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="size-full bg-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.product.name}</p>
                    {item.variant && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.variant.name}: {item.variant.value}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span>{formatPrice(item.price)} × {item.quantity}</span>
                      <span className="font-semibold">{formatPrice(item.total)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 mt-4 border-t border-border">
              <span className="font-medium">Your Subtotal</span>
              <span className="font-display font-bold text-lg">{formatPrice(sellerTotal)}</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
              <User className="size-4" /> Customer
            </h3>
            <div className="text-sm space-y-1.5">
              <p className="font-medium">{order.user?.name ?? 'Guest'}</p>
              <p className="text-muted-foreground">{order.user?.email}</p>
              {order.user?.phone && <p className="text-muted-foreground">{order.user.phone}</p>}
            </div>
          </div>

          {/* Shipping */}
          {order.shippingAddress && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                <MapPin className="size-4" /> Shipping Address
              </h3>
              <div className="text-sm text-muted-foreground space-y-0.5">
                <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.area}</p>
                <p>{order.shippingAddress.phone}</p>
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="size-4" /> Payment
            </h3>
            <div className="text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span>{order.paymentMethod.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={order.paymentStatus === 'PAID' ? 'text-green-600 font-medium' : 'text-amber-600'}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
