import { Header } from '@/frontend/components/layout/Header'
import { Footer } from '@/frontend/components/layout/Footer'
import { LazyCartDrawer } from '@/frontend/components/cart/LazyCartDrawer'
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
        <LazyCartDrawer />
      </div>
    </Providers>
  )
}
