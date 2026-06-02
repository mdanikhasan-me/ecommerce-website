import type { Metadata } from 'next'
import { generateNoIndexPageMetadata } from '@/backend/seo'
import { TrackOrderLookup } from '@/frontend/components/content/TrackOrderLookup'

export const metadata: Metadata = generateNoIndexPageMetadata(
  'Track Your Boilabin Order',
  'Track a Boilabin order by order number and view the latest order status from your account.',
  '/track-order',
)

export default function TrackOrderPage() {
  return (
    <div className="container-site py-12">
      <TrackOrderLookup />
    </div>
  )
}
