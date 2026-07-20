import Link from 'next/link'
import { AccountAvatar } from '@/frontend/components/account/AccountAvatar'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

type AccountInformationCardProps = {
  user: { name: string | null; email: string; phone: string | null; image: string | null }
}

export function AccountInformationCard({ user }: AccountInformationCardProps) {
  return (
    <section aria-labelledby="account-information-heading" className="rounded-lg border border-border bg-card p-4 sm:p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id="account-information-heading" className="font-display text-lg font-semibold tracking-[-0.02em]">Account Information</h2>
        <Link href="/account/profile" className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold transition-colors hover:bg-black/[0.025]">
          <LocalIcon name="pencil" className="h-4 w-4" /> Edit
        </Link>
      </div>
      <div className="flex items-center gap-4 sm:gap-5">
        <AccountAvatar imageUrl={user.image} name={user.name} className="h-14 w-14 sm:h-16 sm:w-16" fallbackClassName="text-xl text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold sm:text-lg">{user.name || 'Boilabin customer'}</p>
          <p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p>
          <p className="mt-1 text-sm text-muted-foreground">{user.phone || 'No phone number added'}</p>
        </div>
      </div>
    </section>
  )
}
