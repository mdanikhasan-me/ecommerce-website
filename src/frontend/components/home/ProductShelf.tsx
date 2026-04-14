import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { ProductCardData } from '@/backend/types'

interface ProductShelfProps {
  title: string
  subtitle?: string
  products: ProductCardData[]
  viewAllHref?: string
}

export function ProductShelf({ title, subtitle, products, viewAllHref }: ProductShelfProps) {
  return (
    <section className="container-site py-8">
      <div className="surface-panel p-6 sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker">Curated products</p>
            <h2 className="section-title mt-3">{title}</h2>
            {subtitle && <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">{subtitle}</p>}
          </div>

          {viewAllHref && (
            <Link href={viewAllHref} className="inline-link">
              View collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
