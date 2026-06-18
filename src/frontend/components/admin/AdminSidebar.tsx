'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, Grid3X3, ShoppingBag, Users, Ticket,
  Image, Star, Warehouse, BarChart3, Settings, RefreshCcw, Bell,
  FileText, Zap
} from 'lucide-react'
import { cn } from '@/backend/utils'
import { BoilabinLogo } from '@/frontend/components/layout/BoilabinLogo'

export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Grid3X3 },
  { label: 'Inventory', href: '/admin/inventory', icon: Warehouse },
  { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { label: 'Banners', href: '/admin/banners', icon: Image },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Customers', href: '/admin/users', icon: Users },
  { label: 'Returns', href: '/admin/returns', icon: RefreshCcw },
  { label: 'Analytics', href: '/admin/reports', icon: BarChart3 },
  { label: 'Content', href: '/admin/content', icon: FileText },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar({
  className,
  onNavigate,
}: {
  className?: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <aside className={cn('w-60 flex-shrink-0 overflow-y-auto bg-[hsl(270_16%_13%)] text-[hsl(42_28%_92%)] flex flex-col', className)}>
      {/* Logo */}
      <div className="border-b border-white/10 p-5">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <span className="rounded-md bg-[hsl(42_36%_96%)] p-1.5">
            <BoilabinLogo variant="full" size={46} />
          </span>
          <div>
            <span className="block text-sm font-semibold text-[hsl(42_36%_96%)]">Boilabin</span>
            <span className="-mt-0.5 block text-xs text-[hsl(40_18%_74%)]">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-[hsl(38_14%_62%)]">Main Menu</p>
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'mb-0.5 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-[hsl(270_24%_24%)] text-[hsl(42_36%_96%)]'
                  : 'text-[hsl(42_16%_76%)] md:hover:bg-[hsl(270_18%_18%)] md:hover:text-[hsl(42_36%_96%)]'
              )}
            >
              <item.icon className={cn('h-4 w-4 flex-shrink-0', isActive && 'text-[hsl(var(--accent))]')} />
              {item.label}
            </Link>
          )
        })}

      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-[hsl(38_14%_62%)] transition-colors md:hover:bg-[hsl(270_18%_18%)] md:hover:text-[hsl(42_36%_96%)]"
        >
          <Zap className="h-3.5 w-3.5" />
          View Store
        </Link>
      </div>
    </aside>
  )
}
