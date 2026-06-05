import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import {
  CATEGORY_PHOTO_ASSETS,
  getCategoryMediaBasePath,
  getCategoryMediaPath,
  getSubcategoryMediaPath,
} from '@/shared/category-media'

const CANONICAL_CATEGORY_SLUGS = [
  'beauty-health',
  'books-stationery',
  'electronics',
  'fashion',
  'gaming',
  'home-appliances',
  'sports-fitness',
  'toys-collectibles',
]

function publicAssetExists(pathname: string) {
  return existsSync(join(process.cwd(), 'public', pathname.split('?')[0].replace(/^\//, '')))
}

function publicAssetHashPrefix(pathname: string) {
  const file = join(process.cwd(), 'public', pathname.replace(/^\//, ''))
  return createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 12)
}

describe('category media mapping', () => {
  it('keeps canonical category image URLs local and content-versioned', () => {
    for (const slug of CANONICAL_CATEGORY_SLUGS) {
      const asset = CATEGORY_PHOTO_ASSETS[slug]
      const mediaPath = getCategoryMediaPath({ slug })

      assert.ok(asset, `${slug} should have a category media asset`)
      assert.equal(asset.version, publicAssetHashPrefix(asset.path), `${slug} version should match image hash`)
      assert.equal(mediaPath, `${asset.path}?v=${asset.version}`)
      assert.equal(publicAssetExists(mediaPath), true)
      assert.equal(mediaPath.startsWith('/assets/categories/'), true)
      assert.match(mediaPath, /\.jpg\?v=[a-f0-9]{12}$/)
    }
  })

  it('resolves toys and collectibles to a non-missing local image fallback', () => {
    const mediaPath = getCategoryMediaPath({ slug: 'toys-collectibles' })

    assert.notEqual(mediaPath, '/assets/categories/baby-kids.jpg')
    assert.equal(publicAssetExists(mediaPath), true)
    assert.equal(getCategoryMediaBasePath({ slug: 'toys-collectibles' }), '/assets/categories/toys-collectibles.jpg')
  })

  it('keeps the legacy baby-kids slug from pointing at the deleted image', () => {
    const mediaPath = getCategoryMediaPath({ slug: 'baby-kids' })

    assert.notEqual(mediaPath, '/assets/categories/baby-kids.jpg')
    assert.equal(publicAssetExists(mediaPath), true)
    assert.equal(getCategoryMediaBasePath({ slug: 'baby-kids' }), '/assets/categories/gaming.jpg')
    assert.match(mediaPath, /^\/assets\/categories\/gaming\.jpg\?v=[a-f0-9]{12}$/)
  })

  it('renders only local managed subcategory media on public category surfaces', () => {
    assert.equal(
      getSubcategoryMediaPath({
        slug: 'mobile-phones',
        image: '/assets/categories/subcategories/mobile-phones.webp',
      }),
      '/assets/categories/subcategories/mobile-phones.webp',
    )
    assert.equal(
      getSubcategoryMediaPath({
        slug: 'audio',
        image: '/uploads/admin/categories/audio/image-test.webp',
      }),
      '/uploads/admin/categories/audio/image-test.webp',
    )
    assert.equal(getSubcategoryMediaPath({ slug: 'wearables', image: null }), null)
    assert.equal(getSubcategoryMediaPath({ slug: 'laptops', image: 'https://example.com/laptop.webp' }), null)
    assert.equal(getSubcategoryMediaPath({ slug: 'laptops', image: '/assets/categories/electronics.jpg' }), null)
  })
})
