'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/backend/utils'

export type FAQSection = {
  category: string
  items: { q: string; a: string }[]
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="pr-4 text-sm font-medium">{q}</span>
        <ChevronDown className={cn('h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="pb-4 text-sm leading-relaxed text-muted-foreground">{a}</div>}
    </div>
  )
}

export function FAQContent({ sections }: { sections: FAQSection[] }) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.category}>
          <h2 className="mb-3 text-center font-display text-lg font-semibold text-foreground">{section.category}</h2>
          <div className="rounded-[24px] border border-border/70 bg-card px-5 shadow-sm">
            {section.items.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
