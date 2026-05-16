import { auth } from '@/backend/auth'
import { redirect } from 'next/navigation'
import { db } from '@/backend/database'
import Link from 'next/link'
import { Package, MapPin, Heart, Settings, ChevronRight } from 'lucide-react'
import { formatPrice } from '@/backend/utils'

export const metadata = { title: 'Boilabin Account' }

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login?callbackUrl=/account')

  const [recentOrders, wishlistCount] = await Promise.all([
    db.order.findMany({
      where: { userId: session.user.id },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { items: { take: 1, select: { productName: true, imageUrl: true } } },
    }),
    db.wishlist.findUnique({
      where: { userId: session.user.id },
      include: { _count: { select: { items: true } } },
    }),
  ])

  const QUICK_LINKS = [
    { href: '/account/profile', icon: Settings, label: 'Profile', desc: 'Update your personal information' },
    { href: '/account/orders', icon: Package, label: 'My Orders', desc: 'Track and manage your orders' },
    { href: '/account/addresses', icon: MapPin, label: 'Addresses', desc: 'Manage delivery addresses' },
    { href: '/wishlist', icon: Heart, label: 'Wishlist', desc: `${wishlistCount?._count.items ?? 0} saved items` },
    { href: '/account/profile', icon: Settings, label: 'Account Settings', desc: 'Edit profile and password' },
  ]

  const STATUS_COLORS: Record<string, string> = {
    PENDING: 'text-amber-500',
    CONFIRMED: 'text-blue-500',
    SHIPPED: 'text-purple-500',
    DELIVERED: 'text-green-600',
    CANCELLED: 'text-red-500',
  }

  return (
    <div className="container-site py-8">
      <div className="max-w-4xl">
        {/* Welcome */}
        <div className="mb-8 rounded-[1.75rem] border border-black/8 bg-[linear-gradient(135deg,#2d1b3d_0%,#4a2d66_55%,#c8b49e_175%)] p-6 text-white shadow-[0_18px_42px_rgba(23,18,15,0.12)]">
          <div className="flex items-center gap-3">
            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white/12 ring-1 ring-white/18">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="font-display text-2xl font-bold text-white">
                  {(session.user.name?.[0] ?? 'U').toUpperCase()}
                </span>
              )}
            </span>
            <span className="rounded-full border border-white/14 bg-white/8 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/82">
              Account
            </span>
          </div>
          <p className="mt-5 text-sm text-white/72">Welcome back,</p>
          <h1 className="mt-0.5 font-display text-2xl font-bold">{session.user.name}</h1>
          <p className="mt-1 text-sm text-white/72">{session.user.email}</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-sm transition-all group"
            >
              <link.icon className="h-5 w-5 text-primary mb-3" />
              <p className="font-semibold text-sm">{link.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link href="/account/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="font-medium">No orders yet</p>
              <p className="text-muted-foreground text-sm mt-1">Start shopping to see your orders here.</p>
              <Link href="/" className="btn-primary mt-4 inline-flex">Shop Now</Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-secondary transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-semibold text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.items[0]?.productName}
                      {/* @ts-ignore */}
                      {order.items.length > 1 && ` +${order.items.length - 1} more`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatPrice(order.total)}</p>
                    <p className={`text-xs font-medium ${STATUS_COLORS[order.status] ?? 'text-muted-foreground'}`}>
                      {order.status.replace('_', ' ')}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
