import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import { getCategoryMediaPath } from '@/shared/category-media'
import {
  BANNER_IMAGE_REPAIRS,
  CATEGORY_IMAGE_REPAIRS,
  repairStorefrontImageSources,
} from '../scripts/repair-storefront-image-sources.mjs'
import { CANONICAL_PRODUCT_IMAGE_REPLACEMENTS } from '../scripts/audit-storefront-media-sources.mjs'

function publicAssetExists(pathname: string) {
  return existsSync(join(process.cwd(), 'public', pathname.replace(/^\//, '')))
}

describe('storefront image source of truth', () => {
  it('keeps active category media on canonical local asset files', () => {
    for (const repair of CATEGORY_IMAGE_REPAIRS) {
      assert.equal(getCategoryMediaPath({ slug: repair.slug }), repair.image)
      assert.equal(publicAssetExists(repair.image), true, `${repair.image} should exist`)
      assert.notEqual(repair.image, '/assets/categories/baby-kids.jpg')
    }
  })

  it('keeps Toys & Collectibles canonical without restoring Baby & Kids artwork', () => {
    assert.equal(getCategoryMediaPath({ slug: 'toys-collectibles' }), '/assets/categories/toys-collectibles.jpg')
    assert.equal(publicAssetExists('/assets/categories/toys-collectibles.jpg'), true)
    assert.equal(publicAssetExists('/assets/categories/baby-kids.jpg'), false)
    assert.notEqual(getCategoryMediaPath({ slug: 'baby-kids' }), '/assets/categories/baby-kids.jpg')
  })

  it('keeps homepage banner seed references on recoverable local assets', () => {
    const seed = readFileSync(join(process.cwd(), 'prisma/seed.ts'), 'utf8')
    const bannerSeed = seed.slice(seed.indexOf('// BANNERS'))

    assert.equal(bannerSeed.includes('photo-1695048133142-1a20484d2569?w=1600'), false)
    assert.equal(bannerSeed.includes('photo-1706165965474-1e45ede2e5c4?w=1600'), false)
    assert.ok(bannerSeed.includes('/assets/banners/home-hero-iphone-15-pro.jpg'))
    assert.ok(bannerSeed.includes('/assets/banners/home-hero-galaxy-s24-ultra.jpg'))

    for (const repair of BANNER_IMAGE_REPAIRS) {
      assert.equal(publicAssetExists(repair.to), true, `${repair.to} should exist`)
    }
  })

  it('keeps approved product seed image replacements on local source-of-truth assets', () => {
    const seed = readFileSync(join(process.cwd(), 'prisma/seed.ts'), 'utf8')

    for (const replacement of CANONICAL_PRODUCT_IMAGE_REPLACEMENTS) {
      assert.ok(seed.includes(`imageUrl: '${replacement.local}'`), `${replacement.product} should use local seed asset`)
      assert.equal(seed.includes(`imageUrl: '${replacement.remote}'`), false, `${replacement.product} should not use stale remote seed asset`)
      assert.equal(publicAssetExists(replacement.local), true, `${replacement.local} should exist`)
    }
  })

  it('repairs only Category.image and Banner.imageUrl fields', async () => {
    const updates: Array<{ model: string; where: unknown; data: unknown }> = []
    const prisma = {
      category: {
        updateMany(args: { where: unknown; data: unknown }) {
          updates.push({ model: 'category', ...args })
          return Promise.resolve({ count: 1 })
        },
      },
      banner: {
        updateMany(args: { where: unknown; data: unknown }) {
          updates.push({ model: 'banner', ...args })
          return Promise.resolve({ count: 1 })
        },
      },
    }

    const results = await repairStorefrontImageSources({ prisma })

    assert.equal(results.categories.length, CATEGORY_IMAGE_REPAIRS.length)
    assert.equal(results.banners.length, BANNER_IMAGE_REPAIRS.length)
    assert.equal(updates.length, CATEGORY_IMAGE_REPAIRS.length + BANNER_IMAGE_REPAIRS.length)

    for (const [index, repair] of CATEGORY_IMAGE_REPAIRS.entries()) {
      assert.deepEqual(updates[index], {
        model: 'category',
        where: { slug: repair.slug },
        data: { image: repair.image },
      })
    }

    for (const [index, repair] of BANNER_IMAGE_REPAIRS.entries()) {
      assert.deepEqual(updates[CATEGORY_IMAGE_REPAIRS.length + index], {
        model: 'banner',
        where: { imageUrl: repair.from },
        data: { imageUrl: repair.to },
      })
    }
  })
})
