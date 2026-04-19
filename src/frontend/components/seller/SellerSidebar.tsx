'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/backend/utils'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  BarChart3,
  PlusCircle,
  Store,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller/products', label: 'Products', icon: Package },
  { href: '/seller/products/new', label: 'Add Product', icon: PlusCircle },
  { href: '/seller/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/seller/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/seller/settings', label: 'Store Settings', icon: Settings },
]

interface SellerSidebarProps {
  storeName: string
}

export function SellerSidebar({ storeName }: SellerSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen flex-col border-r border-white/10 bg-foreground text-background transition-all duration-200',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
          <Store className="size-4 text-white" />
        </div>
        {!collapsed && <span className="truncate text-sm font-semibold text-white">{storeName}</span>}
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white'
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-2">
        <Link
          href="/"
          target="_blank"
          className={cn(
            'mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-white/60 hover:bg-white/8 hover:text-white',
            collapsed ? 'justify-center' : ''
          )}
        >
          <ExternalLink className="size-4 shrink-0" />
          {!collapsed && <span>View Store</span>}
        </Link>
        <button
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center py-2 text-white/60 transition-colors hover:text-white"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>
    </aside>
  )
}
