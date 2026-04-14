import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { HomepageSectionEditorForm } from '@/frontend/components/admin/HomepageSectionEditorForm'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata = { title: 'Admin Edit Homepage Section' }

export default async function AdminContentDetailPage({ params }: Props) {
  const { id } = await params
  const section = await db.homepageSection.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
      title: true,
      subtitle: true,
      config: true,
      isActive: true,
      sortOrder: true,
    },
  })

  if (!section) notFound()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{section.title ?? section.type}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update section metadata, visibility, and JSON configuration.
          </p>
        </div>
        <Link href="/admin/content" className="btn-outline">
          Back to Content
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <HomepageSectionEditorForm section={section} />
      </div>
    </div>
  )
}
