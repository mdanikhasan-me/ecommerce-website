import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { ProductCardData } from '@/backend/types'

interface ProductGridProps {
  title: string
  subtitle?: string
  products: ProductCardData[]
  viewAllHref?: string
}

export function ProductGrid({ title, subtitle, products, viewAllHref }: ProductGridProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-sm text-primary font-medium hover:gap-2 transition-all"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
