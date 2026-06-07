import { cn } from '@/backend/utils'
import type { StorefrontIconName } from '@/shared/storefront-icons'

type LocalIconProps = {
  name: StorefrontIconName
  className?: string
  title?: string
  decorative?: boolean
}

function localIconMaskClass(name: StorefrontIconName) {
  return `local-icon--${name}`
}

export function LocalIcon({
  name,
  className,
  title,
  decorative = true,
}: LocalIconProps) {
  const maskClassName = localIconMaskClass(name)

  if (decorative) {
    return (
      <span
        aria-hidden="true"
        title={title}
        className={cn('local-icon inline-block h-4 w-4 shrink-0', maskClassName, className)}
      />
    )
  }

  return (
    <span
      role="img"
      aria-label={title ?? name.replace(/-/g, ' ')}
      title={title}
      className={cn('local-icon inline-block h-4 w-4 shrink-0', maskClassName, className)}
    />
  )
}
