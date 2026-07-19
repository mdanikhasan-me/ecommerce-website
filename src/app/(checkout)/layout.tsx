import Link from 'next/link'
import { BoilabinLogo } from '@/frontend/components/layout/BoilabinLogo'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f7f7f5] text-foreground">
      <header className="border-b border-black/10 bg-background">
        <div className="checkout-frame flex h-16 items-center justify-between sm:h-[5.375rem]">
          <Link href="/" aria-label="Boilabin home" className="inline-flex min-h-11 items-center rounded-lg focus-visible:bg-secondary/70">
            <BoilabinLogo variant="full" size={32} priority className="h-7 w-auto sm:h-8" />
          </Link>
          <Link
            href="/cart"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-foreground focus-visible:bg-secondary/70"
          >
            <LocalIcon name="arrow-left" className="h-4 w-4" />
            Back to cart
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
