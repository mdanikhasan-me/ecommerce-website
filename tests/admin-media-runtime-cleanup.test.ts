import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'

import {
  cleanupManagedAdminUploads,
  deleteManagedAdminUpload,
  deleteReplacedAdminUploads,
} from '@/backend/admin/admin-utils'
import {
  cleanupManagedUploads,
  deleteManagedUpload,
  deleteRemovedProductImages,
} from '@/backend/admin/product-editor'
import {
  AdminMediaReferenceSource,
} from '@/backend/admin/media-reference-guard'

async function withTempPublicRoot(callback: (publicRoot: string) => Promise<void>) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'boilabin-media-runtime-cleanup-'))

  try {
    const publicRoot = path.join(root, 'public')
    await callback(publicRoot)
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
}

async function writeFixture(publicRoot: string, publicPath: string) {
  const filePath = path.join(publicRoot, publicPath.replace(/^\/+/, ''))
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, 'fixture')
  return filePath
}

async function exists(filePath: string) {
  try {
    await fs.stat(filePath)
    return true
  } catch (error) {
    if ((error as { code?: unknown }).code === 'ENOENT') return false
    throw error
  }
}

function referenceSource(counts: Record<string, number> = {}): AdminMediaReferenceSource & { calls: number } {
  return {
    calls: 0,
    async countReferences(input) {
      this.calls += 1
      return {
        complete: true,
        fields: input.fields.map((field) => ({
          fieldKey: field.key,
          count: counts[field.key] ?? 0,
        })),
      }
    },
  }
}

function failingReferenceSource(): AdminMediaReferenceSource & { calls: number } {
  return {
    calls: 0,
    async countReferences() {
      this.calls += 1
      throw new Error('reference lookup failed')
    },
  }
}

describe('admin media runtime cleanup reference guard', () => {
  it('deletes unreferenced admin-managed temp fixtures only after a complete reference check', async () => {
    await withTempPublicRoot(async (publicRoot) => {
      const url = '/uploads/admin/banners/banner.webp'
      const filePath = await writeFixture(publicRoot, url)
      const source = referenceSource()

      const deleted = await deleteManagedAdminUpload(url, { referenceSource: source, publicRoot })

      assert.equal(deleted, true)
      assert.equal(source.calls, 1)
      assert.equal(await exists(filePath), false)
    })
  })

  it('skips admin-managed deletion for active, historical, and failed reference checks', async () => {
    await withTempPublicRoot(async (publicRoot) => {
      const activeUrl = '/uploads/admin/banners/active.webp'
      const historicalUrl = '/uploads/admin/banners/history.webp'
      const failedUrl = '/uploads/admin/banners/failure.webp'
      const activePath = await writeFixture(publicRoot, activeUrl)
      const historicalPath = await writeFixture(publicRoot, historicalUrl)
      const failedPath = await writeFixture(publicRoot, failedUrl)

      assert.equal(
        await deleteManagedAdminUpload(activeUrl, {
          referenceSource: referenceSource({ 'Banner.imageUrl': 1 }),
          publicRoot,
        }),
        false,
      )
      assert.equal(
        await deleteManagedAdminUpload(historicalUrl, {
          referenceSource: referenceSource({ 'OrderItem.imageUrl': 1 }),
          publicRoot,
        }),
        false,
      )
      assert.equal(
        await deleteManagedAdminUpload(failedUrl, {
          referenceSource: failingReferenceSource(),
          publicRoot,
        }),
        false,
      )

      assert.equal(await exists(activePath), true)
      assert.equal(await exists(historicalPath), true)
      assert.equal(await exists(failedPath), true)
    })
  })

  it('deletes unreferenced product-managed temp fixtures only after a complete reference check', async () => {
    await withTempPublicRoot(async (publicRoot) => {
      const url = '/uploads/products/product.webp'
      const filePath = await writeFixture(publicRoot, url)
      const source = referenceSource()

      const deleted = await deleteManagedUpload(url, { referenceSource: source, publicRoot })

      assert.equal(deleted, true)
      assert.equal(source.calls, 1)
      assert.equal(await exists(filePath), false)
    })
  })

  it('skips product-managed deletion for active, historical, and failed reference checks', async () => {
    await withTempPublicRoot(async (publicRoot) => {
      const activeUrl = '/uploads/products/active.webp'
      const variantUrl = '/uploads/products/variant.webp'
      const historicalUrl = '/uploads/products/history.webp'
      const failedUrl = '/uploads/products/failure.webp'
      const activePath = await writeFixture(publicRoot, activeUrl)
      const variantPath = await writeFixture(publicRoot, variantUrl)
      const historicalPath = await writeFixture(publicRoot, historicalUrl)
      const failedPath = await writeFixture(publicRoot, failedUrl)

      assert.equal(
        await deleteManagedUpload(activeUrl, {
          referenceSource: referenceSource({ 'ProductImage.url': 1 }),
          publicRoot,
        }),
        false,
      )
      assert.equal(
        await deleteManagedUpload(variantUrl, {
          referenceSource: referenceSource({ 'ProductVariant.image': 1 }),
          publicRoot,
        }),
        false,
      )
      assert.equal(
        await deleteManagedUpload(historicalUrl, {
          referenceSource: referenceSource({ 'Review.images': 1 }),
          publicRoot,
        }),
        false,
      )
      assert.equal(
        await deleteManagedUpload(failedUrl, {
          referenceSource: failingReferenceSource(),
          publicRoot,
        }),
        false,
      )

      assert.equal(await exists(activePath), true)
      assert.equal(await exists(variantPath), true)
      assert.equal(await exists(historicalPath), true)
      assert.equal(await exists(failedPath), true)
    })
  })

  it('keeps admin and product cleanup scopes isolated from each other', async () => {
    await withTempPublicRoot(async (publicRoot) => {
      const adminUrl = '/uploads/admin/banners/banner.webp'
      const productUrl = '/uploads/products/product.webp'
      const adminPath = await writeFixture(publicRoot, adminUrl)
      const productPath = await writeFixture(publicRoot, productUrl)
      const source = referenceSource()

      assert.equal(await deleteManagedAdminUpload(productUrl, { referenceSource: source, publicRoot }), false)
      assert.equal(await deleteManagedUpload(adminUrl, { referenceSource: source, publicRoot }), false)
      assert.equal(source.calls, 0)
      assert.equal(await exists(adminPath), true)
      assert.equal(await exists(productPath), true)
    })
  })

  it('refuses protected, unsafe, and unknown cleanup paths before reference lookup', async () => {
    const source = referenceSource()

    for (const candidate of [
      '/assets/banners/source.webp',
      '/images/legacy.webp',
      '/uploads/admin/',
      '/uploads/admin/banners/banner.webp?download=1',
      '/uploads/admin/../assets/source.webp',
      '/uploads/products/product.webp#preview',
      '/uploads/products/../../package.json',
      'https://cdn.example.test/image.webp',
      'data:image/webp;base64,AAAA',
      '/unknown/path.webp',
    ]) {
      assert.equal(await deleteManagedAdminUpload(candidate, { referenceSource: source }), false)
      assert.equal(await deleteManagedUpload(candidate, { referenceSource: source }), false)
    }

    assert.equal(source.calls, 0)
  })

  it('keeps replaced-image cleanup exported helpers reference-safe', async () => {
    await withTempPublicRoot(async (publicRoot) => {
      const adminUrl = '/uploads/admin/banners/old.webp'
      const productUrl = '/uploads/products/old.webp'
      const retainedUrl = '/uploads/products/retained.webp'
      const adminPath = await writeFixture(publicRoot, adminUrl)
      const productPath = await writeFixture(publicRoot, productUrl)
      const retainedPath = await writeFixture(publicRoot, retainedUrl)

      assert.deepEqual(
        await deleteReplacedAdminUploads([adminUrl], ['/uploads/admin/banners/new.webp'], {
          referenceSource: referenceSource({ 'Banner.mobileImageUrl': 1 }),
          publicRoot,
        }),
        [false],
      )
      assert.deepEqual(
        await deleteRemovedProductImages([productUrl, retainedUrl], [retainedUrl], {
          referenceSource: referenceSource(),
          publicRoot,
        }),
        [true],
      )

      assert.equal(await exists(adminPath), true)
      assert.equal(await exists(productPath), false)
      assert.equal(await exists(retainedPath), true)
    })
  })

  it('keeps batch cleanup helpers and cleanup failures non-fatal', async () => {
    await withTempPublicRoot(async (publicRoot) => {
      const adminUrl = '/uploads/admin/banners/admin.webp'
      const productUrl = '/uploads/products/product.webp'
      const adminPath = await writeFixture(publicRoot, adminUrl)
      const productPath = await writeFixture(publicRoot, productUrl)

      assert.deepEqual(await cleanupManagedAdminUploads([adminUrl], { referenceSource: referenceSource(), publicRoot }), [
        true,
      ])
      assert.deepEqual(await cleanupManagedUploads([productUrl], { referenceSource: referenceSource(), publicRoot }), [
        true,
      ])
      assert.equal(
        await deleteManagedAdminUpload('/uploads/admin/banners/broken.webp', {
          referenceSource: referenceSource(),
          publicRoot: '\0',
        }),
        false,
      )
      assert.equal(await exists(adminPath), false)
      assert.equal(await exists(productPath), false)
    })
  })

  it('keeps route-facing response contracts unchanged while cleanup helpers stay non-throwing', async () => {
    const [bannerRoute, categoryRoute, productRoute, productEditor] = await Promise.all([
      fs.readFile(path.resolve('src/app/api/admin/banners/[id]/route.ts'), 'utf8'),
      fs.readFile(path.resolve('src/app/api/admin/categories/[id]/route.ts'), 'utf8'),
      fs.readFile(path.resolve('src/app/api/admin/products/[id]/route.ts'), 'utf8'),
      fs.readFile(path.resolve('src/backend/admin/product-editor.ts'), 'utf8'),
    ])

    assert.match(bannerRoute, /return NextResponse\.json\(\{ banner \}\)/)
    assert.match(bannerRoute, /return NextResponse\.json\(\{ success: true \}\)/)
    assert.match(categoryRoute, /return NextResponse\.json\(\{ category \}\)/)
    assert.match(categoryRoute, /archived: true/)
    assert.match(categoryRoute, /deleted: true/)
    assert.match(productRoute, /return NextResponse\.json\(\{ product \}\)/)
    assert.match(productRoute, /deleted: true/)
    assert.match(productRoute, /deleted: false,\s+archived: true/s)
    assert.match(productEditor, /export async function deleteManagedUpload/)
    assert.match(productEditor, /catch \{\s+logProductUploadCleanupSkipped[\s\S]+return false\s+\}/)
  })
})
