'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import type { Toast } from 'react-hot-toast'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

const Toaster = dynamic(
  () => import('react-hot-toast').then((module) => module.Toaster),
  { ssr: false },
)

function FastToast({ toastItem }: { toastItem: Toast }) {
  const message = typeof toastItem.message === 'function'
    ? toastItem.message(toastItem)
    : toastItem.message
  const isError = toastItem.type === 'error'
  const isVisible = toastItem.visible && toastItem.height !== undefined

  return (
    <div
      {...toastItem.ariaProps}
      className="boilabin-toast flex items-center gap-2 transition-[opacity,transform] duration-100 ease-out motion-reduce:transition-none"
      style={{
        ...toastItem.style,
        opacity: isVisible ? 1 : 0,
        pointerEvents: 'auto',
        transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, -4px, 0)',
      }}
    >
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${isError ? 'bg-destructive' : 'bg-emerald-600'}`}>
        <LocalIcon name={isError ? 'x' : 'check'} className="h-3 w-3" />
      </span>
      <span>{message}</span>
    </div>
  )
}

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
      gutter={6}
      containerStyle={{
        top: 'calc(env(safe-area-inset-top) + 76px)',
      }}
      toastOptions={{
        duration: 1100,
        removeDelay: 120,
        className: 'boilabin-toast',
        style: {
          fontFamily: 'var(--font-sans)',
          background: 'transparent',
          color: 'hsl(var(--foreground))',
          boxShadow: 'none',
          fontSize: '13px',
          fontWeight: 600,
          lineHeight: 1.25,
          minWidth: '0',
          maxWidth: 'min(300px, calc(100vw - 32px))',
          padding: '0',
        },
        error: {
          duration: 1600,
        },
      }}
    >
      {(toastItem) => <FastToast toastItem={toastItem} />}
    </Toaster>
  )
}
