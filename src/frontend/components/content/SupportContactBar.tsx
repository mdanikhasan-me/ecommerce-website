import Link from 'next/link'

import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { CONTACT_EMAIL } from '@/shared/contact'

type SupportContactBarProps = {
  title?: string
  description?: string
}

export function SupportContactBar({
  title = 'Need more help?',
  description = 'Our support team is here to help with any questions.',
}: SupportContactBarProps) {
  return (
    <section aria-label="Support options" className="flex flex-col gap-5 rounded-lg bg-[#eef4ff] p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <LocalIcon name="headset" className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
        <span>
          <strong className="block text-sm">{title}</strong>
          <span className="mt-1 block text-sm leading-6 text-muted-foreground">{description}</span>
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:flex">
        <Link href="/contact" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#121212] px-4 text-sm font-semibold text-white">
          Contact support <LocalIcon name="arrow-right" className="h-4 w-4" />
        </Link>
        <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-foreground">
          <LocalIcon name="mail" className="h-4 w-4" /> Email us
        </a>
      </div>
    </section>
  )
}
