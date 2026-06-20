'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { formatDateRelative, cn } from '@/backend/utils'
import toast from '@/frontend/lib/toast'
import { useClientSession } from '@/frontend/hooks/useClientSession'

interface Review {
  id: string; rating: number; title?: string | null; body: string; images: string[];
  isVerifiedBuy: boolean; helpfulCount: number; createdAt: string | Date;
  user: { name?: string | null; image?: string | null }
}

interface ReviewAccess {
  canReview: boolean
  hasDeliveredPurchase: boolean
  existingReviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null
}

interface ReviewDistribution {
  star: number
  count: number
}

interface Props {
  product: { id: string; name: string; rating: number; reviewCount: number }
  reviews: Review[]
  distribution: ReviewDistribution[]
  reviewAccess: ReviewAccess
}

const RATING_LABELS = ['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent']

function StarBar({ count, total, star }: { count: number; total: number; star: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-4 text-right text-muted-foreground">{star}</span>
      <LocalIcon name="star-filled" className="h-3.5 w-3.5 star-filled flex-shrink-0" />
      <progress
        className="progress-track progress-amber flex-1"
        value={pct}
        max={100}
        aria-label={`${star} star reviews`}
      />
      <span className="w-8 text-muted-foreground">{count}</span>
    </div>
  )
}

export function ReviewSection({ product, reviews, distribution, reviewAccess }: Props) {
  const router = useRouter()
  const { data: session } = useClientSession()
  const [currentReviewAccess, setCurrentReviewAccess] = useState(reviewAccess)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ rating: 0, title: '', body: '', hoverRating: 0 })
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest')
  const canWriteReview = Boolean(session && currentReviewAccess.canReview)
  const visibleReviewLabel = product.reviewCount > reviews.length
    ? `Showing ${reviews.length} of ${product.reviewCount} reviews`
    : `${product.reviewCount} reviews`

  useEffect(() => {
    if (!session?.user) {
      setCurrentReviewAccess(reviewAccess)
      return
    }

    const controller = new AbortController()

    fetch(`/api/reviews/access?productId=${encodeURIComponent(product.id)}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!payload) return
        setCurrentReviewAccess({
          canReview: Boolean(payload.canReview),
          hasDeliveredPurchase: Boolean(payload.hasDeliveredPurchase),
          existingReviewStatus: payload.existingReviewStatus ?? null,
        })
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setCurrentReviewAccess(reviewAccess)
        }
      })

    return () => controller.abort()
  }, [product.id, reviewAccess, session?.user])

  useEffect(() => {
    if (!canWriteReview || typeof window === 'undefined') return
    if (window.location.hash === '#write-review') setShowForm(true)
  }, [canWriteReview])

  const sorted = [...reviews].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sortBy === 'highest') return b.rating - a.rating
    if (sortBy === 'lowest') return a.rating - b.rating
    return b.helpfulCount - a.helpfulCount
  })

  const reviewStatusLabel = currentReviewAccess.existingReviewStatus === 'APPROVED'
    ? 'Your review is live'
    : currentReviewAccess.existingReviewStatus === 'PENDING'
      ? 'Review pending'
      : currentReviewAccess.existingReviewStatus === 'REJECTED'
        ? 'Review unavailable'
        : !currentReviewAccess.hasDeliveredPurchase && session
          ? 'Review unlocks after delivery'
          : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) { toast.error('Please sign in to leave a review'); return }
    if (!canWriteReview) {
      toast.error(currentReviewAccess.hasDeliveredPurchase ? 'You already reviewed this product' : 'Review unlocks after delivery')
      return
    }
    if (form.rating === 0) { toast.error('Please select a rating'); return }
    if (form.body.length < 20) { toast.error('Review must be at least 20 characters'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, ...form }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) throw new Error(payload?.error || 'Failed to submit review')
      toast.success('Your review is live.')
      setShowForm(false)
      setForm({ rating: 0, title: '', body: '', hoverRating: 0 })
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="reviews" className="mt-12">
      <div className="border border-border rounded-2xl overflow-hidden">
        <div className="bg-secondary px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-semibold text-lg">
            Customer Reviews
            <span className="text-muted-foreground font-normal text-base ml-2">({product.reviewCount})</span>
          </h3>
          <div className="flex items-center gap-3">
            {reviewStatusLabel && (
              <span className="text-xs font-medium text-muted-foreground">{reviewStatusLabel}</span>
            )}
            {canWriteReview && !showForm && (
              <button type="button" onClick={() => setShowForm(true)} className="btn-primary py-2 text-sm">
                Leave a Review
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Rating Summary */}
          <div className="flex flex-col sm:flex-row gap-8 mb-8 pb-8 border-b border-border">
            <div className="flex flex-col items-center justify-center sm:w-40">
              <span className="font-display text-6xl font-bold">{product.rating.toFixed(1)}</span>
              <div className="flex gap-0.5 my-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <LocalIcon
                    key={s}
                    name={s <= Math.round(product.rating) ? 'star-filled' : 'star'}
                    className={cn('h-5 w-5', s <= Math.round(product.rating) ? 'star-filled' : 'star-empty')}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.reviewCount} reviews</span>
            </div>
            <div className="flex-1 space-y-2">
              {distribution.map(({ star, count }) => (
                <StarBar key={star} count={count} total={product.reviewCount} star={star} />
              ))}
            </div>
          </div>

          {/* Write Review Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-secondary rounded-2xl p-5 mb-8">
              <h4 className="font-semibold mb-4">Your Review</h4>

              {/* Star Picker */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1" role="radiogroup" aria-label="Product rating">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <label
                      key={s}
                      className="cursor-pointer"
                      onMouseEnter={() => setForm((f) => ({ ...f, hoverRating: s }))}
                      onMouseLeave={() => setForm((f) => ({ ...f, hoverRating: 0 }))}
                    >
                      <input
                        type="radio"
                        name="review-rating"
                        value={s}
                        checked={form.rating === s}
                        onChange={() => setForm((f) => ({ ...f, rating: s }))}
                        className="sr-only"
                      />
                      <span className="sr-only">Rate {s} {s === 1 ? 'star' : 'stars'}</span>
                      <LocalIcon
                        name={s <= (form.hoverRating || form.rating) ? 'star-filled' : 'star'}
                        className={cn('h-8 w-8 transition-colors', s <= (form.hoverRating || form.rating) ? 'star-filled' : 'text-muted')}
                      />
                    </label>
                  ))}
                </div>
                {(form.hoverRating || form.rating) > 0 && (
                  <span className="text-sm font-medium">{RATING_LABELS[form.hoverRating || form.rating]}</span>
                )}
              </div>

              <input aria-label="Review title (optional)" title="Review title (optional)"
                placeholder="Review title (optional)"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="input-base mb-3"
              />
              <textarea aria-label="Share your experience with this product..." title="Share your experience with this product..."
                placeholder="Share your experience with this product..."
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                rows={4}
                className="input-base mb-4 resize-none"
              />

              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
              </div>
            </form>
          )}

          {/* Sort */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-medium">{visibleReviewLabel}</p>
            <select aria-label="Select option" title="Select option"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'highest' | 'lowest' | 'helpful')}
              className="text-sm border border-input rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>

          {/* Reviews List */}
          {sorted.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <LocalIcon name="star" className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No customer reviews yet.</p>
              {canWriteReview && !showForm && (
                <button type="button" onClick={() => setShowForm(true)} className="mt-3 btn-primary">Leave a Review</button>
              )}
              {!canWriteReview && reviewStatusLabel && <p className="mt-3 text-sm">{reviewStatusLabel}</p>}
            </div>
          ) : (
            <div className="space-y-6">
              {sorted.map((review) => (
                <div key={review.id} className="border-b border-border last:border-0 pb-6 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {review.user.image ? (
                        <Image src={review.user.image} alt="" width={36} height={36} className="rounded-full" />
                      ) : (
                        <span className="text-primary text-sm font-semibold">
                          {review.user.name?.[0]?.toUpperCase() ?? 'U'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm">{review.user.name ?? 'Customer'}</span>
                        {review.isVerifiedBuy && (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <LocalIcon name="check-circle" className="h-3 w-3" /> Verified Purchase
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDateRelative(review.createdAt)}
                        </span>
                      </div>

                      <div className="flex gap-0.5 mt-1 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <LocalIcon
                            key={s}
                            name={s <= review.rating ? 'star-filled' : 'star'}
                            className={cn('h-3.5 w-3.5', s <= review.rating ? 'star-filled' : 'star-empty')}
                          />
                        ))}
                      </div>

                      {review.title && <p className="font-semibold text-sm mb-1">{review.title}</p>}
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>

                      {review.images.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {review.images.map((img, i) => (
                            <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden">
                              <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                            </div>
                          ))}
                        </div>
                      )}

                      {review.helpfulCount > 0 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {review.helpfulCount} {review.helpfulCount === 1 ? 'shopper found' : 'shoppers found'} this helpful
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
