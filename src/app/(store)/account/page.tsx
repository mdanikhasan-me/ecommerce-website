import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { formatPrice } from '@/backend/utils'
import { AccountAvatar } from '@/frontend/components/account/AccountAvatar'
import {
  ChevronRight,
  FileQuestion,
  Heart,
  MapPin,
  MessageCircle,
  Package,
  Pencil,
  Search,
  Settings,
  ShoppingBag,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Boilabin Account' }

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-amber-500',
  CONFIRMED: 'text-blue-500',
  SHIPPED: 'text-purple-500',
  DELIVERED: 'text-green-600',
  CANCELLED: 'text-red-500',
}

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login?callbackUrl=/account')

  const [recentOrders, wishlistCount] = await Promise.all([
    db.order.findMany({
      where: { userId: session.user.id },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { take: 1, select: { productName: true, imageUrl: true } },
        _count: { select: { items: true } },
      },
    }),
    db.wishlist.findUnique({
      where: { userId: session.user.id },
      include: { _count: { select: { items: true } } },
    }),
  ])

  const displayName = session.user.name?.trim() || 'Customer'
  const displayEmail = session.user.email?.trim() || 'Signed-in customer'

  const accountLinks = [
    { href: '/account/profile', icon: User, label: 'Profile', desc: 'Update your personal information' },
    { href: '/account/orders', icon: Package, label: 'My Orders', desc: 'Track and manage your orders' },
    { href: '/track-order', icon: Search, label: 'Track Order', desc: 'Look up an order by number' },
    { href: '/account/addresses', icon: MapPin, label: 'Addresses', desc: 'Manage delivery addresses' },
    { href: '/wishlist', icon: Heart, label: 'Wishlist', desc: `${wishlistCount?._count.items ?? 0} saved items` },
    { href: '/account/profile', icon: Settings, label: 'Account Settings', desc: 'Edit profile and password' },
  ]

  const helpLinks = [
    { href: '/contact', icon: MessageCircle, label: 'Contact Us' },
    { href: '/faq', icon: FileQuestion, label: 'FAQs' },
  ]

  return (
    <main className="container-site py-5 sm:py-8 lg:py-10">
      <section className="rounded-2xl border border-border bg-card px-4 py-4 shadow-[0_16px_42px_rgba(23,18,15,0.045)] sm:p-6 lg:p-8">
        <div className="flex items-center gap-3 sm:gap-5">
          <AccountAvatar
            imageUrl={session.user.image}
            name={displayName}
            className="h-16 w-16 sm:h-24 sm:w-24"
            fallbackClassName="text-2xl sm:text-3xl"
          />

          <div className="min-w-0 flex-1">
            <p className="hidden text-sm text-muted-foreground sm:block">Welcome back,</p>
            <p className="text-sm font-semibold text-foreground sm:hidden">Hi, {displayName}</p>
            <h1 className="mt-0.5 hidden truncate font-display text-2xl font-bold sm:block lg:text-3xl">
              {displayName}
            </h1>
            <p className="mt-1 truncate text-sm text-muted-foreground sm:text-base">
              {displayEmail}
            </p>
          </div>

          <Link
            href="/account/profile"
            aria-label="Edit profile"
            className="hidden h-12 items-center gap-2 rounded-xl border border-border px-5 text-sm font-semibold transition-colors hover:border-primary/40 hover:bg-secondary sm:flex"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Link>

          <Link
            href="/account/profile"
            aria-label="Open profile"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-secondary sm:hidden"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-[minmax(17rem,0.9fr)_minmax(0,1.45fr)] min-[1180px]:grid-cols-[minmax(17rem,0.95fr)_minmax(0,2fr)_minmax(15rem,0.85fr)]">
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_16px_42px_rgba(23,18,15,0.035)]">
          <div className="border-b border-border px-4 py-4 sm:px-5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">
              <span className="sm:hidden">Your Account</span>
              <span className="hidden sm:inline">My Account</span>
            </h2>
          </div>

          <nav aria-label="Account navigation" className="divide-y divide-border">
            {accountLinks.map((item) => (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-secondary/70 sm:px-5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground transition-colors group-hover:bg-background sm:h-11 sm:w-11">
                  <item.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {item.desc}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </nav>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_16px_42px_rgba(23,18,15,0.035)]">
          <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link
              href="/account/orders"
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary sm:text-sm"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex min-h-[6.5rem] items-center gap-3 px-4 py-5 sm:min-h-[22rem] sm:flex-col sm:justify-center sm:px-8 sm:py-10 sm:text-center lg:min-h-[25rem]">
              <Package className="h-11 w-11 shrink-0 text-muted-foreground/35 sm:h-14 sm:w-14" />
              <div className="min-w-0 flex-1 sm:flex-none">
                <p className="font-semibold">No orders yet</p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Start shopping to see your orders here.
                </p>
              </div>
              <Link href="/" className="btn-primary h-9 shrink-0 px-4 text-xs sm:mt-2 sm:h-11 sm:px-6 sm:text-sm">
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map((order) => {
                const itemCount = order._count.items
                const firstItemName = order.items[0]?.productName ?? 'Order items'

                return (
                  <Link
                    key={order.id}
                    href={`/account/orders/${order.id}`}
                    className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-secondary/70 sm:gap-4 sm:px-5"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <ShoppingBag className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-sm font-semibold">
                        {order.orderNumber}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {firstItemName}
                        {itemCount > 1 ? ` +${itemCount - 1} more` : ''}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-bold">{formatPrice(order.total)}</span>
                      <span className={`block text-xs font-medium ${STATUS_COLORS[order.status] ?? 'text-muted-foreground'}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-[0_16px_42px_rgba(23,18,15,0.035)] sm:p-5 lg:col-span-2 min-[1180px]:col-span-1">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">
            Need Help?
          </h2>
          <p className="mt-3 max-w-[18rem] text-sm leading-6 text-muted-foreground">
            We&apos;re here to help with any questions you have.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 min-[1180px]:grid-cols-1">
            {helpLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-h-14 items-center justify-center gap-2 rounded-xl border border-border px-3 py-3 text-sm font-semibold transition-colors hover:border-primary/40 hover:bg-secondary sm:justify-between sm:gap-3 sm:px-4"
              >
                <span className="flex min-w-0 items-center gap-2 sm:gap-3">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
