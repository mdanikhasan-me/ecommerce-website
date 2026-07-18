import { getActiveUserSession } from '@/backend/auth/active-user'
import {
  buildInvoiceDownloadFilename,
  formatOrderInvoiceEnumLabel,
  getInvoicePdfDownloadPath,
  getOwnedOrderInvoiceContext,
} from '@/backend/orders/order-invoice'
import { formatDate, formatPrice } from '@/backend/utils'
import { PrintInvoiceButton } from '@/frontend/components/account/PrintInvoiceButton'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Boilabin Order Invoice' }

export default async function OrderInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getActiveUserSession()
  if (!session?.user) redirect('/auth/login')
  const userId = session.user.id
  if (!userId) redirect('/auth/login')
  const { id } = await params

  const invoice = await getOwnedOrderInvoiceContext({
    orderId: id,
    userId,
    sessionUserName: session.user.name,
    sessionUserEmail: session.user.email,
  })

  if (!invoice) notFound()

  const { order, customerName, customerEmail, supportEmail, supportPhone } = invoice
  const invoicePdfPath = getInvoicePdfDownloadPath(order.id)
  const invoicePdfFilename = buildInvoiceDownloadFilename(order.orderNumber)

  return (
    <main className="container-site py-6 lg:py-10 print:bg-white print:py-0">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href={`/account/orders/${order.id}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors min-[1025px]:hover:text-foreground"
          >
            <LocalIcon name="arrow-left" className="h-4 w-4" />
            Back to order details
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={invoicePdfPath}
              download={invoicePdfFilename}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors min-[1025px]:hover:bg-primary/90"
            >
              <LocalIcon name="download" className="h-4 w-4" />
              Download PDF
            </a>
            <PrintInvoiceButton />
          </div>
        </div>

        <article className="rounded-2xl border border-border bg-card p-5 shadow-[0_16px_42px_rgba(23,18,15,0.045)] sm:p-8 print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none">
          <header className="flex flex-col gap-6 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-display text-3xl font-bold tracking-[-0.04em]">Boilabin</p>
              <p className="mt-2 text-sm text-muted-foreground">Order Invoice</p>
              <div className="mt-5 space-y-1 text-sm text-muted-foreground">
                <p>{supportEmail}</p>
                <p>{supportPhone}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-secondary/40 p-4 sm:min-w-[18rem] print:bg-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Invoice / Order</p>
              <p className="mt-1 font-mono text-lg font-bold">{order.orderNumber}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Placed on</dt>
                  <dd className="font-medium">{formatDate(order.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Order status</dt>
                  <dd className="font-medium">{formatOrderInvoiceEnumLabel(order.status)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Payment</dt>
                  <dd className="font-medium">{formatOrderInvoiceEnumLabel(order.paymentStatus)}</dd>
                </div>
              </dl>
            </div>
          </header>

          <section className="grid gap-6 border-b border-border py-6 sm:grid-cols-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Billed to</h2>
              <div className="mt-3 space-y-1 text-sm">
                <p className="font-semibold">{customerName}</p>
                {customerEmail ? <p className="text-muted-foreground">{customerEmail}</p> : null}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Delivery address</h2>
              {order.address ? (
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">{order.address.fullName}</p>
                  <p>{order.address.addressLine1}</p>
                  {order.address.addressLine2 ? <p>{order.address.addressLine2}</p> : null}
                  <p>{order.address.city}, {order.address.district}</p>
                  <p>{order.address.phone}</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No saved delivery address is attached to this order.</p>
              )}
            </div>
          </section>

          <section className="py-6">
            <div className="overflow-hidden rounded-xl border border-border print:rounded-none">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-secondary/55 text-[11px] uppercase tracking-[0.12em] text-muted-foreground print:bg-white">
                  <tr>
                    <th className="px-4 py-3 font-bold">Item</th>
                    <th className="hidden px-4 py-3 text-right font-bold sm:table-cell">Unit price</th>
                    <th className="px-4 py-3 text-right font-bold">Qty</th>
                    <th className="px-4 py-3 text-right font-bold">Line total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4 align-top">
                        <p className="font-semibold">{item.productName}</p>
                        <p className="mt-1 text-xs text-muted-foreground">SKU: {item.productSku}</p>
                        {item.variantName ? <p className="mt-1 text-xs text-muted-foreground">{item.variantName}</p> : null}
                        <p className="mt-1 text-xs text-muted-foreground sm:hidden">Unit: {formatPrice(item.price)}</p>
                      </td>
                      <td className="hidden px-4 py-4 text-right align-top sm:table-cell">{formatPrice(item.price)}</td>
                      <td className="px-4 py-4 text-right align-top">{item.quantity}</td>
                      <td className="px-4 py-4 text-right align-top font-semibold">{formatPrice(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-6 border-t border-border pt-6 sm:grid-cols-[minmax(0,1fr)_minmax(16rem,0.55fr)]">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-semibold text-foreground">Payment method:</span> {formatOrderInvoiceEnumLabel(order.paymentMethod)}</p>
              {order.coupon ? (
                <p><span className="font-semibold text-foreground">Coupon:</span> {order.coupon.code}</p>
              ) : null}
              <p>This invoice uses actual order details from your Boilabin account.</p>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{formatPrice(order.shippingFee)}</dd>
              </div>
              {order.discount > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Discount</dt>
                  <dd>-{formatPrice(order.discount)}</dd>
                </div>
              ) : null}
              {order.tax > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Tax</dt>
                  <dd>{formatPrice(order.tax)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4 border-t border-border pt-3 font-display text-xl font-bold tracking-[-0.03em]">
                <dt>Total</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <footer className="mt-8 flex items-center gap-2 border-t border-border pt-5 text-xs text-muted-foreground">
            <LocalIcon name="printer" className="h-4 w-4" />
            <p>Download the PDF for a saved copy, or print this secure invoice from your browser.</p>
          </footer>
        </article>
      </div>
    </main>
  )
}
