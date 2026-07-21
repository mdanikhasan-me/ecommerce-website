import type { Metadata } from 'next'
import { generateNoIndexPageMetadata } from '@/backend/seo'
import { TrackOrderLookup } from '@/frontend/components/content/TrackOrderLookup'

export const metadata: Metadata = generateNoIndexPageMetadata(
  'Track Your Boilabin Order',
  'Track a Boilabin order by order number and view the latest order status from your account.',
  '/track-order',
)

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const lookupError = params.error === 'order-not-found'
    ? 'We could not find that Order ID in your account. Check the ID and try again.'
    : null

  return (
    <div className="container-site bg-white py-7 sm:py-9 lg:py-10">
      <TrackOrderLookup initialError={lookupError} />
    </div>
  )
}
