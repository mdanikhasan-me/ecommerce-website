'use client'

import { cn } from '@/backend/utils'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { useState } from 'react'
import toast from 'react-hot-toast'

type CopyOrderNumberButtonProps = {
  orderNumber: string
  className?: string
}

export function CopyOrderNumberButton({ orderNumber, className }: CopyOrderNumberButtonProps) {
  const [copied, setCopied] = useState(false)

  const copyOrderNumber = async () => {
    if (!navigator.clipboard?.writeText) {
      toast.error('Copy is not available')
      return
    }

    try {
      await navigator.clipboard.writeText(orderNumber)
      setCopied(true)
      toast.success('Order ID copied')
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Could not copy order ID')
    }
  }

  return (
    <button
      type="button"
      onClick={copyOrderNumber}
      aria-label="Copy order ID"
      title="Copy order ID"
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors md:hover:bg-secondary md:hover:text-foreground',
        className,
      )}
    >
      {copied ? <LocalIcon name="check" className="h-4 w-4" /> : <LocalIcon name="copy" className="h-4 w-4" />}
    </button>
  )
}
