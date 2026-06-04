import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import sharp from 'sharp'

import {
  IMAGE_UPLOAD_ERROR_MESSAGES,
  IMAGE_UPLOAD_STORAGE_POLICY,
  IMAGE_UPLOAD_VARIANT_INTENTS,
  MAX_DECODED_IMAGE_PIXELS,
  MAX_IMAGE_DIMENSION,
  MAX_IMAGE_UPLOAD_BYTES,
  getImageUploadProfile,
  persistOptimizedImageUpload,
  validateImageUploadPayload,
} from '@/backend/admin/image-processing'

async function makePngDataUrl(width = 1, height = 1) {
  const buffer = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 1 },
    },
  }).png().toBuffer()

  return `data:image/png;base64,${buffer.toString('base64')}`
}

describe('image upload validation', () => {
  it('accepts valid allowlisted image payloads', async () => {
    const parsed = await validateImageUploadPayload(await makePngDataUrl())

    assert.equal(parsed.mimeType, 'image/png')
    assert.ok(parsed.buffer.byteLength > 0)
  })

  it('rejects unsupported image MIME types', async () => {
    await assert.rejects(
      validateImageUploadPayload('data:image/svg+xml;base64,PHN2Zy8+'),
      /Unsupported image type/,
    )
  })

  it('rejects corrupt images with a safe error', async () => {
    await assert.rejects(
      validateImageUploadPayload('data:image/png;base64,Zm9vYmFy'),
      /Invalid image upload payload/,
    )
  })

  it('rejects MIME types that do not match decoded image data', async () => {
    const png = await makePngDataUrl()
    const mislabeled = png.replace('data:image/png;', 'data:image/jpeg;')

    await assert.rejects(validateImageUploadPayload(mislabeled), /Unsupported image type/)
  })

  it('rejects payloads above the encoded byte limit before decoding', async () => {
    const base64Length = Math.ceil((MAX_IMAGE_UPLOAD_BYTES + 4) / 3) * 4
    const oversizedPayload = `data:image/png;base64,${'A'.repeat(base64Length)}`

    await assert.rejects(validateImageUploadPayload(oversizedPayload), /Image upload is too large/)
  })

  it('rejects oversized dimensions with a specific safe error', async () => {
    await assert.rejects(
      validateImageUploadPayload(await makePngDataUrl(MAX_IMAGE_DIMENSION + 1, 1)),
      /Image dimensions are too large/,
    )
  })

  it('rejects decoded pixel counts above the policy cap', async () => {
    await assert.rejects(
      validateImageUploadPayload(await makePngDataUrl(6_000, Math.ceil(MAX_DECODED_IMAGE_PIXELS / 6_000) + 1)),
      /Image decoded pixel count is too large/,
    )
  })

  it('prefers WebP output for persisted optimized uploads', async () => {
    const outputDir = path.join(process.cwd(), 'public', 'uploads', 'test-media')
    await fs.rm(outputDir, { recursive: true, force: true })

    try {
      const publicUrl = await persistOptimizedImageUpload({
        dataUrl: await makePngDataUrl(4, 4),
        directorySegments: ['uploads', 'test-media'],
        baseName: 'test-product',
        publicPathPrefix: '/uploads/test-media',
        profile: 'products',
      })

      assert.match(publicUrl, /^\/uploads\/test-media\/test-product-.+\.webp$/)
      await fs.access(path.join(process.cwd(), 'public', publicUrl.replace(/^\//, '')))
    } finally {
      await fs.rm(outputDir, { recursive: true, force: true })
    }
  })

  it('exposes explicit media policy metadata without claiming variant storage is implemented', () => {
    const productProfile = getImageUploadProfile('products')
    const unknownProfile = getImageUploadProfile('unknown-profile')

    assert.equal(productProfile.maxWidth, 2_200)
    assert.equal(unknownProfile.maxWidth, 1_800)
    assert.ok(IMAGE_UPLOAD_VARIANT_INTENTS.thumbnail.maxWidth < IMAGE_UPLOAD_VARIANT_INTENTS.detail.maxWidth)
    assert.equal(IMAGE_UPLOAD_STORAGE_POLICY.preferredFormat, 'webp')
    assert.equal(IMAGE_UPLOAD_STORAGE_POLICY.derivedVariantsImplemented, false)
    assert.equal(IMAGE_UPLOAD_STORAGE_POLICY.objectStorageImplemented, false)
  })

  it('keeps rejected upload errors bounded and free of raw payload data', async () => {
    const rawPayload = 'data:image/png;base64,not-a-real-image-with-sensitive-looking-token'

    await assert.rejects(
      validateImageUploadPayload(rawPayload),
      (error) => {
        assert.ok(error instanceof Error)
        assert.equal(error.message, IMAGE_UPLOAD_ERROR_MESSAGES.safeUpload)
        assert.equal(error.message.includes('sensitive-looking-token'), false)
        assert.equal(error.message.includes('data:image'), false)
        return true
      },
    )
  })
})
