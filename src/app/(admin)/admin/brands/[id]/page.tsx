import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { BrandEditorForm } from '@/frontend/components/admin/BrandEditorForm'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata = { title: 'Admin Edit Brand' }

export default async function AdminBrandDetailPage({ params }: Props) {
  const { id } = await params
  const brand = await db.brand.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      banner: true,
      description: true,
      website: true,
      isActive: true,
      isFeatured: true,
      sortOrder: true,
    },
  })

  if (!brand) notFound()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{brand.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update brand identity, storefront visibility, and media assets.
          </p>
        </div>
        <Link href="/admin/brands" className="btn-outline">
          Back to Brands
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <BrandEditorForm brand={brand} />
      </div>
    </div>
  )
}
