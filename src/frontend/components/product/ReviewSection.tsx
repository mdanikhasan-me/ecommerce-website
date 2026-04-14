'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, ThumbsUp, Camera, CheckCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { formatDateRelative, cn } from '@/backend/utils'
import toast from 'react-hot-toast'

interface Review {
  id: string; rating: number; title?: string | null; body: string; images: string[];
  isVerifiedBuy: boolean; helpfulCount: number; createdAt: Date;
  user: { name?: string | null; image?: string | null }
}

interface Props {
  product: { id: string; name: string; rating: number; reviewCount: number }
  reviews: Review[]
}

const RATING_LABELS = ['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent']

function StarBar({ count, total, star }: { count: number; total: number; star: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-4 text-right text-muted-foreground">{star}</span>
      <Star className="h-3.5 w-3.5 star-filled flex-shrink-0" />
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-muted-foreground">{count}</span>
    </div>
  )
}

export function ReviewSection({ product, reviews }: Props) {
  const { data: session } = useSession()
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ rating: 0, title: '', body: '', hoverRating: 0 })
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest')

  // Rating distribution
  const dist = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
  }))

  const sorted = [...reviews].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sortBy === 'highest') return b.rating - a.rating
    if (sortBy === 'lowest') return a.rating - b.rating
    return b.helpfulCount - a.helpfulCount
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) { toast.error('Please sign in to leave a review'); return }
    if (form.rating === 0) { toast.error('Please select a rating'); return }
    if (form.body.length < 20) { toast.error('Review must be at least 20 characters'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, ...form }),
      })
      if (!res.ok) throw new Error()
      toast.success('Review submitted! It will appear after moderation.')
      setShowForm(false)
      setForm({ rating: 0, title: '', body: '', hoverRating: 0 })
    } catch {
      toast.error('Failed to submit review')
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
          {session && !showForm && (
            <button onClick={() => setShowForm(true)} className="btn-primary py-2 text-sm">
              Write a Review
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Rating Summary */}
          <div className="flex flex-col sm:flex-row gap-8 mb-8 pb-8 border-b border-border">
            <div className="flex flex-col items-center justify-center sm:w-40">
              <span className="font-display text-6xl font-bold">{product.rating.toFixed(1)}</span>
              <div className="flex gap-0.5 my-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={cn('h-5 w-5', s <= Math.round(product.rating) ? 'star-filled' : 'star-empty')} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.reviewCount} reviews</span>
            </div>
            <div className="flex-1 space-y-2">
              {dist.map(({ star, count }) => (
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
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s} type="button"
                      onMouseEnter={() => setForm((f) => ({ ...f, hoverRating: s }))}
                      onMouseLeave={() => setForm((f) => ({ ...f, hoverRating: 0 }))}
                      onClick={() => setForm((f) => ({ ...f, rating: s }))}
                    >
                      <Star className={cn('h-8 w-8 transition-colors', s <= (form.hoverRating || form.rating) ? 'star-filled' : 'text-muted')} />
                    </button>
                  ))}
                </div>
                {(form.hoverRating || form.rating) > 0 && (
                  <span className="text-sm font-medium">{RATING_LABELS[form.hoverRating || form.rating]}</span>
                )}
              </div>

              <input
                placeholder="Review title (optional)"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="input-base mb-3"
              />
              <textarea
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
            <p className="text-sm font-medium">{reviews.length} reviews</p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
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
              <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No reviews yet. Be the first to review!</p>
              {session && !showForm && (
                <button onClick={() => setShowForm(true)} className="mt-3 btn-primary">Write a Review</button>
              )}
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
                            <CheckCircle className="h-3 w-3" /> Verified Purchase
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDateRelative(review.createdAt)}
                        </span>
                      </div>

                      <div className="flex gap-0.5 mt-1 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={cn('h-3.5 w-3.5', s <= review.rating ? 'star-filled' : 'star-empty')} />
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

                      <button className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        Helpful ({review.helpfulCount})
                      </button>
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
