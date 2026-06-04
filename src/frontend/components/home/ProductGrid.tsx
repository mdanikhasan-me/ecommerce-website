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
      <div className="mb-5 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2 className="section-title">{title}</h2>
          {subtitle ? <p className="mt-2 max-w-[40rem] text-sm leading-6 text-muted-foreground">{subtitle}</p> : null}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="editorial-link group w-fit shrink-0"
          >
            View all <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:gap-5 xl:grid-cols-5 2xl:grid-cols-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} imageSizes={HOME_PRODUCT_IMAGE_SIZES} />
        ))}
      </div>
    </div>
  )
}
