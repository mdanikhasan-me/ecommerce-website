import { auth } from '@/backend/auth'
import { redirect } from 'next/navigation'
import { db } from '@/backend/database'
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
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="size-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">⏳</span>
          </div>
          <h1 className="font-display text-2xl font-bold mb-3">Application Under Review</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your seller application is being reviewed by our team. We will notify you within 1 to 2 business days.
          </p>
        </div>
      </div>
    )
  }

  if (seller.status !== 'APPROVED') {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="size-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="font-display text-2xl font-bold mb-3">Store Access Restricted</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your store is not currently active. Please contact support for assistance.
          </p>
        </div>
      </div>
    )
  }

  return (
    <SellerShell storeName={seller.storeName}>
      {children}
    </SellerShell>
  )
}
