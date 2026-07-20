import Link from 'next/link'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

type AddressSummary = {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string | null
  city: string
  district: string
  division: string
  isDefault: boolean
}

export function SavedAddressCard({ address }: { address: AddressSummary | null }) {
  return (
    <section aria-labelledby="saved-addresses-heading" className="rounded-lg border border-border bg-card p-4 sm:p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="saved-addresses-heading" className="font-display text-lg font-semibold tracking-[-0.02em]">Saved Addresses</h2>
        <Link href="/account/addresses" className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold transition-colors hover:bg-black/[0.025]">
          <LocalIcon name="settings" className="h-4 w-4" />
          <span className="hidden sm:inline">Manage Addresses</span>
          <span className="sm:hidden">Manage</span>
        </Link>
      </div>

      {address ? (
        <Link href="/account/addresses" className="group grid grid-cols-[3.25rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:gap-4">
          <span className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-lg border border-border sm:h-14 sm:w-14">
            <LocalIcon name="location" className="h-6 w-6" />
          </span>
          <span className="min-w-0 text-sm leading-5 sm:text-[0.95rem] sm:leading-6">
            <strong className="block truncate font-semibold text-foreground">{address.fullName}</strong>
            <span className="block text-muted-foreground">{address.addressLine1}</span>
            {address.addressLine2 ? <span className="block text-muted-foreground">{address.addressLine2}</span> : null}
            <span className="block text-muted-foreground">{address.city}, {address.district}, {address.division}</span>
            <span className="block text-muted-foreground">{address.phone}</span>
          </span>
          <span className="col-start-2 flex items-center justify-end gap-3 sm:col-start-3 sm:gap-6">
            {address.isDefault ? <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Default</span> : null}
            <LocalIcon name="chevron-right" className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ) : (
        <div className="flex items-center justify-between gap-4 rounded-lg bg-secondary/45 p-4">
          <p className="text-sm text-muted-foreground">No saved delivery address yet.</p>
          <Link href="/account/addresses" className="shrink-0 text-sm font-semibold text-primary">Add address</Link>
        </div>
      )}
    </section>
  )
}
