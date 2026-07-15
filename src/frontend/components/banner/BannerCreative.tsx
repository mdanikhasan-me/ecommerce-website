/* eslint-disable @next/next/no-img-element */
import { forwardRef, type HTMLAttributes } from 'react'
import Link from 'next/link'
import { cn } from '@/backend/utils'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import {
  BANNER_BUTTON_BASE_CLASS,
  BANNER_BUTTON_CLASSES,
  BANNER_TEXT_CLASSES,
  BANNER_TYPOGRAPHY_CLASSES,
  getBannerImageShadeStyle,
  getBannerTextEdgeClass,
  normalizeBannerButtonStyle,
  normalizeBannerImageShade,
  normalizeBannerTextTone,
  normalizeBannerTitleStyle,
} from '@/shared/banner-presentation'

export type BannerCreativeMode = 'responsive' | 'desktop' | 'tablet' | 'mobile'

export interface BannerCreativeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string
  subtitle?: string | null
  desktopImageUrl?: string | null
  tabletImageUrl?: string | null
  mobileImageUrl?: string | null
  linkUrl?: string | null
  buttonLabel?: string | null
  buttonStyle?: string | null
  titleStyle?: string | null
  textPosition?: string | null
  textTone?: string | null
  imageShade?: string | null
  textEdge?: boolean | null
  mode?: BannerCreativeMode
  preview?: boolean
  priority?: boolean
  mediaClassName?: string
  contentClassName?: string
}

const FRAME_CLASSES: Record<BannerCreativeMode, string> = {
  responsive: 'aspect-[5/4] sm:aspect-video xl:aspect-[21/9]',
  desktop: 'aspect-[21/9]',
  tablet: 'aspect-video',
  mobile: 'aspect-[5/4]',
}

const TITLE_SIZE_CLASSES: Record<BannerCreativeMode, string> = {
  responsive: 'text-[clamp(1.35rem,5.8cqw,1.7rem)] sm:text-[clamp(2rem,4.25cqw,3.25rem)] xl:text-[clamp(3.2rem,3.8cqw,4.75rem)]',
  desktop: 'text-[clamp(3.2rem,3.8cqw,4.75rem)]',
  tablet: 'text-[clamp(2rem,4.25cqw,3.25rem)]',
  mobile: 'text-[clamp(1.35rem,5.8cqw,1.7rem)]',
}

const PREVIEW_TITLE_SIZE_CLASSES: Record<BannerCreativeMode, string> = {
  responsive: '',
  desktop: 'text-[3.8cqw]',
  tablet: 'text-[4.25cqw]',
  mobile: 'text-[5.8cqw]',
}

const SUBTITLE_SIZE_CLASSES: Record<BannerCreativeMode, string> = {
  responsive: 'text-[clamp(0.76rem,3.1cqw,0.88rem)] sm:text-[clamp(0.85rem,1.45cqw,1rem)] xl:text-[clamp(0.95rem,1.05cqw,1.125rem)]',
  desktop: 'text-[clamp(0.95rem,1.05cqw,1.125rem)]',
  tablet: 'text-[clamp(0.85rem,1.45cqw,1rem)]',
  mobile: 'text-[clamp(0.76rem,3.1cqw,0.88rem)]',
}

const PREVIEW_SUBTITLE_SIZE_CLASSES: Record<BannerCreativeMode, string> = {
  responsive: '',
  desktop: 'text-[1.05cqw]',
  tablet: 'text-[1.45cqw]',
  mobile: 'text-[3.1cqw]',
}

const PREVIEW_BUTTON_SIZE_CLASSES: Record<BannerCreativeMode, string> = {
  responsive: '',
  desktop: '!text-[0.95cqw]',
  tablet: '!text-[1.7cqw]',
  mobile: '!text-[3.35cqw]',
}

function normalizePosition(value: string | null | undefined) {
  return value === 'center' || value === 'right' ? value : 'left'
}

function BannerMedia({
  desktopImageUrl,
  tabletImageUrl,
  mobileImageUrl,
  title,
  mode,
  priority,
  className,
}: {
  desktopImageUrl: string
  tabletImageUrl: string
  mobileImageUrl: string
  title: string
  mode: BannerCreativeMode
  priority: boolean
  className?: string
}) {
  const imageClassName = cn('absolute inset-0 h-full w-full max-w-none object-cover', className)
  const altText = title || 'Promotional banner'
  const imageProps = {
    className: imageClassName,
    decoding: priority ? 'sync' as const : 'async' as const,
    fetchPriority: priority ? 'high' as const : 'auto' as const,
    loading: priority ? 'eager' as const : 'lazy' as const,
  }

  if (mode === 'desktop') return <img src={desktopImageUrl} alt={altText} {...imageProps} />
  if (mode === 'tablet') return <img src={tabletImageUrl} alt={altText} {...imageProps} />
  if (mode === 'mobile') return <img src={mobileImageUrl} alt={altText} {...imageProps} />

  if (desktopImageUrl === tabletImageUrl && tabletImageUrl === mobileImageUrl) {
    return <img src={desktopImageUrl} alt={altText} {...imageProps} />
  }

  return (
    <picture className="absolute inset-0 block h-full w-full">
      <source media="(max-width: 639px)" srcSet={mobileImageUrl} />
      <source media="(max-width: 1279px)" srcSet={tabletImageUrl} />
      <img src={desktopImageUrl} alt={altText} {...imageProps} />
    </picture>
  )
}

export const BannerCreative = forwardRef<HTMLDivElement, BannerCreativeProps>(function BannerCreative({
  title,
  subtitle,
  desktopImageUrl,
  tabletImageUrl,
  mobileImageUrl,
  linkUrl,
  buttonLabel,
  buttonStyle,
  titleStyle,
  textPosition,
  textTone,
  imageShade,
  textEdge,
  mode = 'responsive',
  preview = false,
  priority = false,
  mediaClassName,
  contentClassName,
  className,
  ...rootProps
}, ref) {
  const cleanTitle = title.trim()
  const cleanSubtitle = subtitle?.trim() ?? ''
  const desktopSrc = desktopImageUrl?.trim() || tabletImageUrl?.trim() || mobileImageUrl?.trim() || ''
  const tabletSrc = tabletImageUrl?.trim() || desktopSrc
  const mobileSrc = mobileImageUrl?.trim() || tabletSrc
  const position = normalizePosition(textPosition)
  const tone = normalizeBannerTextTone(textTone)
  const typography = BANNER_TYPOGRAPHY_CLASSES[normalizeBannerTitleStyle(titleStyle)]
  const shade = normalizeBannerImageShade(imageShade, tone)
  const ctaStyle = normalizeBannerButtonStyle(buttonStyle)
  const contentPositionClass = {
    left: 'mr-auto items-start text-left',
    center: 'mx-auto items-center text-center',
    right: 'ml-auto items-end text-right',
  }[position]
  const contentWidthClass = position === 'center' ? 'w-[74%] max-w-[44rem]' : 'w-[48%] max-w-[36rem]'
  const edgeClass = getBannerTextEdgeClass(tone, textEdge !== false)
  const scaledPreview = preview && mode !== 'responsive'
  const ctaClass = cn(
    BANNER_BUTTON_BASE_CLASS,
    BANNER_BUTTON_CLASSES[ctaStyle],
    scaledPreview && PREVIEW_BUTTON_SIZE_CLASSES[mode],
  )
  const contentPaddingClass = scaledPreview
    ? mode === 'tablet'
      ? '[padding-block:3cqw] [padding-inline:7cqw]'
      : '[padding-block:3cqw] [padding-inline:5cqw]'
    : '[padding-block:clamp(1rem,3cqw,3rem)] [padding-inline:clamp(1.25rem,5cqw,6rem)] sm:[padding-inline:clamp(4rem,6cqw,6rem)] xl:[padding-inline:clamp(4.5rem,5cqw,6rem)]'
  const titleSizeClass = scaledPreview ? PREVIEW_TITLE_SIZE_CLASSES[mode] : TITLE_SIZE_CLASSES[mode]
  const subtitleSizeClass = scaledPreview ? PREVIEW_SUBTITLE_SIZE_CLASSES[mode] : SUBTITLE_SIZE_CLASSES[mode]
  const ctaLabel = buttonLabel?.trim() || 'Explore collection'
  const titleLineLimitClass = mode === 'mobile' ? 'line-clamp-4' : mode === 'responsive' ? 'line-clamp-4 sm:line-clamp-none' : ''
  const subtitleLineLimitClass = mode === 'mobile' ? 'line-clamp-4' : mode === 'responsive' ? 'line-clamp-4 sm:line-clamp-none' : ''
  const showCta = Boolean(linkUrl || (preview && buttonLabel))
  const ctaContent = (
    <>
      {ctaLabel}
      <LocalIcon
        name="chevron-right"
        className="h-[1.15em] w-[1.15em]"
      />
    </>
  )

  return (
    <div
      ref={ref}
      data-banner-creative
      data-banner-mode={mode}
      data-banner-preview={preview ? 'true' : undefined}
      data-banner-position={position}
      data-banner-text-tone={tone}
      data-banner-image-shade={shade}
      data-banner-typography={normalizeBannerTitleStyle(titleStyle)}
      className={cn(
        'relative w-full overflow-hidden bg-[#111827] [container-type:inline-size]',
        FRAME_CLASSES[mode],
        className,
      )}
      {...rootProps}
    >
      {desktopSrc ? (
        <BannerMedia
          desktopImageUrl={desktopSrc}
          tabletImageUrl={tabletSrc}
          mobileImageUrl={mobileSrc}
          title={cleanTitle}
          mode={mode}
          priority={priority}
          className={mediaClassName}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-white/60">
          Choose an image to preview
        </div>
      )}

      <div data-banner-shade aria-hidden="true" className="absolute inset-0" style={getBannerImageShadeStyle(shade, position)} />

      <div className={cn('absolute inset-0 flex items-center', contentPaddingClass, contentClassName)}>
        <div
          data-banner-content
          className={cn('flex min-w-0 flex-col', contentWidthClass, contentPositionClass, BANNER_TEXT_CLASSES[tone], edgeClass)}
        >
          {cleanTitle ? (
            <h2 data-banner-title className={cn('w-full min-w-0 break-words [overflow-wrap:anywhere] leading-[0.98]', titleSizeClass, titleLineLimitClass, typography.title)}>
              {cleanTitle}
            </h2>
          ) : null}
          {cleanSubtitle ? (
            <p data-banner-subtitle className={cn(cleanTitle ? (scaledPreview ? 'mt-[0.8cqw]' : 'mt-[clamp(0.45rem,0.8cqw,0.875rem)]') : 'mt-0', 'w-full min-w-0 break-words [overflow-wrap:anywhere] leading-[1.45]', subtitleSizeClass, subtitleLineLimitClass, typography.subtitle)}>
              {cleanSubtitle}
            </p>
          ) : null}
          {showCta ? (
            <div className={cn('flex flex-wrap items-center gap-3', scaledPreview ? 'mt-[1.25cqw]' : 'mt-[clamp(0.75rem,1.25cqw,1.5rem)]')}>
              {preview || !linkUrl ? (
                <span className={ctaClass}>{ctaContent}</span>
              ) : (
                <Link href={linkUrl} prefetch={false} className={ctaClass}>{ctaContent}</Link>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
})
