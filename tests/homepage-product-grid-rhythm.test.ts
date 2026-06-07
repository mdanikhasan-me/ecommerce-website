import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const read = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), 'utf8')

describe('homepage product-grid rhythm contracts', () => {
  it('keeps ProductGrid as the shared homepage product section rhythm owner', () => {
    const source = read('src/frontend/components/home/ProductGrid.tsx')

    assert.match(source, /eyebrow\?: string/)
    assert.match(source, /className\?: string/)
    assert.match(source, /gridClassName\?: string/)
    assert.match(source, /product-section-rhythm w-full/)
    assert.match(source, /product-section-header/)
    assert.match(source, /product-grid-rhythm grid grid-cols-2 gap-x-2\.5 gap-y-3\.5/)
    assert.match(source, /sm:gap-x-3\.5 sm:gap-y-5/)
    assert.match(source, /lg:gap-x-4 lg:gap-y-6/)
    assert.match(source, /min-\[1120px\]:grid-cols-5 2xl:grid-cols-6/)
    assert.match(source, /const HOME_PRODUCT_IMAGE_SIZES = '\(max-width: 640px\) 50vw, \(max-width: 768px\) 33vw, \(max-width: 1120px\) 25vw, \(max-width: 1536px\) 20vw, 16vw'/)
  })

  it('keeps homepage product sections on the shared ProductGrid rhythm path', () => {
    const source = read('src/app/(store)/page.tsx')

    assert.match(source, /storefront-home-stack/)
    assert.equal((source.match(/<ProductGrid/g) ?? []).length, 3)
    assert.match(source, /eyebrow="Featured catalog"/)
    assert.match(source, /eyebrow="Popular picks"/)
    assert.match(source, /eyebrow="Recently added"/)
    assert.match(source, /container-site py-5 sm:py-7 lg:py-8/)
    assert.match(source, /container-site pb-9 pt-5 sm:pb-12 sm:pt-7 lg:py-8/)
    assert.match(source, /shouldLeadWithBestSellers = featured\.length === 0 && bestSellers\.length > 0/)
    assert.match(source, /const bestSellersSection = bestSellers\.length > 0 \? \(/)
    assert.doesNotMatch(source, /PromoSection/)
    assert.ok(source.indexOf('title="Featured Products"') < source.indexOf('<FeaturedCategories categories={categories} />'))
    assert.ok(source.indexOf('<FeaturedCategories categories={categories} />') < source.indexOf('{!shouldLeadWithBestSellers ? bestSellersSection : null}'))
    assert.ok(source.indexOf('{!shouldLeadWithBestSellers ? bestSellersSection : null}') < source.indexOf('title="New Arrivals"'))
  })

  it('keeps product-grid action labels specific without changing product card behavior', () => {
    const gridSource = read('src/frontend/components/home/ProductGrid.tsx')
    const cardSource = read('src/frontend/components/product/ProductCard.tsx')

    assert.match(gridSource, /const viewAllLabel = `View all \$\{title\.toLowerCase\(\)\}`/)
    assert.match(gridSource, /aria-label=\{viewAllLabel\}/)
    assert.match(cardSource, /const addToCartActionLabel = `Add \$\{product\.name\} to cart`/)
    assert.match(cardSource, /const wishlistActionLabel = isWished \? `Remove \$\{product\.name\} from wishlist` : `Add \$\{product\.name\} to wishlist`/)
    assert.match(cardSource, /const compareActionLabel = isCompared \? `Open compare for \$\{product\.name\}` : `Compare \$\{product\.name\}`/)
  })

  it('keeps ProductGrid DB-free and API-free', () => {
    const source = read('src/frontend/components/home/ProductGrid.tsx')

    assert.doesNotMatch(source, /@\/backend\/database/)
    assert.doesNotMatch(source, /\bdb\./)
    assert.doesNotMatch(source, /\bPrisma\b/)
    assert.doesNotMatch(source, /fetch\(/)
    assert.doesNotMatch(source, /\/api\//)
  })

  it('keeps rhythm CSS scoped away from media assets and paused visual surfaces', () => {
    const globals = read('src/app/globals.css')
    const gridSource = read('src/frontend/components/home/ProductGrid.tsx')
    const homeSource = read('src/app/(store)/page.tsx')
    const combined = `${globals}\n${gridSource}\n${homeSource}`

    assert.match(globals, /\.storefront-home-stack/)
    assert.match(globals, /\.product-section-rhythm/)
    assert.match(globals, /\.product-section-header/)
    assert.match(globals, /\.product-grid-rhythm > \.product-card/)
    assert.doesNotMatch(combined, /\/assets\/products\//)
    assert.doesNotMatch(combined, /\/uploads\//)
    assert.doesNotMatch(combined, /payment-logo/i)
  })
})
