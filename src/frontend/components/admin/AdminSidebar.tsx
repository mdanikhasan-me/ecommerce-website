'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, Grid3X3, ShoppingBag, Users, Ticket,
  Image, Star, Warehouse, BarChart3, Settings, RefreshCcw, Bell,
  FileText, ChevronRight, Zap
} from 'lucide-react'
import { cn } from '@/backend/utils'
import { BoilabinLogo } from '@/frontend/components/layout/BoilabinLogo'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Grid3X3 },
  { label: 'Inventory', href: '/admin/inventory', icon: Warehouse },
  { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { label: 'Flash Sales', href: '/admin/flash-sales', icon: Zap },
  { label: 'Banners', href: '/admin/banners', icon: Image },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Customers', href: '/admin/users', icon: Users },
  { label: 'Returns', href: '/admin/returns', icon: RefreshCcw },
  { label: 'Analytics', href: '/admin/reports', icon: BarChart3 },
  { label: 'Content', href: '/admin/content', icon: FileText },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-foreground text-background flex flex-col flex-shrink-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <span className="rounded-xl bg-white p-1.5">
            <BoilabinLogo variant="full" size={46} />
          </span>
          <div>
            <span className="block text-sm font-semibold text-white">Boilabin</span>
            <span className="text-xs text-white/50 block -mt-0.5">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest px-3 mb-2">Main Menu</p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 mb-0.5',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
              {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
            </Link>
          )
        })}

      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 text-xs text-white/40 hover:text-white transition-colors rounded-xl hover:bg-white/10"
        >
          <Zap className="h-3.5 w-3.5" />
          View Store
        </Link>
      </div>
    </aside>
  )
}
