import assert from 'node:assert/strict'
import path from 'node:path'
import { describe, it } from 'node:test'

import {
  canDeleteAdminMediaLocalFile,
  classifyAdminMediaPath,
  resolveManagedMediaFilePath,
} from '@/backend/admin/media-lifecycle'

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
  })
})
