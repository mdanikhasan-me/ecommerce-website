'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const Toaster = dynamic(
  () => import('react-hot-toast').then((module) => module.Toaster),
  { ssr: false },
)

export function DeferredToaster() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const show = () => setIsReady(true)
    window.addEventListener('boilabin:toast-needed', show, { once: true })

    const browserWindow = window as typeof window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    const idleId = browserWindow.requestIdleCallback?.(show, { timeout: 2500 })
    const timerId = idleId === undefined ? window.setTimeout(show, 1500) : undefined

    return () => {
      window.removeEventListener('boilabin:toast-needed', show)
      if (idleId !== undefined) browserWindow.cancelIdleCallback?.(idleId)
      if (timerId !== undefined) window.clearTimeout(timerId)
    }
  }, [])

  if (!isReady) return null

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          fontFamily: 'var(--font-sans)',
          borderRadius: '8px',
          background: 'hsl(270 36% 18%)',
          color: '#fff',
          fontSize: '13px',
          padding: '10px 16px',
        },
        success: {
          iconTheme: { primary: 'hsl(164 36% 50%)', secondary: '#fff' },
        },
      }}
    />
  )
}
