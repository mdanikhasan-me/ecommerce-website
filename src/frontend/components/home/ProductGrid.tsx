import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { ProductCardData } from '@/backend/types'
import { cn } from '@/backend/utils'

interface ProductGridProps {
  title: string
  subtitle?: string
  eyebrow?: string
  products: ProductCardData[]
  viewAllHref?: string
  className?: string
  gridClassName?: string
}

const HOME_PRODUCT_IMAGE_SIZES = '(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw'

export function ProductGrid({
  title,
  subtitle,
  eyebrow,
  products,
  viewAllHref,
  className,
  gridClassName,
}: ProductGridProps) {
  const viewAllLabel = `View all ${title.toLowerCase()}`

  return (
    <div className={cn('product-section-rhythm w-full', className)}>
      <div className="product-section-header">
        <div className="min-w-0">
          {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
          <h2 className={cn('section-title', eyebrow && 'mt-2')}>{title}</h2>
          {subtitle ? <p className="mt-2 max-w-[40rem] text-sm leading-6 text-muted-foreground">{subtitle}</p> : null}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="editorial-link group w-fit shrink-0"
            aria-label={viewAllLabel}
          >
            View all <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      <div className={cn(
        'product-grid-rhythm grid grid-cols-2 gap-x-2.5 gap-y-3.5 sm:grid-cols-3 sm:gap-x-3.5 sm:gap-y-5 md:grid-cols-4 lg:gap-x-4 lg:gap-y-6',
        gridClassName,
      )}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} imageSizes={HOME_PRODUCT_IMAGE_SIZES} />
        ))}
      </div>
    </div>
  )
}
