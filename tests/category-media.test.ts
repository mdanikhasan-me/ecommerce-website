import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import { getCategoryMediaPath } from '@/shared/category-media'

function publicAssetExists(pathname: string) {
  return existsSync(join(process.cwd(), 'public', pathname.replace(/^\//, '')))
}

describe('category media mapping', () => {
  it('resolves toys and collectibles to a non-missing local image fallback', () => {
    const mediaPath = getCategoryMediaPath({ slug: 'toys-collectibles' })

    assert.notEqual(mediaPath, '/assets/categories/baby-kids.jpg')
    assert.equal(publicAssetExists(mediaPath), true)
  })

  it('keeps the legacy baby-kids slug from pointing at the deleted image', () => {
    const mediaPath = getCategoryMediaPath({ slug: 'baby-kids' })

    assert.notEqual(mediaPath, '/assets/categories/baby-kids.jpg')
    assert.equal(publicAssetExists(mediaPath), true)
  })
})
