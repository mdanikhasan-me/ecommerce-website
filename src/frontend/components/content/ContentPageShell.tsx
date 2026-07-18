import Link from 'next/link'
import type { ReactNode } from 'react'
import { OnThisPageNav } from './OnThisPageNav'

type PageHighlight = {
  label: string
  value: string
}

type PageSection = {
  id: string
  title: string
  body: ReactNode
}

type ContentPageShellProps = {
  title: string
  description: string
  updatedAt?: string
  highlights?: PageHighlight[]
  sections: PageSection[]
  supportTitle?: string
  supportCopy?: string
  showOnThisPageNav?: boolean
}

const proseClass =
  'space-y-4 text-[15px] leading-7 text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2 min-[1025px]:[&_a:hover]:text-accent [&_li]:pl-1.5 [&_ol>li]:marker:font-semibold [&_ol>li]:marker:text-foreground/70 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul>li]:marker:text-accent [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5'

export function ContentPageShell({
  title,
  description,
  updatedAt,
  highlights = [],
  sections,
  supportTitle = 'Need a hand?',
  supportCopy = 'Talk to our team before or after you order, and we will help you sort it out.',
  showOnThisPageNav = true,
}: ContentPageShellProps) {
  return (
    <div className="container-site py-10 lg:py-16">
      {/* Header */}
      <header className="max-w-2xl">
        <h1 className="font-display text-[2rem] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[2.5rem]">
          {title}
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-[17px] sm:leading-8">{description}</p>
        {updatedAt ? <p className="mt-5 text-sm text-muted-foreground">Last updated {updatedAt}</p> : null}
      </header>

      <div
        className={
          showOnThisPageNav
            ? 'mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:gap-14 xl:gap-16'
            : 'mt-10 max-w-3xl lg:mt-14'
        }
      >
        {showOnThisPageNav ? (
          <OnThisPageNav sections={sections.map((section) => ({ id: section.id, title: section.title }))} />
        ) : null}

        <div className={showOnThisPageNav ? 'min-w-0 max-w-2xl' : 'min-w-0'}>
          {highlights.length ? (
            <div className="mb-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.label} className="bg-card p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">{item.label}</p>
                  <p className="mt-2 text-[15px] font-semibold leading-6 text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="divide-y divide-border">
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-28 py-8 first:pt-0">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-sm font-bold tabular-nums text-accent">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-[1.4rem]">
                    {section.title}
                  </h2>
                </div>
                <div className={`mt-4 sm:pl-8 ${proseClass}`}>{section.body}</div>
              </section>
            ))}
          </div>

          <section className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-secondary/40 p-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-base font-semibold text-foreground">{supportTitle}</p>
              <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">{supportCopy}</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link href="/contact" className="btn-primary">Contact us</Link>
              <Link href="/help" className="btn-outline">Help center</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
