import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { CategoryEditorForm } from '@/frontend/components/admin/CategoryEditorForm'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata = { title: 'Admin Edit Category' }

export default async function AdminCategoryDetailPage({ params }: Props) {
  const { id } = await params
  const [category, categories] = await Promise.all([
    db.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        icon: true,
        isActive: true,
        sortOrder: true,
        parentId: true,
      },
    }),
    db.category.findMany({
      select: {
        id: true,
        name: true,
        parentId: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    }),
  ])

  if (!category) notFound()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{category.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update category details, imagery, order, and hierarchy.
          </p>
        </div>
        <Link href="/admin/categories" className="btn-outline">
          Back to Categories
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <CategoryEditorForm categories={categories} category={category} />
      </div>
    </div>
  )
}
