import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { BannerEditorForm } from '@/frontend/components/admin/BannerEditorForm'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata = { title: 'Admin Edit Banner' }

export default async function AdminBannerDetailPage({ params }: Props) {
  const { id } = await params
  const banner = await db.banner.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      subtitle: true,
      imageUrl: true,
      mobileImageUrl: true,
      linkUrl: true,
      position: true,
      sortOrder: true,
      isActive: true,
      startsAt: true,
      endsAt: true,
    },
  })

  if (!banner) notFound()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{banner.title || 'Untitled banner'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update banner artwork, placement, schedule, and links.
          </p>
        </div>
        <Link href="/admin/banners" className="btn-outline">
          Back to Banners
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <BannerEditorForm banner={banner} />
      </div>
    </div>
  )
}
