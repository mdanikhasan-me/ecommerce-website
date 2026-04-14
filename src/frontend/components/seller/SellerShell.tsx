'use client'

import { SellerSidebar } from './SellerSidebar'

interface SellerShellProps {
  storeName: string
  children: React.ReactNode
}

export function SellerShell({ storeName, children }: SellerShellProps) {
  return (
    <div className="flex min-h-screen bg-secondary">
      <SellerSidebar storeName={storeName} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
