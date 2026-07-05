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

    return () => {
      window.removeEventListener('boilabin:toast-needed', show)
    }
  }, [])

  if (!isReady) return null

  return (
    <Toaster
      position="top-right"
      gutter={6}
      containerStyle={{
        top: 'calc(env(safe-area-inset-top) + 76px)',
        right: '16px',
      }}
      toastOptions={{
        duration: 1800,
        className: 'boilabin-toast',
        style: {
          fontFamily: 'var(--font-sans)',
          borderRadius: '10px',
          border: '1px solid hsl(var(--border) / 0.9)',
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          boxShadow: 'none',
          fontSize: '13px',
          fontWeight: 600,
          lineHeight: 1.25,
          minWidth: '0',
          maxWidth: 'min(300px, calc(100vw - 32px))',
          padding: '8px 10px',
        },
        success: {
          iconTheme: { primary: 'hsl(154 58% 38%)', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: 'hsl(var(--destructive))', secondary: '#fff' },
        },
      }}
    />
  )
}
