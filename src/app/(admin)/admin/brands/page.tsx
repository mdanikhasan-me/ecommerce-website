import { db } from '@/backend/database'
import { formatDate } from '@/backend/utils'
import { Tag, Plus, Eye, EyeOff, Pencil } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Admin Brands' }

export default async function AdminBrandsPage() {
  const brands = await db.brand.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold flex items-center gap-2">
            <Tag className="size-5" /> Brands
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{brands.length} brands</p>
        </div>
        <Link href="/admin/brands/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" /> Add Brand
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Brand</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Slug</th>
                <th className="text-center font-medium text-muted-foreground px-4 py-3">Products</th>
                <th className="text-center font-medium text-muted-foreground px-4 py-3">Featured</th>
                <th className="text-center font-medium text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Created</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-secondary overflow-hidden flex items-center justify-center">
                        {brand.logo ? (
                          <img src={brand.logo} alt="" className="size-full object-contain" />
                        ) : (
                          <Tag className="size-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <span className="font-medium">{brand.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{brand.slug}</td>
                  <td className="px-4 py-3 text-center">{brand._count.products}</td>
                  <td className="px-4 py-3 text-center">
                    {brand.isFeatured && <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">Featured</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {brand.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600"><Eye className="size-3" /> Active</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><EyeOff className="size-3" /> Hidden</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(brand.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/brands/${brand.id}`} className="p-1.5 rounded-lg hover:bg-secondary inline-flex">
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
