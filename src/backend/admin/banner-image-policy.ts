export const BANNER_IMAGE_DATA_URL_ERROR =
  'Banner images must be uploaded as files before saving. Base64 image data is not allowed.'

export type AdminBannerImageSlot = 'desktop' | 'mobile'

export function isAdminBannerImageSlot(value: string | null | undefined): value is AdminBannerImageSlot {
  return value === 'desktop' || value === 'mobile'
}

export function isImageDataUrl(value: string | null | undefined) {
  return value?.trim().toLowerCase().startsWith('data:image/') ?? false
}
