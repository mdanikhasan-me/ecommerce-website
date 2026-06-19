'use client'

import { useState } from 'react'
import { AriaExpandedButton } from '@/frontend/components/ui/AriaExpandedButton'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { cn } from '@/backend/utils'

export type FAQSection = {
  category: string
  items: { q: string; a: string }[]
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-border last:border-0">
      <AriaExpandedButton
        type="button"
        onClick={() => setOpen(!open)}
        expanded={open}
        className="group flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className={cn('pr-4 text-[15px] font-medium transition-colors min-[1025px]:hover:text-accent', open && 'text-foreground')}>
          {q}
        </span>
        <LocalIcon
          name="chevron-down"
          className={cn(
            'h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors duration-150',
            open && 'rotate-180 text-accent',
          )}
        />
      </AriaExpandedButton>
      <div className={cn('grid transition-[grid-template-rows] duration-150', open ? 'grid-rows-[1fr] pb-4' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-muted-foreground">{a}</p>
        </div>
      </div>
    </div>
  )
}

export function FAQContent({ sections }: { sections: FAQSection[] }) {
  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <div key={section.category}>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {section.category}
          </h2>
          <div className="rounded-2xl border border-border bg-card px-5 shadow-sm">
            {section.items.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
