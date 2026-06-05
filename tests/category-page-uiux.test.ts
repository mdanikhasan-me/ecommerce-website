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

  it('renders a neutral missing-image placeholder instead of an empty dead image well', () => {
    assert.match(source, /function EmptyMediaPlaceholder/)
    assert.match(source, /image placeholder/)
    assert.doesNotMatch(source, /data:image|placeholder\.jpg|placeholder\.png/)
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
