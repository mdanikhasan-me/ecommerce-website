import { Buffer } from 'node:buffer'
import sharp from 'sharp'
import { persistAdminUpload } from '@/backend/admin/admin-utils'
import {
  IMAGE_UPLOAD_ERROR_MESSAGES,
  MAX_DECODED_IMAGE_PIXELS,
  MAX_IMAGE_UPLOAD_BYTES,
} from '@/backend/admin/image-processing'
import {
  isAdminBannerImageSlot,
  isImageDataUrl,
  type AdminBannerImageSlot,
  validateAdminBannerImageAspectRatio,
} from '@/backend/admin/banner-image-policy'

export type AdminBannerUploadFile = {
  arrayBuffer: () => Promise<ArrayBuffer>
  size: number
  type: string
}

export async function persistAdminBannerImageFile(
  file: AdminBannerUploadFile,
  input: {
    ownerSlugOrId?: string | null
    slot: AdminBannerImageSlot
  },
) {
  if (!isAdminBannerImageSlot(input.slot)) {
    throw new Error('Banner image slot is invalid')
  }

  if (!file || file.size <= 0) {
    throw new Error('Image file is required')
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error(IMAGE_UPLOAD_ERROR_MESSAGES.uploadTooLarge)
  }

  const mimeType = file.type.trim().toLowerCase()
  if (!mimeType.startsWith('image/')) {
    throw new Error(IMAGE_UPLOAD_ERROR_MESSAGES.unsupportedImage)
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  if (buffer.byteLength <= 0) {
    throw new Error(IMAGE_UPLOAD_ERROR_MESSAGES.safeUpload)
  }
  if (buffer.byteLength > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error(IMAGE_UPLOAD_ERROR_MESSAGES.uploadTooLarge)
  }

  try {
    const metadata = await sharp(buffer, {
      failOn: 'error',
      limitInputPixels: MAX_DECODED_IMAGE_PIXELS + 1,
    }).metadata()
    validateAdminBannerImageAspectRatio(
      input.slot,
      metadata.width ?? 0,
      metadata.pageHeight ?? metadata.height ?? 0,
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes('must use the')) {
      throw error
    }
    throw new Error(IMAGE_UPLOAD_ERROR_MESSAGES.safeUpload)
  }

  const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`
  const publicUrl = await persistAdminUpload(dataUrl, {
    purpose: 'banners',
    ownerSlugOrId: input.ownerSlugOrId,
    mediaId: input.slot,
  })

  if (!publicUrl || isImageDataUrl(publicUrl)) {
    throw new Error(IMAGE_UPLOAD_ERROR_MESSAGES.safeUpload)
  }

  return publicUrl
}
