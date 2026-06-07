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

  it('renders compact missing-image subcategory cards without blank media frames', () => {
    assert.match(source, /if \(!imageSrc\)/)
    assert.match(source, /min-h-\[104px\]/)
    assert.match(source, /sm:min-h-\[112px\]/)
    assert.match(source, /min-h-\[86px\]/)
    assert.match(source, /h-11 w-11/)
    assert.match(source, /h-10 w-10/)
    assert.doesNotMatch(source, /function EmptyMediaSurface|data-empty-media-surface/)
    assert.doesNotMatch(source, /data:image|placeholder\.(?:jpg|jpeg|png|webp)|coming soon|admin upload/i)
  })

  it('keeps real subcategory image cards photo-ready without applying large blank placeholders', () => {
    assert.match(source, /h-\[7\.25rem\]/)
    assert.match(source, /sm:h-\[7\.75rem\]/)
    assert.match(source, /2xl:h-\[8\.25rem\]/)
    assert.match(source, /min-\[1120px\]:grid-cols-3/)
    assert.match(source, /min-\[1380px\]:grid-cols-4/)
    assert.match(source, /object-cover/)
    assert.match(source, /min-h-\[96px\]/)
    assert.match(source, /w-\[96px\]/)
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
