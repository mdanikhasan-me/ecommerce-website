import { db } from '@/backend/database'
import { formatDateRelative } from '@/backend/utils'
import { Star } from 'lucide-react'
import { ReviewModerationActions } from '@/frontend/components/admin/ReviewModerationActions'

interface Props { searchParams: { status?: string; page?: string } }
export const metadata = { title: 'Admin Reviews' }

export default async function AdminReviewsPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const limit = 20
  const skip = (page - 1) * limit
  const statusFilter = searchParams.status ?? 'PENDING'

  const [reviews, total] = await Promise.all([
    db.review.findMany({
      where: { status: statusFilter as any },
      skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    db.review.count({ where: { status: statusFilter as any } }),
  ])

  const counts = await db.review.groupBy({ by: ['status'], _count: true })
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]))

  const tabs = [
    { label: 'Pending', value: 'PENDING', count: countMap['PENDING'] ?? 0 },
    { label: 'Approved', value: 'APPROVED', count: countMap['APPROVED'] ?? 0 },
    { label: 'Rejected', value: 'REJECTED', count: countMap['REJECTED'] ?? 0 },
  ]

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-bold">Review Moderation</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <a
            key={tab.value}
            href={`/admin/reviews?status=${tab.value}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === tab.value ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 bg-primary text-white text-xs rounded-full px-1.5 py-0.5">{tab.count}</span>
            )}
          </a>
        ))}
      </div>

      {/* Reviews */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="divide-y divide-border">
          {reviews.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Star className="h-8 w-8 mx-auto mb-3 opacity-30" />
              No {statusFilter.toLowerCase()} reviews
            </div>
          ) : reviews.map((review) => (
            <div key={review.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm">{review.user.name ?? review.user.email}</span>
                    <span className="text-muted-foreground text-xs">on</span>
                    <a href={`/products/${review.product.slug}`} target="_blank" className="text-primary text-sm hover:underline truncate max-w-[200px]">
                      {review.product.name}
                    </a>
                    <span className="text-xs text-muted-foreground">{formatDateRelative(review.createdAt)}</span>
                  </div>

                  <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>

                  {review.title && <p className="text-sm font-semibold mb-1">{review.title}</p>}
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>
                </div>

                {statusFilter === 'PENDING' && (
                  <ReviewModerationActions reviewId={review.id} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
