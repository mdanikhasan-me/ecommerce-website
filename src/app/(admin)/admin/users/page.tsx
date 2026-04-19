import { db } from '@/backend/database'
import { formatDate } from '@/backend/utils'
import { Users } from 'lucide-react'
import Link from 'next/link'

interface Props { searchParams: Promise<{ page?: string; q?: string; role?: string }> }
export const metadata = { title: 'Admin Users' }

export default async function AdminUsersPage({ searchParams }: Props) {
  const filters = await searchParams
  const page = Math.max(1, parseInt(filters.page ?? '1'))
  const limit = 25
  const skip = (page - 1) * limit

  const where: any = {}
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: 'insensitive' } },
      { email: { contains: filters.q, mode: 'insensitive' } },
    ]
  }
  if (filters.role) where.role = filters.role

  const [users, total] = await Promise.all([
    db.user.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { orders: true } } },
    }),
    db.user.count({ where }),
  ])

  const ROLE_COLORS: Record<string, string> = {
    CUSTOMER: 'bg-blue-50 text-blue-700',
    SELLER: 'bg-purple-50 text-purple-700',
    ADMIN: 'bg-warning/10 text-warning',
    SUPER_ADMIN: 'bg-red-50 text-red-700',
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">{total} registered users</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3">
        <form className="flex flex-wrap gap-3">
          <input aria-label="Search name or email..." title="Search name or email..." name="q" defaultValue={filters.q} placeholder="Search name or email..." className="input-base max-w-xs" />
          <select aria-label="Role" title="Role" name="role" defaultValue={filters.role} className="input-base w-40">
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="SELLER">Seller</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit" className="btn-primary px-4">Filter</button>
        </form>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Phone</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Role</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Orders</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Joined</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  No users found
                </td>
              </tr>
            ) : users.map((user) => (
              <tr key={user.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                      {user.name?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div>
                      <p className="font-medium">{user.name ?? 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{user.phone ?? 'N/A'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] ?? 'bg-secondary'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell font-medium">{user._count.orders}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground text-xs hidden sm:table-cell">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/users/${user.id}`} className="text-xs font-medium text-primary hover:underline">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
