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
  const [banner, destinations] = await Promise.all([
    db.banner.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        tabletImageUrl: true,
        mobileImageUrl: true,
        linkUrl: true,
        buttonLabel: true,
        buttonStyle: true,
        textPosition: true,
        textTone: true,
        overlayStrength: true,
        textShadow: true,
        position: true,
        sortOrder: true,
        isActive: true,
        startsAt: true,
        endsAt: true,
      },
    }),
    db.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        parent: { select: { name: true } },
      },
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    }),
  ])

  if (!banner) notFound()

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{banner.title || 'Untitled banner'}</h1>
          <p className="admin-page-description">
            Edit responsive artwork, content emphasis, call to action, and publishing rules.
          </p>
        </div>
        <Link href="/admin/banners" className="btn-outline">
          Back to banners
        </Link>
      </div>

      <BannerEditorForm banner={banner} destinations={destinations} />
    </div>
  )
}
