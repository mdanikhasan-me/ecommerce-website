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

const HOME_PRODUCT_IMAGE_SIZES = '(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw'

export function ProductGrid({ title, subtitle, products, viewAllHref }: ProductGridProps) {
  return (
    <div className="w-full">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="editorial-link group shrink-0"
          >
            View all <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} imageSizes={HOME_PRODUCT_IMAGE_SIZES} />
        ))}
      </div>
    </div>
  )
}
