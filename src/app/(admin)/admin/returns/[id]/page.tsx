import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { formatDate, formatPrice } from '@/backend/utils'
import { ReturnRequestManager } from '@/frontend/components/admin/ReturnRequestManager'

export const metadata = { title: 'Admin Return Details' }

export default async function AdminReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const request = await db.returnRequest.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          items: {
            select: {
              id: true,
              productName: true,
              quantity: true,
              total: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  })

  if (!request) notFound()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Return {request.order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Requested {formatDate(request.createdAt)} by {request.order.user?.name || request.order.user?.email}
          </p>
        </div>
        <Link href="/admin/returns" className="btn-outline">
          Back to Returns
        </Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section className="rounded-md border border-border bg-card p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Reason</p>
                <p className="mt-2 font-medium">{request.reason}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Status</p>
                <p className="mt-2 font-medium">{request.status.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Refund amount</p>
                <p className="mt-2 font-medium">
                  {request.refundAmount !== null ? formatPrice(request.refundAmount) : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Resolved</p>
                <p className="mt-2 font-medium">{request.resolvedAt ? formatDate(request.resolvedAt) : 'Not yet'}</p>
              </div>
            </div>

            {request.description && (
              <div className="mt-5 rounded-md border border-border bg-secondary/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Customer description</p>
                <p className="mt-2 text-sm">{request.description}</p>
              </div>
            )}

            {request.images.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Uploaded evidence</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {request.images.map((image, index) => (
                    <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden rounded-md border border-border bg-secondary">
                      <Image src={image} alt={`Return evidence ${index + 1}`} fill className="object-cover" sizes="220px" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-md border border-border bg-card">
            <div className="border-b border-border px-5 py-4 font-semibold">Order Items</div>
            <div className="divide-y divide-border">
              {request.order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-md bg-secondary">
                    {item.imageUrl && (
                      <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" sizes="64px" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(item.total)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-md border border-border bg-card p-5">
            <h3 className="font-display font-semibold">Customer</h3>
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-medium">{request.order.user?.name || 'Guest'}</p>
              <p className="text-muted-foreground">{request.order.user?.email}</p>
              {request.order.user?.phone && <p className="text-muted-foreground">{request.order.user.phone}</p>}
            </div>
          </section>

          <section className="rounded-md border border-border bg-card p-5">
            <h3 className="font-display font-semibold">Order Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order status</span>
                <span>{request.order.status.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span>{request.order.paymentStatus.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order total</span>
                <span>{formatPrice(request.order.total)}</span>
              </div>
              <Link href={`/admin/orders/${request.order.id}`} className="inline-flex text-primary md:hover:underline">
                Open order details
              </Link>
            </div>
          </section>

          <ReturnRequestManager
            requestId={request.id}
            currentStatus={request.status}
            refundAmount={request.refundAmount}
            notes={request.notes}
          />
        </div>
      </div>
    </div>
  )
}
