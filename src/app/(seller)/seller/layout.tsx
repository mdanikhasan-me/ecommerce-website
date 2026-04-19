import { auth } from '@/backend/auth'
import { redirect } from 'next/navigation'
import { db } from '@/backend/database'
import { Clock3, AlertTriangle } from 'lucide-react'
import { SellerShell } from '@/frontend/components/seller/SellerShell'

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const seller = await db.seller.findUnique({
    where: { userId: session.user.id },
    select: { id: true, status: true, storeName: true },
  })

  if (!seller) redirect('/seller/register')

  if (seller.status === 'PENDING') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <div className="max-w-md px-6 text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-amber-100">
            <Clock3 className="h-8 w-8 text-amber-700" />
          </div>
          <h1 className="mb-3 font-display text-2xl font-bold">Application Under Review</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your seller application is being reviewed by our team. We will notify you within 1 to 2 business days.
          </p>
        </div>
      </div>
    )
  }

  if (seller.status !== 'APPROVED') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <div className="max-w-md px-6 text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mb-3 font-display text-2xl font-bold">Store Access Restricted</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your store is not currently active. Please contact support for assistance.
          </p>
        </div>
      </div>
    )
  }

  return <SellerShell storeName={seller.storeName}>{children}</SellerShell>
}
