import Link from 'next/link'
import { db } from '@/backend/database'
import { formatDate, formatPrice } from '@/backend/utils'

export const metadata = { title: 'Returns | Admin' }

export default async function AdminReturnsPage() {
  const returnOrders = await db.order.findMany({
    where: { status: { in: ['RETURNED', 'REFUNDED'] } },
    orderBy: { updatedAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
    },
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold">Returns</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Returned and refunded orders are shown here.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Order</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Customer</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Total</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {returnOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  No returned or refunded orders yet.
                </td>
              </tr>
            ) : (
              returnOrders.map((order) => (
                <tr key={order.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono text-primary hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.user?.name ?? order.guestEmail ?? 'Guest'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {formatDate(order.updatedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
