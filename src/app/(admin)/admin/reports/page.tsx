import Link from 'next/link'
import { TrendingUp, ShoppingBag, Users, Package } from 'lucide-react'
import { AdminReportExportLink } from '@/frontend/components/admin/AdminReportExportLink'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import {
  ADMIN_REPORT_EXPORT_METADATA,
  canExportAdminReport,
  getAdminReportData,
  parseAdminReportRange,
} from '@/backend/admin/reports'
import { formatPrice, formatDate } from '@/backend/utils'

export const metadata = { title: 'Admin Analytics' }

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

interface Props {
  searchParams: Promise<{ from?: string; to?: string; tab?: string }>
}

export default async function AdminReportsPage({ searchParams }: Props) {
  const session = await requireAdminSession()
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
  const exportLinks = [
    {
      type: 'orders',
      label: 'Export Orders CSV',
      href: `/api/admin/reports/export?type=orders&${exportQuery}`,
      metadata: ADMIN_REPORT_EXPORT_METADATA.orders,
    },
    {
      type: 'products',
      label: 'Export Products CSV',
      href: `/api/admin/reports/export?type=products&${exportQuery}`,
      metadata: ADMIN_REPORT_EXPORT_METADATA.products,
    },
    {
      type: 'customers',
      label: 'Export Customers CSV',
      href: `/api/admin/reports/export?type=customers&${exportQuery}`,
      metadata: ADMIN_REPORT_EXPORT_METADATA.customers,
    },
  ] as const

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Analytics and Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Filter a date range, inspect the core report sets, and export clean CSV files.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Handle downloaded CSVs as sensitive files; follow the internal Admin Export CSV
            Handling Guide before sharing or storing exports.
          </p>
        </div>
        <form className="admin-card grid w-full grid-cols-2 gap-2 p-3 sm:w-auto sm:grid-cols-[auto_auto_auto]">
          <input aria-label="Start date" title="Start date" type="date" name="from" defaultValue={toDateInputValue(range.from)} className="input-base min-w-0" />
          <input aria-label="End date" title="End date" type="date" name="to" defaultValue={toDateInputValue(range.to)} className="input-base min-w-0" />
          <input aria-label="Form input" title="Form input" type="hidden" name="tab" value={activeTab} />
          <button type="submit" className="btn-primary col-span-2 px-4 sm:col-span-1">
            Apply
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="admin-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Revenue
          </div>
          <p className="mt-3 admin-page-title">{formatPrice(report.summary.revenue)}</p>
        </div>
        <div className="admin-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShoppingBag className="h-4 w-4" />
            Orders
          </div>
          <p className="mt-3 admin-page-title">{report.summary.orders}</p>
        </div>
        <div className="admin-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            Average Order
          </div>
          <p className="mt-3 admin-page-title">
            {formatPrice(report.summary.averageOrderValue)}
          </p>
        </div>
        <div className="admin-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            New Customers
          </div>
          <p className="mt-3 admin-page-title">{report.summary.newCustomers}</p>
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
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-3">
          {exportLinks.map((item) => (
            <div key={item.type}>
              {canExportAdminReport(item.type, session.user.role) ? (
                <AdminReportExportLink
                  href={item.href}
                  label={item.label}
                  reportSensitivityLabel={item.metadata.reportSensitivityLabel}
                  warningLabel={item.metadata.warningLabel}
                />
              ) : (
                <span
                  className="inline-flex rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-muted-foreground"
                  title={item.metadata.permissionLabel}
                >
                  Super admin only
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="admin-card overflow-hidden">
          <div className="border-b border-border px-5 py-4 font-semibold">Recent Orders in Range</div>
          <table className="admin-responsive-table w-full text-sm">
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
                  <td data-mobile data-primary className="px-4 py-3 font-mono text-primary">
                    <Link href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link>
                  </td>
                  <td data-mobile data-full data-label="Customer" className="px-4 py-3 text-muted-foreground">{order.user?.name || order.user?.email}</td>
                  <td data-mobile data-label="Status" className="px-4 py-3 text-center">{order.status.replace(/_/g, ' ')}</td>
                  <td data-mobile data-label="Total" className="px-4 py-3 text-right font-medium">{formatPrice(order.total)}</td>
                  <td data-mobile data-full data-label="Date" className="px-4 py-3 text-right text-muted-foreground">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="admin-card p-5">
          <h2 className="font-display text-lg font-semibold">Revenue Snapshot</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-secondary/45 p-4">
              <p className="text-sm text-muted-foreground">Gross revenue</p>
              <p className="mt-2 text-xl font-bold">{formatPrice(report.summary.revenue)}</p>
            </div>
            <div className="rounded-lg bg-secondary/45 p-4">
              <p className="text-sm text-muted-foreground">Average order value</p>
              <p className="mt-2 text-xl font-bold">{formatPrice(report.summary.averageOrderValue)}</p>
            </div>
            <div className="rounded-lg bg-secondary/45 p-4">
              <p className="text-sm text-muted-foreground">Paid orders</p>
              <p className="mt-2 text-xl font-bold">{report.summary.orders}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="admin-card overflow-hidden">
          <div className="border-b border-border px-5 py-4 font-semibold">Top Products</div>
          <table className="admin-responsive-table w-full text-sm">
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
                  <td data-mobile data-primary className="px-4 py-3 font-medium">{product.productName}</td>
                  <td data-mobile data-full data-label="SKU" className="px-4 py-3 font-mono text-xs text-muted-foreground">{product.productSku}</td>
                  <td data-mobile data-label="Units" className="px-4 py-3 text-right">{product.quantitySold}</td>
                  <td data-mobile data-label="Revenue" className="px-4 py-3 text-right font-medium">{formatPrice(product.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="admin-card overflow-hidden">
          <div className="border-b border-border px-5 py-4 font-semibold">Top Customers</div>
          <table className="admin-responsive-table w-full text-sm">
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
                  <td data-mobile data-primary className="px-4 py-3">
                    <div>
                      <p className="font-medium">{row.customer?.name || row.customer?.email || 'Unknown user'}</p>
                      <p className="text-xs text-muted-foreground">{row.customer?.email || row.userId}</p>
                    </div>
                  </td>
                  <td data-mobile data-label="Role" className="px-4 py-3 text-muted-foreground">{row.customer?.role || 'Unknown'}</td>
                  <td data-mobile data-label="Orders" className="px-4 py-3 text-right">{row.orders}</td>
                  <td data-mobile data-full data-label="Revenue" className="px-4 py-3 text-right font-medium">{formatPrice(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
