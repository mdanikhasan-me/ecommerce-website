import Image from 'next/image'
import { cn } from '@/backend/utils'
import { BRAND_ASSETS } from '@/shared/assets'

type LogoVariant = 'mark' | 'mark-light' | 'wordmark' | 'full' | 'lockup'

type LogoProps = {
  className?: string
  variant?: LogoVariant
  size?: number
  priority?: boolean
}

const VARIANT_MAP: Record<LogoVariant, { src: string; w: number; h: number; alt: string }> = {
  mark:         { src: BRAND_ASSETS.mark,         w: 510, h: 350, alt: 'Boilabin' },
  'mark-light': { src: BRAND_ASSETS.markLight,    w: 510, h: 350, alt: 'Boilabin' },
  wordmark:     { src: BRAND_ASSETS.wordmark,     w: 420, h: 105, alt: 'Boilabin' },
  full:         { src: BRAND_ASSETS.wordmarkFull, w: 510, h: 455, alt: 'Boilabin' },
  lockup:       { src: BRAND_ASSETS.lockup,       w: 794, h: 794, alt: 'Boilabin' },
}

export function BoilabinLogo({ className, variant = 'mark', size = 44, priority }: LogoProps) {
  const cfg = VARIANT_MAP[variant]
  const ratio = cfg.w / cfg.h
  const height = size
  const width = Math.round(size * ratio)

  return (
    <Image
      src={cfg.src}
      alt={cfg.alt}
      width={width}
      height={height}
      priority={priority}
      className={cn('shrink-0 select-none', className)}
      draggable={false}
    />
  )
}
