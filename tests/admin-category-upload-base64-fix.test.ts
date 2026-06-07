import { Buffer } from 'node:buffer'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
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
  const target = path.resolve(
    process.cwd(),
    'public',
    'uploads',
    'categories',
    'step-336-category-upload.webp',
  )
  const root = path.resolve(process.cwd(), 'public', 'uploads', 'categories')
  assert.ok(target.startsWith(`${root}${path.sep}`))
  await fs.rm(target, { force: true })
}

async function fileHash(filePath: string) {
  return createHash('sha256').update(await fs.readFile(filePath)).digest('hex')
}

describe('admin category upload base64 fix', () => {
  it('persists parent category files as one clean stable slug URL', async () => {
    const png = await makePngBuffer()
    const firstUpload = makeUploadFile(png)
    const secondPng = await sharp({
      create: {
        width: 24,
        height: 16,
        channels: 4,
        background: '#253041',
      },
    })
      .png()
      .toBuffer()
    const secondUpload = makeUploadFile(secondPng)

    try {
      const firstUrl = await persistAdminCategoryImageFile(firstUpload, {
        ownerSlugOrId: 'Step 336 Category Upload',
      })
      const firstFile = path.join(process.cwd(), 'public', firstUrl.replace(/^\/+/, ''))
      const firstHash = await fileHash(firstFile)

      const secondUrl = await persistAdminCategoryImageFile(secondUpload, {
        ownerSlugOrId: 'Step 336 Category Upload',
      })
      const secondFile = path.join(process.cwd(), 'public', secondUrl.replace(/^\/+/, ''))
      const secondHash = await fileHash(secondFile)

      assert.equal(firstUrl, '/uploads/categories/step-336-category-upload.webp')
      assert.equal(secondUrl, firstUrl)
      assert.notEqual(firstHash, secondHash)
      assert.doesNotMatch(firstUrl, /-[a-z0-9]{6,}-[a-f0-9]{8}\.webp$/)
      assert.doesNotMatch(firstUrl, /^\/uploads\/admin\/categories\//)

      assert.doesNotMatch(firstUrl, /^data:image\//)
      assert.equal(classifyAdminMediaPath(firstUrl).canDeleteLocalFile, true)
      assert.equal(await fileExists(secondFile), true)
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

  it('keeps category upload planning inside the clean managed category upload root', () => {
    const plan = buildManagedCategoryUploadPath({
      categorySlug: '../Electronics',
      mediaId: '../image',
    })

    assert.equal(plan.publicPathPrefix, '/uploads/categories')
    assert.equal(plan.examplePublicPath, '/uploads/categories/category.webp')
    assert.deepEqual(plan.directorySegments, ['uploads', 'categories'])
    assert.doesNotMatch(plan.examplePublicPath, /\.\.|\\/)
    assert.equal(classifyAdminMediaPath('/assets/categories/electronics.jpg').canDeleteLocalFile, false)
    assert.equal(classifyAdminMediaPath('/uploads/categories/electronics.webp').canDeleteLocalFile, true)
    assert.equal(
      classifyAdminMediaPath('/uploads/admin/categories/electronics/electronics-test.webp').canDeleteLocalFile,
      true,
    )
  })

  it('wires the category form to managed upload instead of storing file reader data URLs', async () => {
    const [formSource, imageFieldSource, routeSource, createRouteSource, updateRouteSource] = await Promise.all([
      fs.readFile(path.join(process.cwd(), 'src/frontend/components/admin/CategoryEditorForm.tsx'), 'utf8'),
      fs.readFile(path.join(process.cwd(), 'src/frontend/components/admin/AdminImageField.tsx'), 'utf8'),
      fs.readFile(path.join(process.cwd(), 'src/app/api/admin/categories/upload/route.ts'), 'utf8'),
      fs.readFile(path.join(process.cwd(), 'src/app/api/admin/categories/route.ts'), 'utf8'),
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
    assert.match(updateRouteSource, /isManagedAdminUpload\(url\)/)
    assert.match(createRouteSource, /revalidatePath\('\/'\)/)
    assert.match(createRouteSource, /revalidatePath\('\/category'\)/)
    assert.match(updateRouteSource, /revalidatePath\('\/'\)/)
    assert.match(updateRouteSource, /revalidatePath\('\/category'\)/)
  })
})
