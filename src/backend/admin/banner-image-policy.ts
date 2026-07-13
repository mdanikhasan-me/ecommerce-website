export const BANNER_IMAGE_DATA_URL_ERROR =
  'Banner images must be uploaded as files before saving. Base64 image data is not allowed.'

export type AdminBannerImageSlot = 'desktop' | 'tablet' | 'mobile'

const BANNER_IMAGE_ASPECT_RATIO_TOLERANCE = 0.05

export const ADMIN_BANNER_IMAGE_ASPECTS = {
  desktop: { label: 'Desktop image', preset: 'Ultrawide (21:9)', ratio: 21 / 9 },
  tablet: { label: 'Tablet / iPad image', preset: 'Desktop (16:9)', ratio: 16 / 9 },
  mobile: { label: 'Mobile image', preset: 'Mobile landscape (5:4)', ratio: 5 / 4 },
} as const satisfies Record<AdminBannerImageSlot, { label: string; preset: string; ratio: number }>

export function isAdminBannerImageSlot(value: string | null | undefined): value is AdminBannerImageSlot {
  return value === 'desktop' || value === 'tablet' || value === 'mobile'
}

export function isImageDataUrl(value: string | null | undefined) {
  return value?.trim().toLowerCase().startsWith('data:image/') ?? false
}

export function validateAdminBannerImageAspectRatio(slot: AdminBannerImageSlot, width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error('Banner image dimensions are invalid')
  }

  const specification = ADMIN_BANNER_IMAGE_ASPECTS[slot]
  const uploadedRatio = width / height
  const relativeDifference = Math.abs(uploadedRatio - specification.ratio) / specification.ratio

  if (relativeDifference > BANNER_IMAGE_ASPECT_RATIO_TOLERANCE) {
    throw new Error(
      `${specification.label} must use the ${specification.preset} preset. Received ${width} × ${height} px.`,
    )
  }
}
