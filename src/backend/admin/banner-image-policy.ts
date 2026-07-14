import {
  BANNER_IMAGE_ASPECT_RATIO_TOLERANCE,
  BANNER_IMAGE_SPECS,
  type BannerImageSlot,
} from '@/shared/banner-image-specs'

export const BANNER_IMAGE_DATA_URL_ERROR =
  'Banner images must be uploaded as files before saving. Base64 image data is not allowed.'

export type AdminBannerImageSlot = BannerImageSlot

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

  const specification = BANNER_IMAGE_SPECS[slot]
  const uploadedRatio = width / height
  const relativeDifference = Math.abs(uploadedRatio - specification.ratio) / specification.ratio

  if (relativeDifference > BANNER_IMAGE_ASPECT_RATIO_TOLERANCE) {
    throw new Error(
      `${specification.label} must use the ${specification.preset} preset. Received ${width} × ${height} px.`,
    )
  }
}
