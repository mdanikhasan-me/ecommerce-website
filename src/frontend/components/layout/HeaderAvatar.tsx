'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/backend/utils'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

export function HeaderAvatar({
  imageUrl,
  className = 'h-8 w-8 rounded-full',
  iconClassName = 'h-5 w-5',
}: {
  imageUrl?: string | null
  className?: string
  iconClassName?: string
}) {
  const normalizedImageUrl = imageUrl?.trim() ?? ''
  const [hasImageError, setHasImageError] = useState(false)

  useEffect(() => {
    setHasImageError(false)
  }, [normalizedImageUrl])

  if (!normalizedImageUrl || hasImageError) {
    return <LocalIcon name="user" className={iconClassName} />
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={normalizedImageUrl}
      alt=""
      className={cn('object-cover', className)}
      referrerPolicy="no-referrer"
      onError={() => setHasImageError(true)}
    />
  )
}
