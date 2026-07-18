import Link from 'next/link'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { ProductCardData } from '@/backend/types'
import { cn } from '@/backend/utils'

interface ProductGridProps {
  title: string
  subtitle?: string
  products: ProductCardData[]
  viewAllHref?: string
  className?: string
  gridClassName?: string
}

const HOME_PRODUCT_IMAGE_SIZES = '(max-width: 639px) 44vw, (max-width: 1023px) 31vw, (max-width: 1279px) 25vw, (max-width: 1535px) 20vw, 250px'

export function ProductGrid({
  title,
  subtitle,
  products,
  viewAllHref,
  className,
  gridClassName,
}: ProductGridProps) {
  const viewAllLabel = `View all ${title.toLowerCase()}`

  return (
    <div className={cn('home-product-grid product-list-scope product-section-rhythm w-full', className)}>
      <div className="product-section-header">
        <div className="min-w-0">
          <h2 className="section-title">{title}</h2>
          {subtitle ? <p className="mt-2 max-w-[40rem] text-sm leading-6 text-muted-foreground">{subtitle}</p> : null}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="editorial-link group w-fit shrink-0"
            aria-label={viewAllLabel}
          >
            View all <LocalIcon name="chevron-right" className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className={cn(
        'product-grid-rhythm product-list-grid',
        gridClassName,
      )}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} className="home-product-card" imageSizes={HOME_PRODUCT_IMAGE_SIZES} titleHeadingLevel={3} />
        ))}
      </div>
    </div>
  )
}
