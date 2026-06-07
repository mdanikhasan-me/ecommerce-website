export const CATEGORY_IMAGE_DATA_URL_ERROR =
  'Category images must be uploaded as files before saving. Base64 image data is not allowed.'

export function isCategoryImageDataUrl(value: string | null | undefined) {
  return value?.trim().toLowerCase().startsWith('data:image/') ?? false
}
