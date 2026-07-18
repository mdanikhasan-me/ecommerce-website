import type { HTMLAttributes } from 'react'
import { cn } from '@/backend/utils'
import { BRAND_ASSETS } from '@/shared/assets'

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: 'text' | 'art'
}

export function BrandWordmark({
  className,
  children = 'Boilabin',
  variant = 'text',
  ...props
}: BrandWordmarkProps) {
  if (variant === 'art') {
    return (
      <span {...props} className={cn('brand-wordmark-art', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BRAND_ASSETS.wordmark}
          alt=""
          aria-hidden="true"
          width={466}
          height={94.25}
          decoding="async"
          draggable={false}
          className="block h-full w-auto max-w-none"
        />
      </span>
    )
  }

  return (
    <span {...props} className={cn('brand-wordmark', className)}>
      {children}
    </span>
  )
}
