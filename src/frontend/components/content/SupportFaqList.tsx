import Link from 'next/link'

import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

type SupportFaqListProps = {
  questions: readonly (readonly [string, string])[]
  heading?: string
}

export function SupportFaqList({ questions, heading = 'FAQ' }: SupportFaqListProps) {
  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">{heading}</h2>
        <Link href="/articles" className="inline-flex h-10 items-center gap-2 rounded-md bg-[#121212] px-4 text-sm font-semibold text-white">
          More FAQ <LocalIcon name="arrow-right" className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-3 divide-y divide-border">
        {questions.map(([question, answer]) => (
          <details key={question} className="group">
            <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
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
