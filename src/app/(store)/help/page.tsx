import Link from 'next/link'
import type { Metadata } from 'next'
import {
  JsonLd,
  generateBreadcrumbJsonLd,
  generatePageMetadata,
  generateWebPageJsonLd,
} from '@/backend/seo'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { CONTACT_EMAIL, CONTACT_PHONE, WHATSAPP_URL } from '@/shared/contact'
import type { StorefrontIconName } from '@/shared/storefront-icons'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin Help Center',
  'Get help with Boilabin orders, returns, shipping, payments, account support, and contact options.',
  '/help',
)

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
    title: 'WhatsApp message',
    description: 'Recommended option',
    detail: 'Open WhatsApp',
    href: WHATSAPP_URL,
    icon: 'message-circle',
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
  {
    title: 'Contact form',
    description: 'Best for detailed issues',
    detail: 'Slowest reply option',
    href: '/contact',
    icon: 'mail',
  },
]

function QuickActionCard({ action }: { action: ActionCard }) {
  return (
    <Link
      href={action.href}
      className="group flex min-h-0 items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors md:hover:border-foreground/30 md:hover:bg-secondary/35 sm:min-h-[9.75rem] sm:min-w-0 sm:flex-col sm:items-stretch sm:justify-between sm:p-5"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/80 text-foreground sm:h-11 sm:w-11 sm:rounded-xl">
        <LocalIcon name={action.icon} className="h-4 w-4 sm:h-5 sm:w-5" />
      </span>
      <span className="min-w-0 flex-1 sm:flex-none">
        <span className="block truncate text-sm font-semibold text-foreground sm:text-[0.95rem]">{action.title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground sm:mt-1 sm:text-sm">
          {action.description}
        </span>
      </span>
      <LocalIcon
        name="chevron-right"
        className="h-4 w-4 shrink-0 text-foreground/70 sm:self-end"
      />
    </Link>
  )
}

function ReachCard({ action }: { action: ActionCard & { detail?: string } }) {
  const isPlaceholder = action.href === '#'
  const content = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/80 text-foreground sm:h-11 sm:w-11">
        <LocalIcon name={action.icon} className="h-4 w-4 sm:h-5 sm:w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-5 text-foreground sm:text-base sm:leading-6">{action.title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground sm:mt-1 sm:text-sm">{action.description}</span>
        {action.detail ? (
          <span className="mt-0.5 block break-words text-xs font-medium text-primary sm:mt-1 sm:text-sm">{action.detail}</span>
        ) : null}
      </span>
      {isPlaceholder ? null : <LocalIcon name="chevron-right" className="h-5 w-5 shrink-0 text-foreground/70" />}
    </>
  )

  const className =
    'flex min-h-0 items-center gap-3 rounded-lg border border-border bg-card px-3 py-3 transition-colors md:hover:border-foreground/30 md:hover:bg-secondary/35 sm:min-h-[6.25rem] sm:gap-4 sm:px-5 sm:py-4'

  if (isPlaceholder) {
    return (
      <div className={`${className} cursor-default`} aria-disabled="true">
        {content}
      </div>
    )
  }

  if (action.href.startsWith('tel:') || action.href.startsWith('mailto:')) {
    return (
      <a href={action.href} className={className}>
        {content}
      </a>
    )
  }

  if (action.href.startsWith('http')) {
    return (
      <a href={action.href} target="_blank" rel="noopener noreferrer" className={className}>
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
    <div className="text-foreground">
      <JsonLd
        data={[
          generateWebPageJsonLd({
            name: 'Boilabin Help Center',
            description: 'Get help with Boilabin orders, returns, shipping, payments, account support, and contact options.',
            path: '/help',
          }),
          generateBreadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'Help Center', url: '/help' },
          ]),
        ]}
      />
      <section className="bg-foreground text-background">
        <div className="container-site flex min-h-[13rem] flex-col items-center justify-center py-8 text-center sm:min-h-[17rem] sm:py-14">
          <h1 className="text-[2rem] font-semibold leading-tight sm:text-5xl">We&rsquo;re here to help</h1>
          <p className="mt-3 max-w-[20rem] text-sm leading-6 text-background/72 sm:mt-4 sm:max-w-[32rem] sm:text-lg sm:leading-8">
            Questions, confusion, or anything else?
            <br />
            Hit support and we&rsquo;ll help you sort it out.
          </p>
        </div>
      </section>

      <section className="container-site py-6 sm:py-10">
        <h2 className="text-lg font-semibold leading-7 sm:text-[1.05rem]">Quick actions</h2>
        <div className="mt-3 grid gap-2 sm:mt-5 sm:grid-cols-2 lg:grid-cols-5">
          {QUICK_ACTIONS.map((action) => (
            <QuickActionCard key={action.href} action={action} />
          ))}
        </div>

        <h2 className="mt-7 text-lg font-semibold leading-7 sm:mt-10 sm:text-[1.05rem]">Reach us</h2>
        <div className="mt-3 grid gap-2 sm:mt-5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">
          {REACH_CARDS.map((action) => (
            <ReachCard key={`${action.title}-${action.href}`} action={action} />
          ))}
        </div>

        <div className="mt-8 sm:mt-12">
          <div className="mx-auto flex max-w-[38rem] flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-3 sm:text-left">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/80 text-foreground sm:h-10 sm:w-10">
              <LocalIcon name="shield" className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground sm:text-[0.95rem]">Your privacy matters.</p>
              <p className="text-xs text-muted-foreground sm:text-sm">We&rsquo;ll never share your details.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
