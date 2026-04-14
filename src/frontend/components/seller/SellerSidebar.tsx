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
        'sticky top-0 h-screen border-r border-border bg-card transition-all duration-200 flex flex-col',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Store identity */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Store className="size-4 text-primary" />
        </div>
        {!collapsed && (
          <span className="font-display font-semibold text-sm truncate">{storeName}</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
      </button>
    </aside>
  )
}
