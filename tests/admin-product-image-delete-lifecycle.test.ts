import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'

import { classifyAdminMediaPath } from '@/backend/admin/media-lifecycle'
import {
  deleteManagedUpload,
  deleteRemovedProductImages,
  isManagedProductMediaPath,
  removeEmptyManagedProductFolderIfSafe,
  resolvePublicProductMediaPath,
} from '@/backend/admin/product-editor'
import type { AdminMediaReferenceSource } from '@/backend/admin/media-reference-guard'

async function withTempPublicRoot(callback: (publicRoot: string) => Promise<void>) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'boilabin-product-image-delete-'))

  try {
    await callback(path.join(root, 'public'))
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

describe('admin product image delete lifecycle', () => {
  it('keeps update route replacing stored ProductImage rows from the submitted payload', () => {
    const routeSource = readFileSync(
      path.join(process.cwd(), 'src/app/api/admin/products/[id]/route.ts'),
      'utf8',
    )
    const deleteIndex = routeSource.indexOf('tx.productImage.deleteMany')
    const updateIndex = routeSource.indexOf('tx.product.update')

    assert.ok(deleteIndex > -1)
    assert.ok(updateIndex > -1)
    assert.ok(deleteIndex < updateIndex)
    assert.match(routeSource, /images:\s*images\.length \? \{ create: images \} : undefined/)
    assert.match(routeSource, /deleteRemovedProductImages\(existingImageUrls, nextImageUrls\)/)
  })

  it('keeps admin form remove action and save payload tied to current image state', () => {
    const formSource = readFileSync(
      path.join(process.cwd(), 'src/frontend/components/admin/ProductEditorForm.tsx'),
      'utf8',
    )
    const removeStart = formSource.indexOf('const removeImage =')
    const payloadStart = formSource.indexOf('const buildPayload =')

    assert.ok(removeStart > -1)
    assert.ok(payloadStart > -1)
    assert.match(formSource.slice(removeStart, payloadStart), /current\.filter\(\(image\) => image\.id !== id\)/)
    assert.match(formSource.slice(payloadStart), /images:\s*images\s*\.map/)
    assert.doesNotMatch(formSource.slice(payloadStart), /product\?\.images/)
  })

  it('classifies only product managed upload paths as product cleanup candidates', () => {
    assert.equal(isManagedProductMediaPath('/uploads/products/electronics/audio/bose/image.webp'), true)
    assert.equal(isManagedProductMediaPath('https://images.unsplash.com/photo.jpg'), false)
    assert.equal(isManagedProductMediaPath('/assets/products/catalog/electronics/audio/example-product/main.avif'), false)
    assert.equal(isManagedProductMediaPath('/uploads/products/../../package.json'), false)
    assert.equal(isManagedProductMediaPath('/uploads/products/electronics/audio/bose'), false)
    assert.equal(isManagedProductMediaPath('/assets/categories/subcategories/mobile-phones.webp'), false)
  })

  it('does not send removed remote or source catalog product images to filesystem cleanup', async () => {
    const source = referenceSource()
    const removed = [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format',
      '/assets/products/catalog/electronics/audio/example-product/main.avif',
    ]

    assert.deepEqual(await deleteRemovedProductImages(removed, [], { referenceSource: source }), [])
    assert.equal(source.calls, 0)
  })

  it('does not delete a removed managed product file that is still referenced elsewhere', async () => {
    await withTempPublicRoot(async (publicRoot) => {
      const url = '/uploads/products/electronics/audio/shared-product/image.webp'
      const filePath = await writeFixture(publicRoot, url)
      const source = referenceSource({ 'ProductImage.url': 1 })

      assert.deepEqual(
        await deleteRemovedProductImages([url], [], { referenceSource: source, publicRoot }),
        [false],
      )
      assert.equal(source.calls, 1)
      assert.equal(await exists(filePath), true)
    })
  })

  it('deletes an unreferenced managed product file and its empty product folder', async () => {
    await withTempPublicRoot(async (publicRoot) => {
      const url = '/uploads/products/electronics/audio/delete-me/image.webp'
      const filePath = await writeFixture(publicRoot, url)
      const productFolder = path.dirname(filePath)
      const source = referenceSource()

      assert.equal(resolvePublicProductMediaPath(url, publicRoot), filePath)
      assert.deepEqual(
        await deleteRemovedProductImages([url], [], { referenceSource: source, publicRoot }),
        [true],
      )
      assert.equal(source.calls, 1)
      assert.equal(await exists(filePath), false)
      assert.equal(await exists(productFolder), false)
    })
  })

  it('keeps a managed product folder when sibling media remains', async () => {
    await withTempPublicRoot(async (publicRoot) => {
      const removedUrl = '/uploads/products/electronics/audio/keep-folder/old.webp'
      const siblingUrl = '/uploads/products/electronics/audio/keep-folder/new.webp'
      const removedPath = await writeFixture(publicRoot, removedUrl)
      const siblingPath = await writeFixture(publicRoot, siblingUrl)
      const productFolder = path.dirname(removedPath)

      assert.equal(await deleteManagedUpload(removedUrl, { referenceSource: referenceSource(), publicRoot }), true)
      assert.equal(await exists(removedPath), false)
      assert.equal(await exists(siblingPath), true)
      assert.equal(await exists(productFolder), true)
    })
  })

  it('refuses traversal, product upload root, and cross-scope category cleanup from product helpers', async () => {
    const source = referenceSource()

    assert.equal(await deleteManagedUpload('/uploads/products/../../package.json', { referenceSource: source }), false)
    assert.equal(await deleteManagedUpload('/uploads/products/', { referenceSource: source }), false)
    assert.equal(await deleteManagedUpload('/uploads/products/electronics/audio/bose', { referenceSource: source }), false)
    assert.equal(
      await deleteManagedUpload('/assets/categories/subcategories/mobile-phones.webp', { referenceSource: source }),
      false,
    )
    assert.equal(await removeEmptyManagedProductFolderIfSafe('/uploads/products/', {}), false)
    assert.equal(source.calls, 0)
    assert.equal(classifyAdminMediaPath('/assets/categories/subcategories/mobile-phones.webp').canDeleteLocalFile, true)
  })

  it('keeps a source catalog path protected because it is source controlled', () => {
    const sourcePath = '/assets/products/catalog/electronics/audio/example-product/main.avif'
    const localPath = path.join(process.cwd(), 'public', sourcePath.replace(/^\//, ''))

    assert.equal(existsSync(localPath), false)
    assert.equal(isManagedProductMediaPath(sourcePath), false)
    assert.equal(classifyAdminMediaPath(sourcePath).bucket, 'protected-source-code-asset')
  })
})
