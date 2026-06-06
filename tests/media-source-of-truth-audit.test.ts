import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import {
  classifyPublicMediaPath,
  classifyReferenceTarget,
} from '../scripts/audit-public-media-source-of-truth.mjs'

describe('public media source-of-truth audit guardrails', () => {
  it('classifies bundled source assets as never-delete media', () => {
    const product = classifyPublicMediaPath('/assets/products/catalog/electronics/audio/sony/main.avif')
    const banner = classifyPublicMediaPath('/assets/banners/home-hero.jpg')
    const category = classifyPublicMediaPath('/assets/categories/electronics.jpg')

    assert.equal(product.folderOwnerGuess, 'product catalog source')
    assert.equal(product.safeToDelete, 'never')
    assert.equal(banner.folderOwnerGuess, 'banner source')
    assert.equal(banner.safeToDelete, 'never')
    assert.equal(category.folderOwnerGuess, 'category source')
    assert.equal(category.safeToDelete, 'never')
  })

  it('classifies managed upload roots separately from source assets', () => {
    const productUpload = classifyPublicMediaPath('/uploads/products/electronics/audio/sony/image.webp')
    const bannerUpload = classifyPublicMediaPath('/uploads/admin/banners/home/desktop.webp')
    const categoryUpload = classifyPublicMediaPath('/uploads/admin/categories/audio/image.webp')
    const subcategoryAssetUpload = classifyPublicMediaPath('/assets/categories/subcategories/audio.webp')

    assert.equal(productUpload.folderOwnerGuess, 'managed upload')
    assert.equal(productUpload.safeToDelete, 'only if unreferenced')
    assert.equal(bannerUpload.folderOwnerGuess, 'managed upload')
    assert.equal(categoryUpload.folderOwnerGuess, 'managed upload')
    assert.equal(subcategoryAssetUpload.ownershipClass, 'approved category media folder')
    assert.equal(subcategoryAssetUpload.safeToDelete, 'only if unreferenced')
  })

  it('refuses traversal-looking paths and flags remote image references', () => {
    const traversal = classifyPublicMediaPath('/uploads/products/../../package.json')
    const remote = classifyReferenceTarget('https://images.unsplash.com/photo-1?w=800')

    assert.equal(traversal.ownershipClass, 'unsafe local path')
    assert.equal(traversal.safeToDelete, 'unknown/manual review')
    assert.equal(remote.isRemote, true)
    assert.match(remote.riskClassification, /Unsplash media risk/)
  })

  it('keeps the audit script free of media and database mutation calls', () => {
    const source = readFileSync('scripts/audit-public-media-source-of-truth.mjs', 'utf8')

    assert.doesNotMatch(source, /\bfs\.(?:rm|unlink|rmdir|rename|copyFile)\b/)
    assert.doesNotMatch(source, /\bprisma\.[a-zA-Z0-9_]+\.(?:create|update|upsert|delete|deleteMany)\s*\(/)
  })
})
