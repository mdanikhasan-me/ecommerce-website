import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BadgeCheck, FileBadge2, Landmark, Store, User, Wallet } from 'lucide-react'
import { db } from '@/backend/database'
import { formatDate, formatPrice } from '@/backend/utils'
import { SellerApprovalActions } from '@/frontend/components/admin/SellerApprovalActions'

export const metadata = { title: 'Admin Seller Review' }

export default async function AdminSellerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const seller = await db.seller.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true, createdAt: true } },
      _count: { select: { products: true } },
    },
  })

  if (!seller) notFound()

  const stats = await db.orderItem.aggregate({
    where: { product: { sellerId: seller.id }, order: { status: { not: 'CANCELLED' } } },
    _sum: { total: true },
    _count: true,
  })

  return (
    <div className="space-y-6">
      <Link href="/admin/sellers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to sellers
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            {seller.storeLogo ? (
              <div className="relative size-full overflow-hidden rounded-2xl">
                <Image src={seller.storeLogo} alt={seller.storeName} fill className="object-cover" sizes="56px" />
              </div>
            ) : (
              <Store className="size-6 text-primary" />
            )}
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">{seller.storeName}</h1>
            <p className="text-sm text-muted-foreground">Applied {formatDate(seller.createdAt)}</p>
          </div>
        </div>
        <SellerApprovalActions sellerId={seller.id} currentStatus={seller.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Owner */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
              <User className="size-4" /> Owner Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-0.5">Name</p>
                <p className="font-medium">{seller.user.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Email</p>
                <p className="font-medium">{seller.user.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Phone</p>
                <p className="font-medium">{seller.user.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Member Since</p>
                <p className="font-medium">{formatDate(seller.user.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Store details */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Store className="size-4" /> Store Details
            </h2>
            <div className="text-sm space-y-3">
              {seller.description && (
                <div>
                  <p className="text-muted-foreground mb-0.5">Description</p>
                  <p>{seller.description}</p>
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground mb-0.5">Store Slug</p>
                  <p className="font-mono text-xs">/store/{seller.storeSlug}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Business Type</p>
                  <p>{seller.businessType || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Trade License</p>
                  <p>{seller.tradeLicense || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">National ID</p>
                  <p>{seller.nidNumber || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
              <FileBadge2 className="size-4" /> Business and Banking
            </h2>
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-secondary/40 p-4">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Landmark className="size-4" />
                  Bank
                </div>
                <p className="font-medium">{seller.bankName || 'Not provided'}</p>
                <p className="mt-1 text-muted-foreground">{seller.bankAccount || 'No account number added'}</p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/40 p-4">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Wallet className="size-4" />
                  bKash
                </div>
                <p className="font-medium">{seller.bkashNumber || 'Not provided'}</p>
                <p className="mt-1 text-muted-foreground">Direct payout reference</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar stats */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-semibold mb-3">Performance</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Products</span>
                <span className="font-medium">{seller._count.products}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Sales</span>
                <span className="font-medium">{stats._count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium">{formatPrice(stats._sum.total ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rating</span>
                <span className="font-medium">{seller.rating > 0 ? seller.rating.toFixed(1) : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commission Rate</span>
                <span className="font-medium">{seller.commissionRate}%</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-semibold mb-3">Status</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current</span>
                <span className={`font-medium ${
                  seller.status === 'APPROVED' ? 'text-green-600' :
                  seller.status === 'PENDING' ? 'text-amber-600' : 'text-red-600'
                }`}>{seller.status}</span>
              </div>
              {seller.verifiedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verified</span>
                  <span>{formatDate(seller.verifiedAt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">First party</span>
                <span>{seller.isFirstParty ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Store reviews</span>
                <span>{seller.reviewCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recorded orders</span>
                <span>{seller.totalOrders}</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
              <BadgeCheck className="size-4" /> Store Routing
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Live storefront path</p>
              <Link href={`/store/${seller.storeSlug}`} target="_blank" className="font-medium text-primary hover:underline">
                /store/{seller.storeSlug}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
