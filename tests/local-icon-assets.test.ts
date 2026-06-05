import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'

import {
  SOCIAL_ICON_ASSETS,
  UI_ICON_ASSETS,
} from '@/shared/storefront-icons'

const REQUIRED_UI_ICONS = [
  'search',
  'cart',
  'menu',
  'user',
  'heart',
  'compare',
  'filter',
  'arrow-right',
  'chevron-down',
  'chevron-up',
  'star',
  'star-filled',
  'plus',
  'minus',
  'share',
  'eye',
  'package',
  'mail',
  'phone',
  'location',
  'grid',
  'close',
] as const

const REQUIRED_SOCIAL_ICONS = [
  'facebook',
  'instagram',
  'youtube',
] as const

function publicAssetExists(publicPath: string) {
  return existsSync(path.join(process.cwd(), 'public', publicPath.replace(/^\/+/, '')))
}

describe('local physical storefront icon assets', () => {
  it('keeps required UI and social icon files source-controlled under public assets', () => {
    for (const iconName of REQUIRED_UI_ICONS) {
      const publicPath = UI_ICON_ASSETS[iconName]
      assert.match(publicPath, /^\/assets\/icons\/ui\/.+\.svg$/)
      assert.equal(publicAssetExists(publicPath), true, `${iconName} UI icon should exist`)
    }

    for (const iconName of REQUIRED_SOCIAL_ICONS) {
      const publicPath = SOCIAL_ICON_ASSETS[iconName]
      assert.match(publicPath, /^\/assets\/icons\/social\/.+\.svg$/)
      assert.equal(publicAssetExists(publicPath), true, `${iconName} social icon should exist`)
    }
  })

  it('uses local icons in critical storefront surfaces and preserves payment logo policy', () => {
    const footer = readFileSync('src/frontend/components/layout/Footer.tsx', 'utf8')
    const header = readFileSync('src/frontend/components/layout/Header.tsx', 'utf8')
    const productCard = readFileSync('src/frontend/components/product/ProductCard.tsx', 'utf8')
    const assetSource = readFileSync('src/shared/assets.ts', 'utf8')

    assert.doesNotMatch(footer, /from 'lucide-react'/)
    assert.doesNotMatch(header, /from 'lucide-react'/)
    assert.doesNotMatch(productCard, /from 'lucide-react'/)
    assert.match(footer, /LocalIcon/)
    assert.match(header, /LocalIcon/)
    assert.match(productCard, /LocalIcon/)
    assert.match(footer, /https:\/\/www\.youtube\.com\/@Boilabin/)
    assert.doesNotMatch(footer, /PAYMENT_ASSETS\.CASH_ON_DELIVERY/)
    assert.doesNotMatch(footer, /PAYMENT_ASSETS\.STRIPE/)
    assert.doesNotMatch(assetSource, /\/assets\/payments\/stripe\.svg/)
  })
})
