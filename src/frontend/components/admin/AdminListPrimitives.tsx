import Link from 'next/link'
import type { ReactNode } from 'react'

import { cn } from '@/backend/utils'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

export type AdminListTab = {
  label: string
  count?: number
  href: string
  active?: boolean
}

export function AdminListHeader({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <header className="admin-list-header">
      <div className="min-w-0">
        <h1 className="admin-list-title">{title}</h1>
        <p className="admin-list-description">{description}</p>
      </div>
      {actions ? <div className="admin-list-actions">{actions}</div> : null}
    </header>
  )
}

export function AdminListTabs({ tabs, label }: { tabs: AdminListTab[]; label: string }) {
  return (
    <nav className="admin-list-tabs" aria-label={label}>
      {tabs.map((tab) => (
        <Link
          key={`${tab.label}-${tab.href}`}
          href={tab.href}
          className="admin-list-tab"
          aria-current={tab.active ? 'page' : undefined}
        >
          <span>{tab.label}</span>
          {typeof tab.count === 'number' ? <span className="admin-list-tab-count">{tab.count}</span> : null}
        </Link>
      ))}
    </nav>
  )
}

export function AdminSearchField({
  name = 'q',
  defaultValue,
  placeholder,
  className,
}: {
  name?: string
  defaultValue?: string
  placeholder: string
  className?: string
}) {
  return (
    <label className={cn('admin-list-search', className)}>
      <LocalIcon name="search" className="h-[1.125rem] w-[1.125rem]" />
      <input
        name={name}
        type="search"
        enterKeyHint="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </label>
  )
}

export function AdminSelectField({
  label,
  name,
  defaultValue,
  children,
  className,
}: {
  label: string
  name: string
  defaultValue?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn('admin-list-select', className)}>
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue} aria-label={label}>
        {children}
      </select>
      <LocalIcon name="chevron-down" className="admin-list-select-chevron h-4 w-4" />
    </label>
  )
}

export function AdminDateField({
  label,
  name,
  defaultValue,
  className,
}: {
  label: string
  name: string
  defaultValue?: string
  className?: string
}) {
  return (
    <label className={cn('admin-list-select', className)}>
      <span>{label}</span>
      <input name={name} type="date" defaultValue={defaultValue} aria-label={label} />
      <LocalIcon name="calendar-days" className="admin-list-select-chevron h-4 w-4" />
    </label>
  )
}

export function AdminFiltersButton({ label = 'Filters' }: { label?: string }) {
  return (
    <button type="submit" className="admin-list-filter-button">
      <span>{label}</span>
      <LocalIcon name="sliders-horizontal" className="h-[1.125rem] w-[1.125rem]" />
    </button>
  )
}

export function AdminListAction({
  href,
  children,
  icon,
  primary = false,
  download,
}: {
  href: string
  children: ReactNode
  icon?: 'plus' | 'download' | 'arrow-right'
  primary?: boolean
  download?: boolean
}) {
  return (
    <Link
      href={href}
      download={download || undefined}
      className={cn('admin-list-action', primary && 'admin-list-action-primary')}
    >
      {children}
      {icon ? <LocalIcon name={icon} className="h-[1.125rem] w-[1.125rem]" /> : null}
    </Link>
  )
}

export function AdminListSummary({ strong, detail }: { strong: ReactNode; detail?: ReactNode }) {
  return (
    <div className="admin-list-summary">
      <strong>{strong}</strong>
      {detail ? <span>{detail}</span> : null}
    </div>
  )
}

export function AdminListPagination({
  page,
  totalPages,
  summary,
  pageHref,
}: {
  page: number
  totalPages: number
  summary: ReactNode
  pageHref: (page: number) => string
}) {
  return (
    <footer className="admin-list-pagination">
      <p>{summary}</p>
      {totalPages > 1 ? (
        <nav aria-label="Pagination">
          <Link
            href={pageHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : undefined}
            className={cn(page <= 1 && 'pointer-events-none opacity-40')}
            aria-label="Previous page"
          >
            <LocalIcon name="chevron-right" className="h-4 w-4 rotate-180" />
          </Link>
          <span aria-current="page">{page}</span>
          <Link
            href={pageHref(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            tabIndex={page >= totalPages ? -1 : undefined}
            className={cn(page >= totalPages && 'pointer-events-none opacity-40')}
            aria-label="Next page"
          >
            <LocalIcon name="chevron-right" className="h-4 w-4" />
          </Link>
        </nav>
      ) : null}
    </footer>
  )
}
