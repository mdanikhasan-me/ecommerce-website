import { db } from '@/backend/database'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'

export const metadata = { title: 'Admin Categories' }

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: { orderBy: { sortOrder: 'asc' }, include: { _count: { select: { products: true } } } },
      _count: { select: { products: true } },
    },
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">Categories</h1>
        <Link href="/admin/categories/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" /> Add Category
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Category</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Sub-categories</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Products</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((cat) => (
              <>
                <tr key={cat.id} className="hover:bg-secondary/50 bg-secondary/20">
                  <td className="px-4 py-3 font-semibold">{cat.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{cat.children.length} sub-categories</td>
                  <td className="px-4 py-3 text-right">{cat._count.products}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/categories/${cat.id}`} className="p-1.5 rounded-lg hover:bg-muted inline-flex">
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </td>
                </tr>
                {cat.children.map((sub) => (
                  <tr key={sub.id} className="hover:bg-secondary/50">
                    <td className="px-4 py-2.5 pl-10 text-muted-foreground text-sm">↳ {sub.name}</td>
                    <td className="px-4 py-2.5 hidden md:table-cell" />
                    <td className="px-4 py-2.5 text-right text-muted-foreground text-sm">{sub._count.products}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${sub.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {sub.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link href={`/admin/categories/${sub.id}`} className="p-1.5 rounded-lg hover:bg-muted inline-flex">
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
