import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import { getCategoryMediaBasePath, getCategoryMediaPath } from '@/shared/category-media'
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
      const mediaPath = getCategoryMediaPath({ slug: repair.slug })

      assert.equal(getCategoryMediaBasePath({ slug: repair.slug }), repair.image)
      assert.equal(mediaPath.startsWith(`${repair.image}?v=`), true)
      assert.equal(publicAssetExists(repair.image), true, `${repair.image} should exist`)
      assert.notEqual(repair.image, '/assets/categories/baby-kids.jpg')
    }
  })

  it('keeps Toys & Collectibles canonical without restoring Baby & Kids artwork', () => {
    assert.equal(getCategoryMediaBasePath({ slug: 'toys-collectibles' }), '/assets/categories/toys-collectibles.jpg')
    assert.equal(
      getCategoryMediaPath({ slug: 'toys-collectibles' }).startsWith('/assets/categories/toys-collectibles.jpg?v='),
      true,
    )
    assert.equal(publicAssetExists('/assets/categories/toys-collectibles.jpg'), true)
    assert.equal(publicAssetExists('/assets/categories/baby-kids.jpg'), false)
    assert.notEqual(getCategoryMediaPath({ slug: 'baby-kids' }), '/assets/categories/baby-kids.jpg')
  })

  it('keeps homepage seed free of product-linked hero banners', () => {
    const seed = readFileSync(join(process.cwd(), 'prisma/seed.ts'), 'utf8')

    assert.equal(seed.includes('// BANNERS'), false)
    assert.doesNotMatch(seed, /\/products\/[a-z0-9-]+/i)
  })

  it('keeps the product replacement manifest empty after the demo catalog cleanup', () => {
    assert.equal(CANONICAL_PRODUCT_IMAGE_REPLACEMENTS.length, 0)
  })

  it('repairs only Category.image fields once banner repairs are retired', async () => {
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
    assert.equal(BANNER_IMAGE_REPAIRS.length, 0)
    assert.equal(updates.length, CATEGORY_IMAGE_REPAIRS.length)

    for (const [index, repair] of CATEGORY_IMAGE_REPAIRS.entries()) {
      assert.deepEqual(updates[index], {
        model: 'category',
        where: { slug: repair.slug },
        data: { image: repair.image },
      })
    }
  })
})
