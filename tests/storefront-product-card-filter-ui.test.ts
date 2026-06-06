import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const read = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), 'utf8')

describe('storefront ProductCard and filter UI contracts', () => {
  it('keeps ProductCard action names product-aware and state-aware', () => {
    const source = read('src/frontend/components/product/ProductCard.tsx')

    assert.match(source, /const wishlistActionLabel = isWished \? `Remove \$\{product\.name\} from wishlist` : `Add \$\{product\.name\} to wishlist`/)
    assert.equal((source.match(/aria-label=\{wishlistActionLabel\}/g) ?? []).length, 2)
    assert.equal((source.match(/title=\{wishlistActionLabel\}/g) ?? []).length, 2)
    assert.doesNotMatch(source, /aria-label="Add to wishlist"/)
    assert.doesNotMatch(source, /title="Add to wishlist"/)

    assert.match(source, /const compareActionLabel = isCompared \? `Open compare for \$\{product\.name\}` : `Compare \$\{product\.name\}`/)
    assert.match(source, /aria-label=\{compareActionLabel\}/)
    assert.match(source, /title=\{compareActionLabel\}/)
    assert.doesNotMatch(source, /aria-label="Compare"/)
    assert.doesNotMatch(source, /title="Compare"/)

    assert.match(source, /const addToCartActionLabel = `Add \$\{product\.name\} to cart`/)
    assert.equal((source.match(/aria-label=\{addToCartActionLabel\}/g) ?? []).length, 2)
  })

  it('keeps ProductCard media, price, rating, and badge semantics renderable without DB access', () => {
    const source = read('src/frontend/components/product/ProductCard.tsx')

    assert.match(source, /const productLinkLabel = `View \$\{product\.name\} details`/)
    assert.ok((source.match(/aria-label=\{productLinkLabel\}/g) ?? []).length >= 3)
    assert.match(source, /alt=\{product\.name\}/)
    assert.match(source, /const ratingLabel = product\.reviewCount > 0/)
    assert.ok((source.match(/role="img" aria-label=\{ratingLabel\}/g) ?? []).length >= 2)
    assert.match(source, /formatPrice\(price\)/)
    assert.match(source, /formatPrice\(product\.basePrice\)/)
    assert.match(source, /badge-sale/)
    assert.match(source, /badge-new/)
    assert.match(source, /badge-bestseller/)
  })

  it('gives listing filters explicit groups while preserving query behavior', () => {
    const source = read('src/frontend/components/product/SearchFiltersPanel.tsx')

    assert.ok((source.match(/<fieldset/g) ?? []).length >= 4)
    assert.match(source, /<legend className="mb-2 text-sm font-semibold">Category<\/legend>/)
    assert.match(source, /<legend className="mb-2 text-sm font-semibold">Price Range \(Tk\)<\/legend>/)
    assert.match(source, /<legend className="mb-2 text-sm font-semibold">Minimum Rating<\/legend>/)
    assert.match(source, /<legend className="mb-2 text-sm font-semibold">Availability<\/legend>/)
    assert.match(source, /role="group" aria-label="Minimum rating"/)
    assert.match(source, /ariaPressed\(selected\)/)
    assert.match(source, /aria-label=\{selected \? `Clear minimum rating \$\{rating\} stars` : `Minimum rating \$\{rating\} stars`\}/)

    assert.ok((source.match(/sp\.delete\('page'\)/g) ?? []).length >= 2)
    assert.match(source, /router\.push\(query \? `\$\{basePath\}\?\$\{query\}` : basePath\)/)
    assert.match(source, /onNavigate\?\.\(\)/)
  })

  it('uses specific sort and mobile filter labels without changing navigation contracts', () => {
    const sortSource = read('src/frontend/components/search/SortSelect.tsx')
    const mobileSource = read('src/frontend/components/product/MobileSearchFilters.tsx')

    assert.match(sortSource, /aria-label="Sort products"/)
    assert.match(sortSource, /title="Sort products"/)
    assert.doesNotMatch(sortSource, /aria-label="Select option"/)
    assert.match(sortSource, /url\.searchParams\.set\('sort', e\.target\.value\)/)
    assert.match(sortSource, /url\.searchParams\.delete\('page'\)/)
    assert.match(sortSource, /window\.location\.href = url\.toString\(\)/)

    assert.match(mobileSource, /ariaExpanded\(open\)/)
    assert.match(mobileSource, /aria-haspopup="dialog"/)
    assert.match(mobileSource, /aria-controls=\{panelId\}/)
    assert.match(mobileSource, /role="dialog"/)
    assert.match(mobileSource, /aria-modal="true"/)
    assert.match(mobileSource, /id=\{panelId\}/)
    assert.match(mobileSource, /id=\{titleId\}/)
    assert.match(mobileSource, /aria-labelledby=\{titleId\}/)
    assert.match(mobileSource, /onNavigate=\{\(\) => setOpen\(false\)\}/)
  })

  it('does not introduce unsupported public claims into the changed storefront UI files', () => {
    const changedUi = [
      read('src/frontend/components/product/ProductCard.tsx'),
      read('src/frontend/components/product/SearchFiltersPanel.tsx'),
      read('src/frontend/components/product/MobileSearchFilters.tsx'),
      read('src/frontend/components/search/SortSelect.tsx'),
    ].join('\n')

    assert.doesNotMatch(changedUi, /secure checkout/i)
    assert.doesNotMatch(changedUi, /trusted marketplace/i)
    assert.doesNotMatch(changedUi, /guaranteed/i)
    assert.doesNotMatch(changedUi, /instant tracking/i)
  })
})
