'use client'

import { useState } from 'react'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

type OrderProductThumbnailProps = {
  imageUrl: string | null
  fallbackImageUrl?: string | null
  alt: string
}

/** Keeps historic order thumbnails useful when an old image snapshot no longer resolves. */
export function OrderProductThumbnail({ imageUrl, fallbackImageUrl, alt }: OrderProductThumbnailProps) {
  const [source, setSource] = useState(imageUrl ?? fallbackImageUrl ?? null)

  if (!source) {
    return <span className="flex h-full w-full items-center justify-center"><LocalIcon name="package" className="h-5 w-5 text-muted-foreground" /></span>
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={source}
      alt={alt}
      className="h-full w-full object-contain p-1"
      loading="lazy"
      decoding="async"
      onError={() => {
        if (fallbackImageUrl && source !== fallbackImageUrl) {
          setSource(fallbackImageUrl)
          return
        }
        setSource(null)
      }}
    />
  )
}
