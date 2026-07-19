'use client'

import { useEffect, useRef, useState } from 'react'

import { NotificationComposer } from '@/frontend/components/admin/NotificationComposer'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

export function NotificationComposerDialog({
  users,
}: {
  users: Array<{ id: string; name: string | null; email: string }>
}) {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus({ preventScroll: true })
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="admin-list-action admin-list-action-primary">
        Send notification <LocalIcon name="send" className="h-[1.125rem] w-[1.125rem]" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/45 sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false)
        }}>
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-composer-title"
            tabIndex={-1}
            className="admin-card max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-b-none sm:rounded-[0.75rem]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-5">
              <div>
                <h2 id="notification-composer-title" className="admin-section-title">Send notification</h2>
                <p className="mt-1 text-xs text-muted-foreground">Choose the audience, purpose and destination.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="admin-icon-button" aria-label="Close notification composer">
                <LocalIcon name="x" className="h-4 w-4" />
              </button>
            </div>
            <NotificationComposer users={users} />
          </div>
        </div>
      ) : null}
    </>
  )
}
