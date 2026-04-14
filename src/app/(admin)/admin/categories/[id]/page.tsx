import { notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { AdminPlaceholderPanel } from '@/frontend/components/admin/AdminPlaceholderPanel'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata = { title: 'Edit Category | Admin' }

export default async function AdminCategoryDetailPage({ params }: Props) {
  const { id } = await params
  const category = await db.category.findUnique({
    where: { id },
    include: {
      parent: { select: { name: true } },
      children: { select: { id: true } },
      _count: { select: { products: true } },
    },
  })

  if (!category) notFound()

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h1 className="font-display text-xl font-bold">{category.name}</h1>
        <div className="mt-3 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <p>Slug: <span className="font-medium text-foreground">{category.slug}</span></p>
          <p>Parent: <span className="font-medium text-foreground">{category.parent?.name ?? 'Top level'}</span></p>
          <p>Products: <span className="font-medium text-foreground">{category._count.products}</span></p>
          <p>Subcategories: <span className="font-medium text-foreground">{category.children.length}</span></p>
        </div>
      </div>

      <AdminPlaceholderPanel
        title="Category Editor"
        description="This category route is now working, but the edit form has not been built yet."
        backHref="/admin/categories"
        backLabel="Back to Categories"
      />
    </div>
  )
}
