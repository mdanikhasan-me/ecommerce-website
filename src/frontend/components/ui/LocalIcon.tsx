import type { CSSProperties } from 'react'

import { cn } from '@/backend/utils'
import {
  STOREFRONT_ICON_ASSETS,
  StorefrontIconName,
} from '@/shared/storefront-icons'

type LocalIconProps = {
  name: StorefrontIconName
  className?: string
  title?: string
  decorative?: boolean
}

type LocalIconStyle = CSSProperties & {
  '--local-icon-url': string
}

export function LocalIcon({
  name,
  className,
  title,
  decorative = true,
}: LocalIconProps) {
  return (
    <span
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'img'}
      title={title}
      className={cn('local-icon inline-block h-4 w-4 shrink-0', className)}
      style={{ '--local-icon-url': `url(${STOREFRONT_ICON_ASSETS[name]})` } as LocalIconStyle}
    />
  )
}
