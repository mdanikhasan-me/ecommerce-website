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
