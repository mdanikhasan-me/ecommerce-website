import type { StorefrontIconName } from '@/shared/storefront-icons'

export type NavSubcategory = {
  name: string
  slug: string
  icon: StorefrontIconName
}

export type NavCategory = {
  name: string
  slug: string
  icon: StorefrontIconName
  sub: NavSubcategory[]
}

export const DEFAULT_DESKTOP_CATEGORY_SLUG = 'electronics'

export const NAV_CATEGORIES = [
  {
    name: 'Electronics',
    slug: 'electronics',
    icon: 'category-electronics',
    sub: [
      { name: 'Mobile Phones', slug: 'mobile-phones', icon: 'subcategory-mobile-phone' },
      { name: 'Laptops', slug: 'laptops', icon: 'subcategory-laptop' },
      { name: 'Audio', slug: 'audio', icon: 'subcategory-headphones' },
      { name: 'Wearables', slug: 'wearables', icon: 'subcategory-watch' },
    ],
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    icon: 'category-fashion',
    sub: [
      { name: "Men's Fashion", slug: 'mens-fashion', icon: 'subcategory-mens-fashion' },
      { name: "Women's Fashion", slug: 'womens-fashion', icon: 'subcategory-womens-fashion' },
    ],
  },
  {
    name: 'Home & Appliances',
    slug: 'home-appliances',
    icon: 'category-home-appliances',
    sub: [{ name: 'Kitchen', slug: 'kitchen', icon: 'subcategory-kitchen' }],
  },
  { name: 'Beauty & Health', slug: 'beauty-health', icon: 'category-beauty-health', sub: [] },
  { name: 'Sports & Fitness', slug: 'sports-fitness', icon: 'category-sports-fitness', sub: [] },
  { name: 'Books & Stationery', slug: 'books-stationery', icon: 'category-books-stationery', sub: [] },
  { name: 'Gaming', slug: 'gaming', icon: 'category-gaming', sub: [] },
  {
    name: 'Toys & Collectibles',
    slug: 'toys-collectibles',
    icon: 'category-toys-collectibles',
    sub: [
      { name: 'Hot Wheels', slug: 'hot-wheels', icon: 'subcategory-hot-wheels' },
      { name: 'LEGO Sets', slug: 'lego-sets', icon: 'subcategory-lego-sets' },
      { name: 'Diecast Models', slug: 'diecast-models', icon: 'subcategory-diecast-models' },
      { name: 'Action Figures', slug: 'action-figures', icon: 'subcategory-action-figures' },
      { name: 'Collectible Cards', slug: 'collectible-cards', icon: 'subcategory-collectible-cards' },
    ],
  },
] satisfies NavCategory[]

export function getCategoryHref(slug: string) {
  return `/category/${slug}`
}

export function getViewAllCategoryLabel(category: Pick<NavCategory, 'name'>) {
  return `View all ${category.name.toLowerCase()}`
}

export type MobileMenuLink = {
  label: string
  href: string
  icon: StorefrontIconName
}

export const MOBILE_SUPPORT_LINKS: MobileMenuLink[] = [
  { label: 'Help Center', href: '/help', icon: 'life-buoy' },
  { label: 'Track Order', href: '/track-order', icon: 'package' },
  { label: 'Contact Us', href: '/contact', icon: 'mail' },
  { label: 'Returns', href: '/returns', icon: 'refresh-ccw' },
]

export type MobileAccountLink = MobileMenuLink & {
  description: string
  adminOnly?: boolean
}

export const MOBILE_ACCOUNT_LINKS: MobileAccountLink[] = [
  { label: 'My Account', href: '/account', icon: 'user', description: 'Profile, phone number and addresses' },
  { label: 'My Orders', href: '/account/orders', icon: 'package', description: 'Track and manage your orders' },
  { label: 'Wishlist', href: '/wishlist', icon: 'heart', description: 'Saved items' },
  { label: 'New Arrivals', href: '/new-arrivals', icon: 'sparkles', description: 'Fresh products just landed' },
  { label: 'Compare', href: '/compare', icon: 'compare', description: 'Review products side by side' },
  { label: 'Admin Panel', href: '/admin', icon: 'layout-dashboard', description: 'Manage store, orders and content', adminOnly: true },
]
