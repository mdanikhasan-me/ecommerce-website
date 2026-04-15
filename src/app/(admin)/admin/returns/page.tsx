import Link from 'next/link'
import { db } from '@/backend/database'
import { formatDate, formatPrice } from '@/backend/utils'

export const metadata = { title: 'Admin Returns' }

export default async function AdminReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const filters = await searchParams
  const where = filters.status ? { status: filters.status as any } : undefined
  const requests = await db.returnRequest.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  })

  const tabs = [
    { label: 'All', value: '' },
    { label: 'Requested', value: 'REQUESTED' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Refunded', value: 'REFUNDED' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold">Returns</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review return requests, approve or reject them, and track refunds from one place.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const href = tab.value ? `/admin/returns?status=${tab.value}` : '/admin/returns'
          const active = (filters.status ?? '') === tab.value

          return (
            <Link
              key={tab.value || 'all'}
              href={href}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                active ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Request</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Customer</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Reason</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Total</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Updated</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No return requests yet.
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${request.order.id}`} className="font-mono text-primary hover:underline">
                      {request.order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {request.order.user?.name ?? request.order.user?.email ?? 'Guest'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {request.reason}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
                      {request.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(request.order.total)}</td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {formatDate(request.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/returns/${request.id}`} className="text-xs font-medium text-primary hover:underline">
                      Review
                    </Link>
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
