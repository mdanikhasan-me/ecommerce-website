export type BannerImageSlot = 'desktop' | 'tablet' | 'mobile'

export const BANNER_IMAGE_ASPECT_RATIO_TOLERANCE = 0.02

export const BANNER_IMAGE_SPECS = {
  desktop: {
    label: 'Desktop image',
    preset: 'Ultrawide 21:9',
    ratio: 21 / 9,
    recommendedWidth: 2048,
    recommendedHeight: 864,
    maxKilobytes: 500,
  },
  tablet: {
    label: 'Tablet / iPad image',
    preset: 'Landscape 16:9',
    ratio: 16 / 9,
    recommendedWidth: 1376,
    recommendedHeight: 768,
    maxKilobytes: 400,
  },
  mobile: {
    label: 'Mobile image',
    preset: 'Landscape 5:4',
    ratio: 5 / 4,
    recommendedWidth: 1152,
    recommendedHeight: 928,
    maxKilobytes: 300,
  },
} as const satisfies Record<
  BannerImageSlot,
  {
    label: string
    preset: string
    ratio: number
    recommendedWidth: number
    recommendedHeight: number
    maxKilobytes: number
  }
>

export function getBannerImageGuidance(slot: BannerImageSlot) {
  const specification = BANNER_IMAGE_SPECS[slot]
  return `Required preset: ${specification.preset}. Recommended export: ${specification.recommendedWidth} × ${specification.recommendedHeight} px, WebP, under ${specification.maxKilobytes} KB. Stored at q90.`
}
