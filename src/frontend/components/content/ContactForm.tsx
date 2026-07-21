import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import type { StorefrontIconName } from '@/shared/storefront-icons'
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE, WHATSAPP_URL } from '@/shared/contact'

const CONTACT_PHONE_HREF = `tel:${CONTACT_PHONE.replace(/[^\d+]/g, '')}`
const CONTACT_PHONE_DISPLAY = '+880 1570 208 986'

const CONTACT_ACTIONS = [
  {
    icon: 'whatsapp',
    title: 'WhatsApp Support',
    value: '',
    detail: 'Fast help for orders, products, and returns.',
    href: WHATSAPP_URL,
    actionLabel: 'Chat on WhatsApp',
    tone: 'bg-blue-50',
  },
  {
    icon: 'phone',
    title: 'Call Support',
    value: CONTACT_PHONE_DISPLAY,
    detail: 'Saturday to Thursday\n9:00 AM \u2013 9:00 PM',
    href: CONTACT_PHONE_HREF,
    actionLabel: 'Call Now',
    tone: 'bg-amber-50',
  },
  {
    icon: 'mail',
    title: 'Email Support',
    value: CONTACT_EMAIL,
    detail: 'Send your order details or question.',
    href: `mailto:${CONTACT_EMAIL}`,
    actionLabel: 'Send Email',
    tone: 'bg-green-50',
  },
] as const satisfies ReadonlyArray<{
  icon: StorefrontIconName
  title: string
  value: string
  detail: string
  href: string
  actionLabel: string
  tone: string
}>

const SUPPORT_DETAILS = [
  {
    icon: 'clock',
    title: 'Support Hours',
    primary: 'Saturday to Thursday',
    secondary: '9:00 AM \u2013 9:00 PM',
  },
  {
    icon: 'map-pin',
    title: 'Our Location',
    primary: CONTACT_ADDRESS,
    secondary: 'Dhaka, Bangladesh',
  },
  {
    icon: 'shield',
    title: 'Quick Response',
    primary: 'We typically respond',
    secondary: 'within 24 hours',
  },
] as const satisfies ReadonlyArray<{
  icon: StorefrontIconName
  title: string
  primary: string
  secondary: string
}>

export function ContactForm() {
  return (
    <div className="mt-7 space-y-5 sm:mt-9 sm:space-y-6">
      <section aria-label="Contact options" className="grid gap-3 md:grid-cols-3 lg:gap-4">
        {CONTACT_ACTIONS.map((item) => (
          <ContactActionCard key={item.actionLabel} {...item} />
        ))}
      </section>

      <section
        aria-label="Support information"
        className="grid rounded-xl border border-border bg-card px-5 py-3 md:grid-cols-3 md:px-2 md:py-5"
      >
        {SUPPORT_DETAILS.map((item) => (
          <SupportDetail key={item.title} {...item} />
        ))}
      </section>
    </div>
  )
}

function ContactActionCard({
  icon,
  title,
  value,
  detail,
  href,
  actionLabel,
  tone,
}: {
  icon: StorefrontIconName
  title: string
  value: string
  detail: string
  href: string
  actionLabel: string
  tone: string
}) {
  return (
    <article className="flex items-start gap-4 rounded-xl border border-border bg-card px-4 py-5 text-left sm:min-h-[16rem] sm:flex-col sm:items-center sm:gap-0 sm:px-6 sm:py-7 sm:text-center lg:min-h-[17rem]">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tone} sm:h-16 sm:w-16`}>
        <LocalIcon name={icon} className="h-6 w-6 sm:h-7 sm:w-7" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col sm:w-full sm:items-center">
        <h2 className="text-base font-semibold sm:mt-5">{title}</h2>
        {value ? <p className="mt-1.5 text-sm font-semibold sm:mt-2">{value}</p> : null}
        <p className="mt-1.5 max-w-[14.5rem] whitespace-pre-line text-sm leading-6 text-muted-foreground sm:mt-2">{detail}</p>
        <a
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="mt-3 inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#121212] px-4 text-sm font-semibold text-white sm:mt-auto sm:h-11 lg:gap-3 lg:px-5"
        >
          {actionLabel}
          <LocalIcon name="arrow-right" className="h-4 w-4" />
        </a>
      </div>
    </article>
  )
}

function SupportDetail({
  icon,
  title,
  primary,
  secondary,
}: {
  icon: StorefrontIconName
  title: string
  primary: string
  secondary: string
}) {
  return (
    <article className="flex items-start gap-4 py-4 md:px-6 md:py-1">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
        <LocalIcon name={icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-1.5 text-sm leading-5 text-muted-foreground">{primary}</p>
        <p className="text-sm leading-5 text-muted-foreground">{secondary}</p>
      </div>
    </article>
  )
}
