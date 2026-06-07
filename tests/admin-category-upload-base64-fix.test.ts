import { Buffer } from 'node:buffer'
import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'

import sharp from 'sharp'

import {
  persistAdminCategoryImageFile,
  type AdminCategoryUploadFile,
} from '@/backend/admin/category-image-upload'
import { CATEGORY_IMAGE_DATA_URL_ERROR } from '@/backend/admin/category-image-policy'
import { parseAdminCategoryPayload } from '@/backend/admin/category-editor'
import { classifyAdminMediaPath } from '@/backend/admin/media-lifecycle'
import { buildManagedCategoryUploadPath } from '@/backend/admin/media-paths'

async function makePngBuffer() {
  return sharp({
    create: {
      width: 24,
      height: 16,
      channels: 4,
      background: '#f4efe7',
    },
  })
    .png()
    .toBuffer()
}

function toArrayBuffer(buffer: Buffer) {
  const arrayBuffer = new ArrayBuffer(buffer.byteLength)
  new Uint8Array(arrayBuffer).set(buffer)
  return arrayBuffer
}

function makeUploadFile(buffer: Buffer): AdminCategoryUploadFile {
  return {
    size: buffer.byteLength,
    type: 'image/png',
    arrayBuffer: async () => toArrayBuffer(buffer),
  }
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function removeStepCategoryUploadDirectory() {
  const root = path.resolve(process.cwd(), 'public', 'uploads', 'admin', 'categories')
  const target = path.resolve(root, 'step-336-category-upload')
  assert.ok(target.startsWith(`${root}${path.sep}`))
  await fs.rm(target, { recursive: true, force: true })
}

describe('admin category upload base64 fix', () => {
  it('persists uploaded category files as clean managed URLs with slug-based filenames', async () => {
    const png = await makePngBuffer()
    const createdUrls: string[] = []

    try {
      const firstUrl = await persistAdminCategoryImageFile(makeUploadFile(png), {
        ownerSlugOrId: 'Step 336 Category Upload',
      })
      createdUrls.push(firstUrl)

      const secondUrl = await persistAdminCategoryImageFile(makeUploadFile(png), {
        ownerSlugOrId: 'Step 336 Category Upload',
      })
      createdUrls.push(secondUrl)

      assert.match(
        firstUrl,
        /^\/uploads\/admin\/categories\/step-336-category-upload\/step-336-category-upload-.+\.webp$/,
      )
      assert.match(
        secondUrl,
        /^\/uploads\/admin\/categories\/step-336-category-upload\/step-336-category-upload-.+\.webp$/,
      )
      assert.notEqual(firstUrl, secondUrl)

      for (const url of createdUrls) {
        assert.doesNotMatch(url, /^data:image\//)
        assert.equal(classifyAdminMediaPath(url).canDeleteLocalFile, true)
        assert.equal(
          await fileExists(path.join(process.cwd(), 'public', url.replace(/^\/+/, ''))),
          true,
        )
      }
    } finally {
      await removeStepCategoryUploadDirectory()
    }
  })

  it('rejects inline category data URLs before JSON save payloads hit persistence', () => {
    const parsed = parseAdminCategoryPayload({
      name: 'Electronics',
      slug: 'electronics',
      image: 'data:image/png;base64,AAAA',
    })

    assert.equal(parsed.success, false)
    assert.equal(parsed.error, CATEGORY_IMAGE_DATA_URL_ERROR)
  })

  it('keeps category upload planning inside the managed admin upload root', () => {
    const plan = buildManagedCategoryUploadPath({
      categorySlug: '../Electronics',
      mediaId: '../image',
    })

    assert.equal(plan.publicPathPrefix, '/uploads/admin/categories/category')
    assert.equal(plan.examplePublicPath, '/uploads/admin/categories/category/media.webp')
    assert.deepEqual(plan.directorySegments, ['uploads', 'admin', 'categories', 'category'])
    assert.doesNotMatch(plan.examplePublicPath, /\.\.|\\/)
    assert.equal(classifyAdminMediaPath('/assets/categories/electronics.jpg').canDeleteLocalFile, false)
    assert.equal(
      classifyAdminMediaPath('/uploads/admin/categories/electronics/electronics-test.webp').canDeleteLocalFile,
      true,
    )
  })

  it('wires the category form to managed upload instead of storing file reader data URLs', async () => {
    const [formSource, imageFieldSource, routeSource, updateRouteSource] = await Promise.all([
      fs.readFile(path.join(process.cwd(), 'src/frontend/components/admin/CategoryEditorForm.tsx'), 'utf8'),
      fs.readFile(path.join(process.cwd(), 'src/frontend/components/admin/AdminImageField.tsx'), 'utf8'),
      fs.readFile(path.join(process.cwd(), 'src/app/api/admin/categories/upload/route.ts'), 'utf8'),
      fs.readFile(path.join(process.cwd(), 'src/app/api/admin/categories/[id]/route.ts'), 'utf8'),
    ])

    assert.match(formSource, /fetch\('\/api\/admin\/categories\/upload'/)
    assert.match(formSource, /uploadImage=\{uploadCategoryImage\}/)
    assert.match(formSource, /rejectDataUrls/)
    assert.match(
      imageFieldSource,
      /uploadImage \? await uploadImage\(file\) : await readFileAsDataUrl\(file\)/,
    )
    assert.match(routeSource, /await req\.formData\(\)/)
    assert.match(routeSource, /persistAdminCategoryImageFile/)
    assert.doesNotMatch(routeSource, /assets[\\/]categories[\\/]subcategories/)
    assert.match(updateRouteSource, /deleteReplacedAdminUploads\(\[existingCategory\.image\], \[image\]\)/)
    assert.match(updateRouteSource, /url\.startsWith\('\/uploads\/admin\/'\)/)
  })
})
