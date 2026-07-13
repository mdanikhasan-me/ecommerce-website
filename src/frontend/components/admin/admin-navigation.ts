import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Bell,
  FileText,
  Grid3X3,
  Image as ImageIcon,
  LayoutDashboard,
  Package,
  RefreshCcw,
  Settings,
  ShoppingBag,
  Star,
  Ticket,
  UserRound,
  Users,
  Warehouse,
} from 'lucide-react'

export type AdminNavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export type AdminNavGroup = {
  label: string
  items: AdminNavItem[]
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Analytics', href: '/admin/reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Inventory', href: '/admin/inventory', icon: Warehouse },
      { label: 'Categories', href: '/admin/categories', icon: Grid3X3 },
      { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
    ],
  },
  {
    label: 'Storefront',
    items: [
      { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
      { label: 'Content', href: '/admin/content', icon: FileText },
    ],
  },
  {
    label: 'People & Support',
    items: [
      { label: 'Customers', href: '/admin/users', icon: Users },
      { label: 'Reviews', href: '/admin/reviews', icon: Star },
      { label: 'Returns', href: '/admin/returns', icon: RefreshCcw },
      { label: 'Notifications', href: '/admin/notifications', icon: Bell },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Profile', href: '/admin/profile', icon: UserRound },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
]

export const ADMIN_NAV_ITEMS = ADMIN_NAV_GROUPS.flatMap((group) => group.items)

export function isAdminNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function getActiveAdminNavItem(pathname: string) {
  return ADMIN_NAV_ITEMS.find((item) => isAdminNavItemActive(pathname, item.href))
}
