import { db } from '@/backend/database'
import { formatDate } from '@/backend/utils'
import { Store, Eye, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Admin Seller Management' }

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pending', color: 'bg-amber-50 text-amber-700', icon: Clock },
  APPROVED: { label: 'Approved', color: 'bg-green-50 text-green-700', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'bg-red-50 text-red-700', icon: XCircle },
  SUSPENDED: { label: 'Suspended', color: 'bg-warning/10 text-warning', icon: AlertTriangle },
}

interface Props { searchParams: { status?: string } }

export default async function AdminSellersPage({ searchParams }: Props) {
  const where: any = {}
  if (searchParams.status) where.status = searchParams.status

  const [sellers, counts] = await Promise.all([
    db.seller.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { products: true } },
      },
    }),
    Promise.all([
      db.seller.count({ where: { status: 'PENDING' } }),
      db.seller.count({ where: { status: 'APPROVED' } }),
      db.seller.count({ where: { status: 'REJECTED' } }),
      db.seller.count({ where: { status: 'SUSPENDED' } }),
    ]),
  ])

  const [pendingCount, approvedCount, rejectedCount, suspendedCount] = counts

  const tabs = [
    { status: '', label: 'All', count: pendingCount + approvedCount + rejectedCount + suspendedCount },
    { status: 'PENDING', label: 'Pending', count: pendingCount },
    { status: 'APPROVED', label: 'Approved', count: approvedCount },
    { status: 'REJECTED', label: 'Rejected', count: rejectedCount },
    { status: 'SUSPENDED', label: 'Suspended', count: suspendedCount },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold flex items-center gap-2">
            <Store className="size-5" /> Seller Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{pendingCount} awaiting review</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <Link
            key={tab.status}
            href={tab.status ? `/admin/sellers?status=${tab.status}` : '/admin/sellers'}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              (searchParams.status ?? '') === tab.status
                ? 'bg-primary text-white'
                : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
            }`}
          >
            {tab.label} ({tab.count})
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Seller</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Store Name</th>
                <th className="text-center font-medium text-muted-foreground px-4 py-3">Products</th>
                <th className="text-center font-medium text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Applied</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => {
                const conf = STATUS_CONFIG[seller.status] ?? STATUS_CONFIG.PENDING
                const StatusIcon = conf.icon
                return (
                  <tr key={seller.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{seller.user.name}</p>
                      <p className="text-xs text-muted-foreground">{seller.user.email}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">{seller.storeName}</td>
                    <td className="px-4 py-3 text-center">{seller._count.products}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${conf.color}`}>
                        <StatusIcon className="size-3" /> {conf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(seller.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/sellers/${seller.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <Eye className="size-3" /> Review
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {sellers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No sellers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
