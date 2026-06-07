import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import { STOREFRONT_ICON_ASSETS } from '@/shared/storefront-icons'

const source = readFileSync(
  join(process.cwd(), 'src/app/(store)/category/page.tsx'),
  'utf8',
)

describe('category page UI/UX guardrails', () => {
  it('keeps the approved category labels and default Electronics selection available', () => {
    assert.match(source, /All Categories/)
    assert.match(source, /Browse departments and subcategories, then explore our latest products\./)
    assert.match(source, /category\.slug === 'electronics'/)
  })

  it('renders subcategory items before the View All category CTA', () => {
    const detailPanel = source.slice(source.indexOf('function CategoryDetailPanel'))
    const childrenMapIndex = detailPanel.indexOf('category.children.map')
    const viewAllIndex = detailPanel.indexOf('<ViewAllCategoryLink category={category} />')

    assert.ok(childrenMapIndex > -1)
    assert.ok(viewAllIndex > -1)
    assert.ok(childrenMapIndex < viewAllIndex)
  })

  it('does not include the removed service benefit strip copy', () => {
    assert.doesNotMatch(source, /100% Authentic|Fast Delivery|Easy Support/)
  })

  it('uses managed subcategory media instead of hardcoded product photos', () => {
    assert.match(source, /getSubcategoryMediaPath/)
    assert.doesNotMatch(source, /unsplash|pexels|data:image|placeholder\.(?:jpg|jpeg|png|webp)|Mobile Phones.*\.jpg|Laptops.*\.jpg/)
  })

  it('uses local category icon assets instead of lucide icons on the category page', () => {
    assert.doesNotMatch(source, /from 'lucide-react'/)
    assert.match(source, /category-electronics/)
    assert.match(source, /category-view-all/)
  })

  it('renders neutral missing-image surfaces without repeated category icons or public placeholder copy', () => {
    const surfaceStart = source.indexOf('function EmptyMediaSurface')
    const surfaceEnd = source.indexOf('function ViewAllCategoryLink')
    const surfaceSource = source.slice(surfaceStart, surfaceEnd)

    assert.ok(surfaceStart > -1)
    assert.ok(surfaceEnd > surfaceStart)
    assert.doesNotMatch(surfaceSource, /LocalIcon|iconName|coming soon|admin upload|placeholder/i)
    assert.doesNotMatch(source, /data:image|placeholder\.(?:jpg|jpeg|png|webp)|coming soon|admin upload/i)
  })

  it('keeps subcategory cards photo-ready instead of shrinking missing media into tiny buttons', () => {
    assert.match(source, /h-\[7\.25rem\]/)
    assert.match(source, /sm:h-\[7\.75rem\]/)
    assert.match(source, /2xl:h-\[8\.25rem\]/)
    assert.match(source, /min-\[1120px\]:grid-cols-3/)
    assert.match(source, /min-\[1380px\]:grid-cols-4/)
    assert.match(source, /object-cover/)
    assert.match(source, /data-empty-media-surface/)
    assert.match(source, /min-h-\[96px\]/)
    assert.match(source, /w-\[96px\]/)
    assert.doesNotMatch(source, /aspect-\[16\/10\]|h-12 w-12|w-\[70px\]|min-h-\[78px\]/)
  })

  it('adds a capped public All Products section below the category explorer', () => {
    assert.match(source, /const ALL_PRODUCTS_LIMIT = 24/)
    assert.match(source, /getAllProductsPreview/)
    assert.match(source, /getBuyerVisibleProductWhere\(\)/)
    assert.match(source, /take: ALL_PRODUCTS_LIMIT/)
    assert.match(source, /title="All Products"/)
    assert.match(source, /viewAllHref="\/search"/)
    assert.match(source, /gridClassName="sm:grid-cols-3 md:grid-cols-4 min-\[1120px\]:grid-cols-5 2xl:grid-cols-6"/)
    assert.doesNotMatch(source, /take:\s*(?:100|999)/)
  })

  it('keeps category page typography within the storefront page scale', () => {
    assert.match(source, /text-\[1\.85rem\]/)
    assert.match(source, /sm:text-3xl/)
    assert.doesNotMatch(source, /font-black|font-extrabold|text-\[(?:3|4|5)\.[0-9]+rem\]/)
  })

  it('keeps required category UI icon files local and source-controlled', () => {
    const requiredIconNames = [
      'category-electronics',
      'category-fashion',
      'category-home-appliances',
      'category-beauty-health',
      'category-sports-fitness',
      'category-books-stationery',
      'category-gaming',
      'category-toys-collectibles',
      'category-view-all',
    ] as const

    for (const iconName of requiredIconNames) {
      const iconPath = STOREFRONT_ICON_ASSETS[iconName]

      assert.match(iconPath, /^\/assets\/icons\/ui\/categories\/.+\.svg$/)
      assert.equal(existsSync(join(process.cwd(), 'public', iconPath.replace(/^\//, ''))), true)
    }
  })
})
