import Link from 'next/link'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { CONTACT_EMAIL, CONTACT_PHONE } from '@/shared/contact'
import type { StorefrontIconName } from '@/shared/storefront-icons'

type ActionCard = {
  title: string
  description: string
  href: string
  icon: StorefrontIconName
}

const QUICK_ACTIONS: ActionCard[] = [
  {
    title: 'Track order',
    description: 'Check your order status anytime',
    href: '/track-order',
    icon: 'package',
  },
  {
    title: 'Returns',
    description: 'Start or check a return',
    href: '/returns',
    icon: 'refresh-ccw',
  },
  {
    title: 'Shipping',
    description: 'Delivery info and timelines',
    href: '/shipping',
    icon: 'truck',
  },
  {
    title: 'Payments',
    description: 'Payment methods and issues',
    href: '/faq',
    icon: 'credit-card',
  },
  {
    title: 'Account help',
    description: 'Login, profile and account support',
    href: '/account',
    icon: 'user',
  },
]

const REACH_CARDS: Array<ActionCard & { detail?: string }> = [
  {
    title: 'Contact form',
    description: 'Send us a message',
    href: '/contact',
    icon: 'mail',
  },
  {
    title: 'Call us',
    description: 'Talk to our team',
    detail: CONTACT_PHONE,
    href: `tel:${CONTACT_PHONE.replace(/[^\d+]/g, '')}`,
    icon: 'phone',
  },
  {
    title: 'Email us',
    description: "We'll reply soon",
    detail: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    icon: 'mail',
  },
]

function QuickActionCard({ action }: { action: ActionCard }) {
  return (
    <Link
      href={action.href}
      className="group flex min-h-[10.75rem] min-w-[9rem] flex-col justify-between rounded-lg border border-black/10 bg-[#fff] p-5 transition-colors hover:border-foreground/30 sm:min-w-0"
    >
      <LocalIcon name={action.icon} className="h-9 w-9 text-foreground" />
      <span>
        <span className="block text-base font-semibold text-foreground">{action.title}</span>
        <span className="mt-1 hidden text-sm leading-5 text-muted-foreground sm:block">
          {action.description}
        </span>
      </span>
      <LocalIcon
        name="chevron-right"
        className="hidden h-4 w-4 self-end text-foreground/70 transition-transform group-hover:translate-x-0.5 sm:block"
      />
    </Link>
  )
}

function ReachCard({ action }: { action: ActionCard & { detail?: string } }) {
  const content = (
    <>
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
        <LocalIcon name={action.icon} className="h-7 w-7" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-semibold leading-6 text-foreground">{action.title}</span>
        <span className="mt-1 block text-sm leading-5 text-muted-foreground">{action.description}</span>
        {action.detail ? (
          <span className="mt-1 block break-words text-sm font-medium text-blue-600">{action.detail}</span>
        ) : null}
      </span>
      <LocalIcon name="chevron-right" className="h-5 w-5 shrink-0 text-foreground/70" />
    </>
  )

  const className =
    'flex min-h-[7rem] items-center gap-4 rounded-lg border border-black/10 bg-[#fff] px-5 py-4 transition-colors hover:border-foreground/30'

  if (action.href.startsWith('tel:') || action.href.startsWith('mailto:')) {
    return (
      <a href={action.href} className={className}>
        {content}
      </a>
    )
  }

  return (
    <Link href={action.href} className={className}>
      {content}
    </Link>
  )
}

export default function HelpPage() {
  return (
    <div className="bg-[#fffdfa] text-foreground">
      <section className="bg-[#050505] text-[#fff]">
        <div className="container-site flex min-h-[20rem] flex-col items-center justify-center py-12 text-center sm:min-h-[17rem] sm:py-14">
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">We&rsquo;re here to help</h1>
          <p className="mt-4 max-w-[32rem] text-base leading-7 text-white/72 sm:text-lg sm:leading-8">
            Quick answers, helpful guides,
            <br />
            and real support when you need it.
          </p>

          <form action="/search" className="mt-9 w-full max-w-[36rem] sm:hidden">
            <label className="sr-only" htmlFor="help-search">
              Search help topics
            </label>
            <div className="relative">
              <LocalIcon
                name="search"
                className="absolute left-5 top-1/2 h-7 w-7 -translate-y-1/2 text-foreground"
              />
              <input
                id="help-search"
                name="q"
                type="search"
                placeholder="Search help topics..."
                className="h-20 w-full rounded-full border border-white/20 bg-[#fff] pl-16 pr-6 text-2xl text-foreground shadow-[0_16px_36px_rgba(255,255,255,0.12)] placeholder:text-foreground/45 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>
          </form>
        </div>
      </section>

      <section className="container-site py-10 sm:py-12">
        <h2 className="text-xl font-semibold leading-7">Quick actions</h2>
        <div className="mt-5 flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-5">
          {QUICK_ACTIONS.map((action) => (
            <QuickActionCard key={action.href} action={action} />
          ))}
        </div>

        <div className="my-10 h-px bg-black/10" />

        <h2 className="text-xl font-semibold leading-7">Reach us</h2>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {REACH_CARDS.map((action) => (
            <ReachCard key={`${action.title}-${action.href}`} action={action} />
          ))}
        </div>

        <div className="mt-12 border-t border-black/10 pt-8">
          <div className="mx-auto flex max-w-[38rem] items-center justify-center gap-4 text-center sm:text-left">
            <LocalIcon name="shield" className="h-7 w-7 shrink-0 text-foreground/72" />
            <div>
              <p className="text-base font-semibold text-foreground">Your privacy matters.</p>
              <p className="text-sm text-muted-foreground">We&rsquo;ll never share your details.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
