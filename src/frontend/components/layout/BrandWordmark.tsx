import type { HTMLAttributes } from 'react'
import Image from 'next/image'
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
        <Image
          src={BRAND_ASSETS.wordmark}
          alt=""
          aria-hidden="true"
          width={2380}
          height={560}
          sizes="(max-width: 559px) 128px, (max-width: 1279px) 148px, 192px"
          unoptimized
          decoding="async"
          draggable={false}
          className="block h-auto w-full"
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
