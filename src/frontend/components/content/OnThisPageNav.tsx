'use client'

import { useEffect, useState } from 'react'

type NavItem = { id: string; title: string }

export function OnThisPageNav({ sections }: { sections: NavItem[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-25% 0px -65% 0px', threshold: 0 },
    )

    sections.forEach((section) => {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sections])

  return (
    <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">On this page</p>
      <nav className="mt-3 border-l border-border">
        {sections.map((section) => {
          const isActive = active === section.id
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={isActive ? 'true' : undefined}
              className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors ${
                isActive
                  ? 'border-accent font-medium text-foreground'
                  : 'border-transparent text-muted-foreground min-[1025px]:hover:border-border min-[1025px]:hover:text-foreground'
              }`}
            >
              {section.title}
            </a>
          )
        })}
      </nav>
    </aside>
  )
}
