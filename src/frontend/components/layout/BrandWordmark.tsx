import type { HTMLAttributes } from 'react'
import { cn } from '@/backend/utils'

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
    return <span {...props} className={cn('brand-wordmark-art', className)} />
  }

  return (
    <span {...props} className={cn('brand-wordmark', className)}>
      {children}
    </span>
  )
}
