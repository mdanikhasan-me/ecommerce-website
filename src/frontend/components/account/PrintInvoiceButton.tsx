'use client'

import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

export function PrintInvoiceButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors min-[1025px]:hover:bg-primary/90"
    >
      <LocalIcon name="printer" className="h-4 w-4" />
      Print
    </button>
  )
}
