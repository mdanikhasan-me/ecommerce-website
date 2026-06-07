import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const read = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), 'utf8')

describe('storefront product and category density guardrails', () => {
  it('keeps product card media from expanding into oversized desktop squares', () => {
    const source = read('src/frontend/components/product/ProductCard.tsx')

    assert.match(source, /className="relative block aspect-\[4\/3\]"/)
    assert.doesNotMatch(source, /sm:aspect-square/)
  })

  it('keeps homepage category tiles dense enough at laptop and desktop widths', () => {
    const source = read('src/frontend/components/home/FeaturedCategories.tsx')

    assert.match(source, /sm:grid lg:grid-cols-4/)
    assert.match(source, /min-\[1120px\]:grid-cols-6/)
    assert.match(source, /2xl:grid-cols-8/)
    assert.match(source, /sizes="\(max-width: 640px\) 40vw, \(max-width: 1280px\) 20vw, 16vw"/)
  })

  it('keeps category and search listing grids from staying at four huge columns', () => {
    for (const path of [
      'src/app/(store)/category/[slug]/page.tsx',
      'src/app/(store)/search/page.tsx',
    ]) {
      const source = read(path)

      assert.match(source, /min-\[1120px\]:grid-cols-4/)
      assert.match(source, /min-\[1440px\]:grid-cols-5/)
      assert.match(source, /2xl:grid-cols-6/)
      assert.doesNotMatch(source, /xl:grid-cols-4/)
    }
  })

  it('keeps related and wishlist product grids on the same compact rhythm', () => {
    const productPage = read('src/app/(store)/products/[slug]/page.tsx')
    const wishlistPage = read('src/app/(store)/wishlist/page.tsx')

    assert.match(productPage, /min-\[1120px\]:grid-cols-5 2xl:grid-cols-6/)
    assert.match(productPage, /skeleton aspect-\[4\/3\]/)
    assert.match(wishlistPage, /min-\[1120px\]:grid-cols-5 2xl:grid-cols-6/)
    assert.doesNotMatch(wishlistPage, /md:grid-cols-4 gap-4/)
  })
})
