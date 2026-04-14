import { Header } from '@/frontend/components/layout/Header'
import { Footer } from '@/frontend/components/layout/Footer'
import { CartDrawer } from '@/frontend/components/cart/CartDrawer'
import { Providers } from '@/frontend/components/ui/Providers'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
      </div>
    </Providers>
  )
}
