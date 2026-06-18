import Link from 'next/link'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
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

const HOME_PRODUCT_IMAGE_SIZES = '(max-width: 559px) 50vw, (max-width: 767px) 33vw, (max-width: 1120px) 25vw, (max-width: 1536px) 20vw, 16vw'

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
            View all <LocalIcon name="chevron-right" className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className={cn(
        'product-grid-rhythm grid grid-cols-2 gap-x-2.5 gap-y-3.5 min-[560px]:grid-cols-3 min-[560px]:gap-x-3 min-[560px]:gap-y-4 md:grid-cols-4 lg:gap-x-4 lg:gap-y-6 min-[1120px]:grid-cols-5 2xl:grid-cols-6',
        gridClassName,
      )}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} imageSizes={HOME_PRODUCT_IMAGE_SIZES} />
        ))}
      </div>
    </div>
  )
}
