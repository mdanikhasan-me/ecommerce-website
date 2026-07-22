import Link from 'next/link'
import type { ReactNode } from 'react'

import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

type SupportFaqListProps = {
  questions: readonly (readonly [string, ReactNode])[]
  heading?: string
  description?: string
  showMoreLink?: boolean
}

export function SupportFaqList({ questions, heading = 'FAQ', description, showMoreLink = true }: SupportFaqListProps) {
  return (
    <section className="w-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium tracking-[-0.02em]">{heading}</h2>
          {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p> : null}
        </div>
        {showMoreLink ? <Link href="/faq" className="inline-flex h-9 shrink-0 items-center gap-2 rounded-sm px-2 text-sm font-medium text-[#324052] sm:h-10 sm:px-3">
            More FAQs <LocalIcon name="arrow-right" className="h-4 w-4" />
          </Link> : null}
      </div>
      <div className="mt-3 divide-y divide-border">
        {questions.map(([question, answer]) => (
          <details key={question} className="group">
            <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 py-1 text-[0.95rem] font-medium leading-6 tracking-[-0.005em] [&::-webkit-details-marker]:hidden">
              <span>{question}</span>
              <LocalIcon name="chevron-down" className="h-4 w-4 group-open:rotate-180" />
            </summary>
            <p className="max-w-3xl pb-4 text-sm leading-6 text-muted-foreground">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
