import Link from 'next/link'
import { TrendingUp, ShoppingBag, Users, Package } from 'lucide-react'
import { getAdminReportData, parseAdminReportRange } from '@/backend/admin/reports'
import { formatPrice, formatDate } from '@/backend/utils'

export const metadata = { title: 'Admin Analytics' }

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

interface Props {
  searchParams: Promise<{ from?: string; to?: string; tab?: string }>
}

export default async function AdminReportsPage({ searchParams }: Props) {
  const filters = await searchParams
  const activeTab = filters.tab || 'orders'
  const range = parseAdminReportRange(filters.from, filters.to)
  const report = await getAdminReportData(range)
  const exportQuery = `from=${toDateInputValue(range.from)}&to=${toDateInputValue(range.to)}`
  const tabs = [
    { value: 'orders', label: 'Orders' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'products', label: 'Products' },
    { value: 'customers', label: 'Customers' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold">Analytics and Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Filter a date range, inspect the core report sets, and export clean CSV files.
          </p>
        </div>
        <form className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-3">
          <input type="date" name="from" defaultValue={toDateInputValue(range.from)} className="input-base" />
          <input type="date" name="to" defaultValue={toDateInputValue(range.to)} className="input-base" />
          <input type="hidden" name="tab" value={activeTab} />
          <button type="submit" className="btn-primary px-4">
            Apply
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Revenue
          </div>
          <p className="mt-3 font-display text-2xl font-bold">{formatPrice(report.summary.revenue)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShoppingBag className="h-4 w-4" />
            Orders
          </div>
          <p className="mt-3 font-display text-2xl font-bold">{report.summary.orders}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            Average Order
          </div>
          <p className="mt-3 font-display text-2xl font-bold">
            {formatPrice(report.summary.averageOrderValue)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            New Customers
          </div>
          <p className="mt-3 font-display text-2xl font-bold">{report.summary.newCustomers}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/admin/reports?tab=${tab.value}&${exportQuery}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                activeTab === tab.value
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/api/admin/reports/export?type=orders&${exportQuery}`} className="btn-outline text-xs">
            Export Orders CSV
          </Link>
          <Link href={`/api/admin/reports/export?type=products&${exportQuery}`} className="btn-outline text-xs">
            Export Products CSV
          </Link>
          <Link href={`/api/admin/reports/export?type=customers&${exportQuery}`} className="btn-outline text-xs">
            Export Customers CSV
          </Link>
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4 font-semibold">Recent Orders in Range</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Order</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {report.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-mono text-primary">
                    <Link href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{order.user?.name || order.user?.email}</td>
                  <td className="px-4 py-3 text-center">{order.status.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Revenue Snapshot</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-secondary/40 p-4">
              <p className="text-sm text-muted-foreground">Gross revenue</p>
              <p className="mt-2 text-xl font-bold">{formatPrice(report.summary.revenue)}</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/40 p-4">
              <p className="text-sm text-muted-foreground">Average order value</p>
              <p className="mt-2 text-xl font-bold">{formatPrice(report.summary.averageOrderValue)}</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/40 p-4">
              <p className="text-sm text-muted-foreground">Paid orders</p>
              <p className="mt-2 text-xl font-bold">{report.summary.orders}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4 font-semibold">Top Products</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">SKU</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Units</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {report.topProducts.map((product) => (
                <tr key={`${product.productId}-${product.productSku}`}>
                  <td className="px-4 py-3 font-medium">{product.productName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{product.productSku}</td>
                  <td className="px-4 py-3 text-right">{product.quantitySold}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(product.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4 font-semibold">Top Customers</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Orders</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {report.topCustomers.map((row) => (
                <tr key={row.userId}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{row.customer?.name || row.customer?.email || 'Unknown user'}</p>
                      <p className="text-xs text-muted-foreground">{row.customer?.email || row.userId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.customer?.role || 'Unknown'}</td>
                  <td className="px-4 py-3 text-right">{row.orders}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
