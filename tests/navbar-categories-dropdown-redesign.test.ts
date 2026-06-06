import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'

import { STOREFRONT_ICON_ASSETS } from '@/shared/storefront-icons'

const repoRoot = process.cwd()
const headerSource = readFileSync(
  path.join(repoRoot, 'src/frontend/components/layout/Header.tsx'),
  'utf8',
)

function expectLocalIcon(iconName: keyof typeof STOREFRONT_ICON_ASSETS) {
  const asset = STOREFRONT_ICON_ASSETS[iconName]

  assert.match(asset, /^\/assets\/icons\/ui\/.+\.svg$/)
  assert.doesNotMatch(asset, /^https?:\/\//)
  assert.equal(existsSync(path.join(repoRoot, 'public', asset.replace(/^\//, ''))), true)
}

describe('Step 312 desktop navbar categories dropdown redesign', () => {
  it('renders the main category rail with Electronics as the default selected department', () => {
    assert.match(headerSource, /DEFAULT_DESKTOP_CATEGORY_SLUG = 'electronics'/)
    assert.match(headerSource, /data-testid="desktop-categories-menu"/)
    assert.match(headerSource, /data-testid="desktop-categories-rail"/)
    assert.match(headerSource, /data-testid="desktop-category-selected-panel"/)

    for (const label of [
      'Electronics',
      'Fashion',
      'Home & Appliances',
      'Beauty & Health',
      'Sports & Fitness',
      'Books & Stationery',
      'Gaming',
      'Toys & Collectibles',
    ]) {
      assert.match(headerSource, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    }
  })

  it('renders Electronics subcategory tiles before the View all electronics tile', () => {
    const electronicsBlock = headerSource.slice(
      headerSource.indexOf("name: 'Electronics'"),
      headerSource.indexOf("name: 'Fashion'"),
    )
    const tileRenderBlock = headerSource.slice(
      headerSource.indexOf('data-testid="desktop-subcategory-tiles"'),
      headerSource.indexOf('data-testid={`desktop-subcategory-tile-view-all-${selectedDesktopCategory.slug}`'),
    )
    const viewAllIndex = headerSource.indexOf('data-testid={`desktop-subcategory-tile-view-all-${selectedDesktopCategory.slug}`')

    for (const label of ['Mobile Phones', 'Laptops', 'Audio', 'Wearables']) {
      assert.match(electronicsBlock, new RegExp(label))
    }

    assert.match(headerSource, /getViewAllCategoryLabel\(selectedDesktopCategory\)/)
    assert.ok(tileRenderBlock.indexOf('selectedDesktopCategory.sub.map') > -1)
    assert.ok(viewAllIndex > headerSource.indexOf('selectedDesktopCategory.sub.map'))
  })

  it('uses local icons for the dropdown and does not introduce remote icon URLs', () => {
    for (const icon of [
      'category-electronics',
      'category-fashion',
      'category-home-appliances',
      'category-beauty-health',
      'category-sports-fitness',
      'category-books-stationery',
      'category-gaming',
      'category-toys-collectibles',
      'phone',
      'laptop',
      'headphones',
      'watch',
      'grid',
    ] as const) {
      assert.match(headerSource, new RegExp(`['"]${icon}['"]`))
      expectLocalIcon(icon)
    }

    assert.doesNotMatch(headerSource, /https?:\/\/.*(?:icon|svg)/i)
  })

  it('preserves header guardrails and existing route behavior', () => {
    assert.doesNotMatch(headerSource, /Free delivery on orders over Tk 2,000/)
    assert.doesNotMatch(headerSource, /href="\/deals"|href: '\/deals'/)
    assert.doesNotMatch(headerSource, /href="\/collections"|href: '\/collections'/)
    assert.doesNotMatch(headerSource, /href="\/payments"|href: '\/payments'/)
    assert.match(headerSource, /getCategoryHref\(slug: string\)/)
    assert.match(headerSource, /return `\/category\/\$\{slug\}`/)
  })

  it('keeps mobile header controls available while limiting the redesign to desktop dropdown markup', () => {
    const mobileHeaderIndex = headerSource.indexOf('data-testid="mobile-header"')

    assert.ok(mobileHeaderIndex > -1)
    assert.ok(headerSource.indexOf('data-testid="mobile-menu-button"', mobileHeaderIndex) > mobileHeaderIndex)
    assert.ok(headerSource.indexOf('data-testid="mobile-search-button"', mobileHeaderIndex) > mobileHeaderIndex)
    assert.ok(headerSource.indexOf('data-testid="mobile-cart-button"', mobileHeaderIndex) > mobileHeaderIndex)
    assert.ok(headerSource.indexOf('data-testid="mobile-profile-link"', mobileHeaderIndex) > mobileHeaderIndex)
  })

  it('keeps desktop dropdown keyboard and dismissal hooks wired', () => {
    assert.match(headerSource, /onFocus=\{openCategoriesDropdown\}/)
    assert.match(headerSource, /onFocus=\{\(\) => setSelectedDesktopCategorySlug\(category\.slug\)\}/)
    assert.match(headerSource, /handleEscape/)
    assert.match(headerSource, /setIsCategoriesOpen\(false\)/)
    assert.match(headerSource, /handleClickOutside/)
    assert.match(headerSource, /onBlur=\{\(event\) =>/)
  })
})
