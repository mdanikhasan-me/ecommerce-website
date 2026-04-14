import { db } from '@/backend/database'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/backend/utils'
import { ShoppingBag } from 'lucide-react'

interface Props {
  searchParams: { page?: string; status?: string; q?: string }
}

export const metadata = { title: 'Orders | Admin' }

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  PACKED: 'bg-indigo-50 text-indigo-700',
  SHIPPED: 'bg-purple-50 text-purple-700',
  DELIVERED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
  RETURNED: 'bg-gray-50 text-gray-700',
  REFUNDED: 'bg-warning/10 text-warning',
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const limit = 20
  const skip = (page - 1) * limit

  const where: any = {}
  if (searchParams.status) where.status = searchParams.status
  if (searchParams.q) {
    where.OR = [
      { orderNumber: { contains: searchParams.q, mode: 'insensitive' } },
      { user: { email: { contains: searchParams.q, mode: 'insensitive' } } },
      { guestEmail: { contains: searchParams.q, mode: 'insensitive' } },
    ]
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { productName: true }, take: 1 },
        _count: { select: { items: true } },
      },
    }),
    db.order.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)
  const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED']

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">{total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3">
        <form className="flex flex-wrap gap-3 flex-1">
          <input name="q" defaultValue={searchParams.q} placeholder="Search by order # or email..." className="input-base max-w-xs" />
          <select name="status" defaultValue={searchParams.status} className="input-base w-44">
            <option value="">All Status</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <button type="submit" className="btn-primary px-4">Filter</button>
          <Link href="/admin/orders" className="btn-outline px-4">Clear</Link>
        </form>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Order</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Items</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Date</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    No orders found
                  </td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-xs">{order.orderNumber}</span>
                    <p className="text-xs text-muted-foreground capitalize">{order.paymentMethod.replace('_', ' ')}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="font-medium">{order.user?.name ?? 'Guest'}</p>
                    <p className="text-xs text-muted-foreground">{order.user?.email ?? order.guestEmail}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                    {order.items[0]?.productName}
                    {order._count.items > 1 && <span className="ml-1 text-primary">+{order._count.items - 1}</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-bold">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] ?? 'bg-secondary text-foreground'}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground text-xs hidden sm:table-cell">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="text-xs text-primary hover:underline font-medium">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-sm">
            <p className="text-muted-foreground">Showing {skip + 1}–{Math.min(skip + limit, total)} of {total}</p>
            <div className="flex gap-2">
              {page > 1 && <Link href={`/admin/orders?page=${page - 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`} className="btn-outline py-1.5 px-3 text-xs">Prev</Link>}
              {page < totalPages && <Link href={`/admin/orders?page=${page + 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`} className="btn-outline py-1.5 px-3 text-xs">Next</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
