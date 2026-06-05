import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  MANAGED_MEDIA_STORAGE_POLICY,
  classifyAdminMediaPath,
  normalizeManagedMediaStorageSegment,
  planManagedMediaStorageKey,
} from '@/backend/admin/media-lifecycle'

describe('admin managed media storage policy', () => {
  it('documents current local upload roots without claiming provider storage is implemented', () => {
    assert.deepEqual(MANAGED_MEDIA_STORAGE_POLICY.currentLocalUploadRoots, [
      '/uploads/admin/',
      '/uploads/products/',
    ])
    assert.deepEqual(MANAGED_MEDIA_STORAGE_POLICY.protectedSourceAssetRoots, [
      '/assets/',
      '/images/',
    ])
    assert.equal(MANAGED_MEDIA_STORAGE_POLICY.categoryFolderingImprovesPerformance, false)
    assert.equal(MANAGED_MEDIA_STORAGE_POLICY.objectStorageImplemented, false)
    assert.equal(MANAGED_MEDIA_STORAGE_POLICY.deletionLedgerImplemented, false)
    assert.equal(MANAGED_MEDIA_STORAGE_POLICY.recycleWindowImplemented, false)
  })

  it('plans product storage keys from stable product/media identifiers instead of category folders', () => {
    const plan = planManagedMediaStorageKey({
      namespace: 'products',
      ownerId: 'Product 123',
      mediaId: 'Media 456',
      variant: 'Card',
      extension: 'WEBP',
      categorySlug: 'electronics',
      subcategorySlug: 'phones',
    })

    assert.equal(plan.key, 'products/product-123/media/media-456/card.webp')
    assert.equal(plan.ignoresMutableCategoryFolders, true)
    assert.equal(plan.key.includes('electronics'), false)
    assert.equal(plan.key.includes('phones'), false)
    assert.match(plan.reason, /category assignments can change/)
  })

  it('normalizes unsafe storage-key segments and falls back to safe extensions', () => {
    const plan = planManagedMediaStorageKey({
      namespace: 'admin',
      ownerId: '../Banners//Hero',
      mediaId: 'media?token=secret',
      variant: 'Desktop Hero',
      extension: '../../exe',
    })

    assert.equal(plan.key, 'admin/banners-hero/media/media-token-secret/desktop-hero.webp')
    assert.equal(normalizeManagedMediaStorageSegment('..//Category Name!!'), 'category-name')
    assert.equal(normalizeManagedMediaStorageSegment(''), 'media')
  })

  it('keeps storage-key planning separate from current local deletion classification', () => {
    const futureKey = planManagedMediaStorageKey({
      namespace: 'products',
      ownerId: 'product-1',
      mediaId: 'media-1',
      variant: 'detail',
      extension: 'jpg',
    })

    assert.equal(futureKey.key, 'products/product-1/media/media-1/detail.jpg')
    assert.equal(classifyAdminMediaPath(`/${futureKey.key}`).canDeleteLocalFile, false)
    assert.equal(classifyAdminMediaPath('/uploads/products/product.webp').canDeleteLocalFile, true)
  })
})
