import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'

import {
  deleteManagedAdminUpload,
  resolveManagedPublicUploadPath,
} from '@/backend/admin/admin-utils'
import {
  canDeleteAdminMediaLocalFile,
  classifyAdminMediaPath,
  countRemainingAdminMediaReferences,
  planAdminMediaLocalDeletion,
  resolveManagedMediaFilePath,
} from '@/backend/admin/media-lifecycle'
import { deleteManagedUpload } from '@/backend/admin/product-editor'
import { AdminMediaReferenceSource } from '@/backend/admin/media-reference-guard'

const noReferenceSource: AdminMediaReferenceSource = {
  async countReferences(input) {
    return {
      complete: true,
      fields: input.fields.map((field) => ({
        fieldKey: field.key,
        count: 0,
      })),
    }
  },
}

async function withTempProject(callback: (root: string) => Promise<void>) {
  const originalCwd = process.cwd()
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'boilabin-admin-media-'))

  try {
    process.chdir(root)
    await callback(root)
  } finally {
    process.chdir(originalCwd)
    await fs.rm(root, { recursive: true, force: true })
  }
}

describe('admin media upload deletion lifecycle guardrails', () => {
  it('allows only known managed local upload roots as local deletion candidates', () => {
    const banner = classifyAdminMediaPath('/uploads/admin/banners/banner.webp')
    const product = classifyAdminMediaPath('/uploads/products/product.webp')

    assert.equal(banner.bucket, 'admin-managed-upload')
    assert.equal(banner.canDeleteLocalFile, true)
    assert.equal(banner.managedPrefix, '/uploads/admin/')
    assert.equal(product.bucket, 'admin-managed-upload')
    assert.equal(product.canDeleteLocalFile, true)
    assert.equal(product.managedPrefix, '/uploads/products/')
  })

  it('does not allow managed upload root directories as local deletion candidates', () => {
    for (const rootPath of ['/uploads/admin/', '/uploads/products/']) {
      const classified = classifyAdminMediaPath(rootPath)

      assert.equal(classified.bucket, 'admin-managed-upload')
      assert.equal(classified.canDeleteLocalFile, false)
    }
  })

  it('protects committed source-code assets from admin local deletion', () => {
    for (const sourceAsset of [
      '/assets/categories/electronics.jpg',
      '/assets/banners/home-hero-iphone-15-pro.jpg',
      '/assets/readme/storefront-preview.png',
      '/images/legacy-product.jpg',
    ]) {
      const classified = classifyAdminMediaPath(sourceAsset)

      assert.equal(classified.bucket, 'protected-source-code-asset')
      assert.equal(classified.canDeleteLocalFile, false)
    }
  })

  it('does not treat remote URLs or inline upload payloads as local deletion candidates', () => {
    for (const externalValue of [
      'https://images.unsplash.com/photo.jpg',
      'http://cdn.example.test/product.jpg',
      'data:image/png;base64,AAAA',
    ]) {
      assert.equal(canDeleteAdminMediaLocalFile(externalValue), false)
    }
  })

  it('refuses path traversal and unknown local paths', () => {
    const traversal = classifyAdminMediaPath('/uploads/admin/../assets/categories/electronics.jpg')
    const windowsTraversal = classifyAdminMediaPath('/uploads/admin/..\\assets\\categories\\electronics.jpg')
    const absoluteEscape = classifyAdminMediaPath('/uploads/products/../../package.json')
    const unknownLocalPath = classifyAdminMediaPath('/uploads/other/file.webp')

    assert.equal(traversal.canDeleteLocalFile, false)
    assert.equal(windowsTraversal.canDeleteLocalFile, false)
    assert.equal(absoluteEscape.canDeleteLocalFile, false)
    assert.equal(unknownLocalPath.bucket, 'unknown-local-path')
    assert.equal(unknownLocalPath.canDeleteLocalFile, false)
  })

  it('refuses query strings and fragments on managed upload paths', () => {
    for (const decoratedPath of [
      '/uploads/admin/banners/banner.webp?download=1',
      '/uploads/products/product.webp#preview',
    ]) {
      const classified = classifyAdminMediaPath(decoratedPath)

      assert.equal(classified.bucket, 'admin-managed-upload')
      assert.equal(classified.canDeleteLocalFile, false)
    }
  })

  it('resolves managed upload candidates inside public uploads only', () => {
    const filePath = resolveManagedMediaFilePath('/uploads/admin/banners/banner.webp', '/uploads/admin/')

    assert.equal(
      filePath,
      path.resolve(process.cwd(), 'public', 'uploads', 'admin', 'banners', 'banner.webp'),
    )
    assert.equal(resolveManagedMediaFilePath('/uploads/admin/../assets/banner.webp', '/uploads/admin/'), null)
    assert.equal(resolveManagedMediaFilePath('/assets/banners/banner.webp', '/uploads/admin/'), null)
    assert.equal(resolveManagedMediaFilePath('/uploads/admin/', '/uploads/admin/'), null)
    assert.equal(resolveManagedMediaFilePath('/uploads/admin/banners/banner.webp?download=1', '/uploads/admin/'), null)
    assert.equal(resolveManagedMediaFilePath('/assets/banners/banner.webp', '/assets/'), null)
  })

  it('plans deletion only when callers provide no remaining active references', () => {
    const candidate = '/uploads/admin/banners/banner.webp'

    assert.equal(countRemainingAdminMediaReferences(candidate, [candidate, candidate]), 2)

    const stillReferenced = planAdminMediaLocalDeletion(candidate, [
      '/uploads/admin/banners/banner.webp',
      '/uploads/products/other.webp',
    ])
    const unreferenced = planAdminMediaLocalDeletion(candidate, [])
    const protectedAsset = planAdminMediaLocalDeletion('/assets/banners/home-hero-iphone-15-pro.jpg', [])

    assert.equal(stillReferenced.canDeleteLocalFile, false)
    assert.equal(stillReferenced.remainingReferenceCount, 1)
    assert.match(stillReferenced.reason, /still referenced/)
    assert.equal(unreferenced.canDeleteLocalFile, true)
    assert.equal(unreferenced.remainingReferenceCount, 0)
    assert.equal(protectedAsset.canDeleteLocalFile, false)
    assert.equal(protectedAsset.bucket, 'protected-source-code-asset')
  })

  it('routes admin cleanup helper path resolution through the classifier', () => {
    assert.equal(
      resolveManagedPublicUploadPath('/uploads/admin/banners/banner.webp', '/uploads/admin/'),
      path.resolve(process.cwd(), 'public', 'uploads', 'admin', 'banners', 'banner.webp'),
    )
    assert.equal(resolveManagedPublicUploadPath('/uploads/admin/', '/uploads/admin/'), null)
    assert.equal(resolveManagedPublicUploadPath('/uploads/admin/banners/banner.webp?download=1', '/uploads/admin/'), null)
    assert.equal(resolveManagedPublicUploadPath('/assets/banners/banner.webp', '/uploads/admin/'), null)
  })

  it('deletes only temp managed admin and product fixtures', async () => {
    await withTempProject(async (root) => {
      const adminPath = path.join(root, 'public', 'uploads', 'admin', 'banners', 'banner.webp')
      const productPath = path.join(root, 'public', 'uploads', 'products', 'product.webp')
      const sourceAssetPath = path.join(root, 'public', 'assets', 'banners', 'source.webp')

      await fs.mkdir(path.dirname(adminPath), { recursive: true })
      await fs.mkdir(path.dirname(productPath), { recursive: true })
      await fs.mkdir(path.dirname(sourceAssetPath), { recursive: true })
      await fs.writeFile(adminPath, 'admin')
      await fs.writeFile(productPath, 'product')
      await fs.writeFile(sourceAssetPath, 'source')

      await deleteManagedAdminUpload('/uploads/admin/banners/banner.webp', { referenceSource: noReferenceSource })
      await deleteManagedUpload('/uploads/products/product.webp', { referenceSource: noReferenceSource })
      await deleteManagedAdminUpload('/assets/banners/source.webp')

      await assert.rejects(fs.stat(adminPath), { code: 'ENOENT' })
      await assert.rejects(fs.stat(productPath), { code: 'ENOENT' })
      await assert.doesNotReject(fs.stat(sourceAssetPath))
    })
  })

  it('refuses temp managed root, traversal, query, fragment, remote, and data cleanup inputs', async () => {
    await withTempProject(async (root) => {
      const adminPath = path.join(root, 'public', 'uploads', 'admin', 'banners', 'banner.webp')
      const productPath = path.join(root, 'public', 'uploads', 'products', 'product.webp')

      await fs.mkdir(path.dirname(adminPath), { recursive: true })
      await fs.mkdir(path.dirname(productPath), { recursive: true })
      await fs.writeFile(adminPath, 'admin')
      await fs.writeFile(productPath, 'product')

      await deleteManagedAdminUpload('/uploads/admin/')
      await deleteManagedAdminUpload('/uploads/admin/banners/banner.webp?download=1')
      await deleteManagedAdminUpload('/uploads/admin/..\\assets\\banners\\source.webp')
      await deleteManagedAdminUpload('https://cdn.example.test/banner.webp')
      await deleteManagedAdminUpload('data:image/webp;base64,AAAA')
      await deleteManagedUpload('/uploads/products/product.webp#preview')
      await deleteManagedUpload('/uploads/products/../../package.json')

      await assert.doesNotReject(fs.stat(adminPath))
      await assert.doesNotReject(fs.stat(productPath))
    })
  })

  it('keeps admin and product cleanup roots isolated from each other', async () => {
    await withTempProject(async (root) => {
      const adminPath = path.join(root, 'public', 'uploads', 'admin', 'banners', 'banner.webp')
      const productPath = path.join(root, 'public', 'uploads', 'products', 'product.webp')

      await fs.mkdir(path.dirname(adminPath), { recursive: true })
      await fs.mkdir(path.dirname(productPath), { recursive: true })
      await fs.writeFile(adminPath, 'admin')
      await fs.writeFile(productPath, 'product')

      await deleteManagedAdminUpload('/uploads/products/product.webp')
      await deleteManagedUpload('/uploads/admin/banners/banner.webp')

      await assert.doesNotReject(fs.stat(adminPath))
      await assert.doesNotReject(fs.stat(productPath))
    })
  })
})
