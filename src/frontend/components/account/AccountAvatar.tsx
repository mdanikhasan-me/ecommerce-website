'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/backend/utils'

type AccountAvatarProps = {
  imageUrl?: string | null
  name?: string | null
  className?: string
  fallbackClassName?: string
}

export function AccountAvatar({
  imageUrl,
  name,
  className,
  fallbackClassName,
}: AccountAvatarProps) {
  const normalizedImageUrl = imageUrl?.trim() ?? ''
  const [hasImageError, setHasImageError] = useState(false)
  const initial = (name?.trim()?.[0] ?? 'U').toUpperCase()

  useEffect(() => {
    setHasImageError(false)
  }, [normalizedImageUrl])

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-foreground',
        className,
      )}
    >
      {normalizedImageUrl && !hasImageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={normalizedImageUrl}
          alt=""
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setHasImageError(true)}
        />
      ) : (
        <span className={cn('font-display text-xl font-bold', fallbackClassName)}>
          {initial}
        </span>
      )}
    </span>
  )
}
