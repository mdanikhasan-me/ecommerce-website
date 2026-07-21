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
    <section aria-label="Support options" className="flex w-full flex-col gap-4 rounded-lg bg-[#edf8f0] p-4 sm:gap-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <LocalIcon name="shopping-bag" className="mt-0.5 h-5 w-5 shrink-0 text-[#19703b] sm:h-6 sm:w-6" />
        <span>
          <strong className="block text-sm font-semibold text-[#173d28] sm:text-base">{title}</strong>
          <span className="mt-1 block text-sm leading-6 text-[#5d7463]">{description}</span>
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 lg:flex">
        <Link href="/contact" className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#173d28] px-3 text-xs font-semibold text-white sm:h-10 sm:px-4 sm:text-sm">
          Contact support <LocalIcon name="arrow-right" className="h-4 w-4" />
        </Link>
        <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#d7efdf] px-3 text-xs font-semibold text-[#173d28] sm:h-10 sm:px-4 sm:text-sm">
          <LocalIcon name="mail" className="h-4 w-4" /> Email us
        </a>
      </div>
    </section>
  )
}
