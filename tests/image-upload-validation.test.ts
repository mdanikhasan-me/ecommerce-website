import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import sharp from 'sharp'

import { validateImageUploadPayload } from '@/backend/admin/image-processing'

async function makePngDataUrl() {
  const buffer = await sharp({
    create: {
      width: 1,
      height: 1,
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
})
