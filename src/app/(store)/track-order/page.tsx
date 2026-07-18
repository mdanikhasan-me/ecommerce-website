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
    <div className="bg-white px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-[6.5rem] min-[1200px]:min-h-[calc(100dvh-4.75rem)]">
      <TrackOrderLookup initialError={lookupError} />
    </div>
  )
}
