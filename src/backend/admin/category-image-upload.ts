import { Buffer } from 'node:buffer'
import {
  IMAGE_UPLOAD_ERROR_MESSAGES,
  MAX_IMAGE_UPLOAD_BYTES,
  persistOptimizedImageUpload,
} from '@/backend/admin/image-processing'
import { isCategoryImageDataUrl } from '@/backend/admin/category-image-policy'
import { buildManagedCategoryUploadPath, sanitizeMediaPathSegment } from '@/backend/admin/media-paths'

export type AdminCategoryUploadFile = {
  arrayBuffer: () => Promise<ArrayBuffer>
  size: number
  type: string
}

export async function persistAdminCategoryImageFile(
  file: AdminCategoryUploadFile,
  input: {
    ownerSlugOrId?: string | null
  },
) {
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

  const owner = sanitizeMediaPathSegment(input.ownerSlugOrId, 'category')
  const uploadPath = buildManagedCategoryUploadPath({
    categorySlug: owner,
    mediaId: owner,
  })
  const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`
  const publicUrl = await persistOptimizedImageUpload({
    dataUrl,
    directorySegments: uploadPath.directorySegments,
    baseName: uploadPath.baseName,
    publicPathPrefix: uploadPath.publicPathPrefix,
    profile: 'categories',
    filenameStrategy: 'stable',
  })

  if (!publicUrl || isCategoryImageDataUrl(publicUrl)) {
    throw new Error(IMAGE_UPLOAD_ERROR_MESSAGES.safeUpload)
  }

  return publicUrl
}
