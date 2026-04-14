import { db } from '@/backend/database'
import Link from 'next/link'
import { Plus, Ticket, Pencil } from 'lucide-react'
import { formatDate, formatPrice } from '@/backend/utils'

export const metadata = { title: 'Admin Coupons' }

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">Coupons</h1>
        <Link href="/admin/coupons/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" /> Create Coupon
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Code</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Discount</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Min Order</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Usage</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Expires</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground">
                  <Ticket className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  No coupons created yet
                </td>
              </tr>
            ) : coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3 font-mono font-bold text-primary">{coupon.code}</td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{coupon.name}</td>
                <td className="px-4 py-3 font-medium">
                  {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatPrice(coupon.value)}
                  {coupon.maxDiscount && <span className="text-xs text-muted-foreground ml-1">(max {formatPrice(coupon.maxDiscount)})</span>}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{formatPrice(coupon.minOrderAmount)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {coupon.usageCount}{coupon.usageLimit && `/${coupon.usageLimit}`}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${coupon.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell text-xs">
                  {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'No expiry'}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/coupons/${coupon.id}`} className="p-1.5 rounded-lg hover:bg-secondary inline-flex">
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
