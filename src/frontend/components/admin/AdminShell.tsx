'use client'

import { useEffect, useRef, useState } from 'react'
import { AdminHeader, type AdminTheme } from '@/frontend/components/admin/AdminHeader'
import { AdminSidebar } from '@/frontend/components/admin/AdminSidebar'
import { cn } from '@/backend/utils'

type AdminShellProps = {
  user: { name?: string | null; email?: string | null; image?: string | null; role: string }
  unreadCount: number
  initialTheme: AdminTheme
  children: React.ReactNode
}

export function AdminShell({ user, unreadCount, initialTheme, children }: AdminShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [theme, setTheme] = useState<AdminTheme>(initialTheme)
  const drawerRef = useRef<HTMLDivElement>(null)
  const menuTriggerRef = useRef<HTMLElement | null>(null)

  const openMenu = () => {
    menuTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setIsMenuOpen(true)
  }
  const closeMenu = () => {
    setIsMenuOpen(false)
    window.requestAnimationFrame(() => menuTriggerRef.current?.focus({ preventScroll: true }))
  }

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light'
      const secure = window.location.protocol === 'https:' ? '; Secure' : ''
      document.cookie = `boilabin-admin-theme=${nextTheme}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`
      return nextTheme
    })
  }

  useEffect(() => {
    document.documentElement.dataset.adminTheme = theme
    document.documentElement.style.colorScheme = theme
    return () => {
      delete document.documentElement.dataset.adminTheme
      document.documentElement.style.removeProperty('color-scheme')
    }
  }, [theme])

  useEffect(() => {
    if (isMenuOpen) drawerRef.current?.focus({ preventScroll: true })
  }, [isMenuOpen])

  useEffect(() => {
    if (!isMenuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleDrawerKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu()
        return
      }
      if (event.key !== 'Tab') return

      const drawer = drawerRef.current
      if (!drawer) return
      const focusableElements = Array.from(drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.getClientRects().length > 0)
      const first = focusableElements[0]
      const last = focusableElements.at(-1)
      if (!first || !last) {
        event.preventDefault()
        drawer.focus({ preventScroll: true })
        return
      }

      const activeElement = document.activeElement
      if (event.shiftKey && (activeElement === first || activeElement === drawer || !drawer.contains(activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (activeElement === last || !drawer.contains(activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleDrawerKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleDrawerKeyDown)
    }
  }, [isMenuOpen])

  return (
    <div data-admin-theme={theme} className="admin-ui admin-shell flex overflow-hidden bg-background text-foreground">
      <AdminSidebar theme={theme} className="hidden xl:flex" />

      <div
        aria-hidden={!isMenuOpen}
        inert={isMenuOpen ? undefined : true}
        className={cn(
          'fixed inset-0 z-50 overflow-hidden xl:hidden',
          isMenuOpen
            ? 'visible pointer-events-auto delay-0'
            : 'invisible pointer-events-none delay-150'
        )}
      >
        <button
          type="button"
          aria-label="Close admin navigation"
          className={cn(
            'absolute inset-0 touch-none bg-slate-950/45',
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={closeMenu}
        />
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
          tabIndex={-1}
          className={cn(
            'absolute inset-y-0 left-0 flex w-[17rem] max-w-[calc(100vw-1rem)] -translate-x-full flex-col outline-none transition-transform duration-100 ease-out motion-reduce:transition-none',
            isMenuOpen && 'translate-x-0'
          )}
        >
          <AdminSidebar
            theme={theme}
            variant="drawer"
            className="h-full w-full"
            onNavigate={closeMenu}
            onClose={closeMenu}
            onThemeToggle={toggleTheme}
          />
        </div>
      </div>

      <div className="admin-workspace flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader
          user={user}
          unreadCount={unreadCount}
          theme={theme}
          onMenuClick={openMenu}
          onThemeToggle={toggleTheme}
        />
        <main className="admin-main flex-1 overflow-y-auto bg-background">
          <div className="admin-content w-full py-4 sm:py-6 lg:py-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
