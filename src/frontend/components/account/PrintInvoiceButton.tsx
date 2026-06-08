'use client'

import { Printer } from 'lucide-react'

export function PrintInvoiceButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
    >
      <Printer className="h-4 w-4" />
      Print / Save PDF
    </button>
  )
}
