import { notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { formatDate, formatPrice } from '@/backend/utils'
import { ArrowLeft, Store, User, FileText, MapPin, Phone, Mail, Globe } from 'lucide-react'
import Link from 'next/link'
import { SellerApprovalActions } from '@/frontend/components/admin/SellerApprovalActions'

export const metadata = { title: 'Admin Seller Review' }

export default async function AdminSellerDetailPage({ params }: { params: { id: string } }) {
  const seller = await db.seller.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true, phone: true, createdAt: true } },
      documents: true,
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
            {seller.logo ? (
              <img src={seller.logo} alt="" className="size-full rounded-2xl object-cover" />
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
                <p className="font-medium">{seller.phone || seller.user.phone || 'Not provided'}</p>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground mb-0.5">Store Slug</p>
                  <p className="font-mono text-xs">/store/{seller.slug}</p>
                </div>
                {seller.address && (
                  <div>
                    <p className="text-muted-foreground mb-0.5">Address</p>
                    <p>{seller.address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
              <FileText className="size-4" /> Submitted Documents
            </h2>
            {seller.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents submitted</p>
            ) : (
              <div className="space-y-2">
                {seller.documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.type}</p>
                        <p className="text-xs text-muted-foreground">Uploaded {formatDate(doc.createdAt)}</p>
                      </div>
                    </div>
                    {doc.url && (
                      <a href={doc.url} target="_blank" rel="noopener" className="text-xs text-primary hover:underline">
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
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
                <span className="font-medium">{stats._count}</span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
