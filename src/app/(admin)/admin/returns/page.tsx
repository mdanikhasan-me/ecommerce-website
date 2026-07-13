import Link from 'next/link'
import type { Prisma } from '@prisma/client'
import { db } from '@/backend/database'
import { formatDate, formatPrice } from '@/backend/utils'
import { parseReturnStatusFilter } from '@/backend/admin/list-filters'

export const metadata = { title: 'Admin Returns' }

export default async function AdminReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const filters = await searchParams
  const statusFilter = parseReturnStatusFilter(filters.status)
  const where: Prisma.ReturnRequestWhereInput | undefined = statusFilter ? { status: statusFilter } : undefined
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
        <h1 className="admin-page-title">Returns</h1>
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
                active ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      <div className="admin-card overflow-hidden">
        <table className="admin-responsive-table w-full text-sm">
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
                <td colSpan={7} className="admin-empty-cell px-4 py-12 text-center text-muted-foreground">
                  No return requests yet.
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id}>
                  <td data-mobile data-primary className="px-4 py-3">
                    <Link href={`/admin/orders/${request.order.id}`} className="font-mono text-primary">
                      {request.order.orderNumber}
                    </Link>
                  </td>
                  <td data-mobile data-full data-label="Customer" className="px-4 py-3 text-muted-foreground">
                    {request.order.user?.name ?? request.order.user?.email ?? 'Guest'}
                  </td>
                  <td data-mobile data-full data-label="Reason" className="px-4 py-3 text-muted-foreground">
                    {request.reason}
                  </td>
                  <td data-mobile data-label="Status" className="px-4 py-3 text-center">
                    <span className="inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
                      {request.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td data-mobile data-label="Total" className="px-4 py-3 text-right font-medium">{formatPrice(request.order.total)}</td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {formatDate(request.updatedAt)}
                  </td>
                  <td data-mobile data-action className="px-4 py-3 text-right">
                    <Link href={`/admin/returns/${request.id}`} className="admin-mobile-action text-xs font-medium text-primary sm:border-0 sm:bg-transparent sm:p-0">
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
