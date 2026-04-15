import Link from 'next/link'
import type { ReactNode } from 'react'
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE } from '@/shared/contact'

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
  eyebrow: string
  title: string
  description: string
  updatedAt?: string
  highlights?: PageHighlight[]
  sections: PageSection[]
  supportTitle?: string
  supportCopy?: string
}

export function ContentPageShell({
  eyebrow,
  title,
  description,
  updatedAt,
  highlights = [],
  sections,
  supportTitle = 'Need help?',
  supportCopy = 'Reach our team if you want help before or after placing an order.',
}: ContentPageShellProps) {
  return (
    <div className="container-site py-12 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-foreground md:text-[2.85rem]">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            {description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {updatedAt ? <span>Updated {updatedAt}</span> : null}
            <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-foreground">
              {CONTACT_EMAIL}
            </a>
            <a href={`tel:${CONTACT_PHONE}`} className="transition-colors hover:text-foreground">
              {CONTACT_PHONE}
            </a>
            <span>{CONTACT_ADDRESS}</span>
          </div>
        </section>

        {highlights.length ? (
          <section className="mt-8 grid gap-5 border-t border-border/70 pt-6 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.label} className="border-l border-border/70 pl-4 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-2 text-base font-medium leading-6 text-foreground">{item.value}</p>
              </div>
            ))}
          </section>
        ) : null}

        <section className="mt-10 space-y-10 border-t border-border/70 pt-8">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className={index === 0 ? '' : 'border-t border-border/70 pt-10'}
            >
              <h2 className="text-[1.55rem] font-semibold tracking-tight text-foreground">
                {section.title}
              </h2>
              <div className="mt-5 space-y-4 text-base leading-8 text-muted-foreground [&_li]:ml-5 [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:space-y-2 [&_p]:leading-8 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:list-outside [&_ul]:space-y-2">
                {section.body}
              </div>
            </section>
          ))}
        </section>

        <section className="mt-10 border-t border-border/70 pt-6">
          <p className="text-base font-semibold text-foreground">{supportTitle}</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{supportCopy}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <Link href="/contact" className="font-medium text-foreground transition-colors hover:text-primary">
              Contact page
            </Link>
            <Link href="/help" className="font-medium text-foreground transition-colors hover:text-primary">
              Help center
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
