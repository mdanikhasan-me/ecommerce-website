import { Header } from '@/frontend/components/layout/Header'
import { Footer } from '@/frontend/components/layout/Footer'
import { LazyCartDrawer } from '@/frontend/components/cart/LazyCartDrawer'
import { LazyProductCardActionsController } from '@/frontend/components/product/LazyProductCardActionsController'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full min-w-0 max-w-full flex-col overflow-x-clip">
      <Header />
      <main className="w-full min-w-0 max-w-full flex-1">{children}</main>
      <Footer />
      <LazyCartDrawer />
      <LazyProductCardActionsController />
    </div>
  )
}
