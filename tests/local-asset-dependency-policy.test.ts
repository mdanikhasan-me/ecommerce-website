import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'

import {
  BRAND_ASSETS,
  PAYMENT_ASSETS,
} from '@/shared/assets'
import { getImagePlaceholder } from '@/backend/utils/string'
import {
  CATEGORY_PHOTO_ASSETS,
} from '@/shared/category-media'
import {
  classifyAssetReference,
  collectLocalAssetDependencyAudit,
  createLocalAssetDependencyEvidence,
  formatLocalAssetDependencyAudit,
} from '../scripts/audit-local-asset-dependencies.mjs'

describe('local asset dependency policy', () => {
  it('classifies source assets, managed uploads, bundled icons, and remote media separately', () => {
    assert.equal(classifyAssetReference('/assets/payments/bkash.svg'), 'local-source-asset')
    assert.equal(classifyAssetReference('/images/placeholder.jpg'), 'local-source-asset')
    assert.equal(classifyAssetReference('/uploads/admin/banners/banner.webp'), 'local-managed-upload')
    assert.equal(classifyAssetReference('/uploads/products/product.webp'), 'local-managed-upload')
    assert.equal(classifyAssetReference('data:image/webp;base64,AAAA'), 'data-url')
    assert.equal(
      classifyAssetReference('https://images.example.test/product.jpg', 'prisma/seed.ts'),
      'remote-product-catalog-media',
    )
    assert.equal(
      classifyAssetReference('https://images.example.test/icon.svg', 'src/frontend/components/layout/Header.tsx'),
      'remote-static-ui-asset',
    )
    assert.equal(
      classifyAssetReference('https://images.unsplash.com', 'src/backend/security/csp.ts'),
      'remote-allowed-provider-cdn',
    )
    assert.equal(classifyAssetReference('https://www.youtube.com/@Boilabin', 'src/frontend/components/layout/Footer.tsx'), 'remote-non-media-link')
  })

  it('keeps static UI assets local or bundled and separates remote catalog media backlog', async () => {
    const audit = await collectLocalAssetDependencyAudit()
    const evidence = createLocalAssetDependencyEvidence(audit)
    const formatted = JSON.stringify(evidence)

    assert.equal(audit.safeAggregateOnly, true)
    assert.equal(audit.privateEnvRead, false)
    assert.equal(audit.deletionPerformed, false)
    assert.equal(audit.realMediaFilesDeleted, false)
    assert.equal(audit.summary.remoteStaticUiAsset, 0)
    assert.equal(audit.remoteStaticUiAssetRisk, false)
    assert.equal(audit.summary.localSourceAsset > 0, true)
    assert.equal(audit.summary.bundledIconImportFiles > 0, true)
    assert.equal(audit.summary.bundledIconImportCount > 0, true)
    assert.equal(audit.summary.remoteAllowedProviderCdn > 0, true)
    assert.equal(audit.summary.remoteProductCatalogMedia > 0, true)
    assert.equal(audit.publicInventory.assets.exists, true)
    assert.equal(audit.publicInventory.uploads.exists, true)
    assert.equal(evidence.filesWithRemoteStaticUiAssetCount, 0)
    assert.equal(evidence.summary.remoteProductCatalogMedia >= 0, true)
    assert.doesNotMatch(formatted, /private-|token=|postgresql:\/\//i)
  })

  it('does not include matched private media values in formatted audit output', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'boilabin-local-asset-audit-'))

    try {
      await fs.mkdir(path.join(root, 'src'), { recursive: true })
      await fs.mkdir(path.join(root, 'public', 'uploads', 'products'), { recursive: true })
      await fs.writeFile(
        path.join(root, 'src', 'fixture.tsx'),
        `
          import { Search } from 'lucide-react'
          export const source = '/assets/private-source-name.svg'
          export const upload = '/uploads/products/private-upload-name.webp'
          export const remote = 'https://static.example.test/private-ui-icon.svg'
        `,
      )
      await fs.writeFile(path.join(root, 'public', 'uploads', 'products', 'private-upload-name.webp'), 'fixture')

      const audit = await collectLocalAssetDependencyAudit({ cwd: root })
      const evidence = createLocalAssetDependencyEvidence(audit)
      const formattedFull = formatLocalAssetDependencyAudit(audit)
      const formattedEvidence = JSON.stringify(evidence)

      assert.equal(audit.summary.remoteStaticUiAsset, 1)
      assert.equal(evidence.filesWithManagedUploadReferenceCount, 1)
      assert.doesNotMatch(formattedFull, /private-upload-name/)
      assert.doesNotMatch(formattedFull, /private-ui-icon/)
      assert.doesNotMatch(formattedEvidence, /private-upload-name/)
      assert.doesNotMatch(formattedEvidence, /private-ui-icon/)
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })

  it('keeps footer social/payment/logo dependencies local or bundled', async () => {
    const [footerSource, headerSource, assetSource] = await Promise.all([
      fs.readFile('src/frontend/components/layout/Footer.tsx', 'utf8'),
      fs.readFile('src/frontend/components/layout/Header.tsx', 'utf8'),
      fs.readFile('src/shared/assets.ts', 'utf8'),
    ])

    assert.match(footerSource, /https:\/\/www\.youtube\.com\/@Boilabin/)
    assert.match(footerSource, /from 'lucide-react'/)
    assert.match(headerSource, /from 'lucide-react'/)
    assert.match(headerSource, /BoilabinLogo/)
    assert.doesNotMatch(footerSource, /PAYMENT_ASSETS\.CASH_ON_DELIVERY/)
    assert.doesNotMatch(footerSource, /PAYMENT_ASSETS\.STRIPE/)

    for (const asset of [PAYMENT_ASSETS.BKASH, PAYMENT_ASSETS.NAGAD, PAYMENT_ASSETS.VISA, PAYMENT_ASSETS.MASTERCARD]) {
      assert.match(asset.src, /^\/assets\/payments\//)
      assert.match(assetSource, new RegExp(asset.src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    }

    assert.match(BRAND_ASSETS.mark, /^\/assets\/branding\//)
    assert.match(BRAND_ASSETS.wordmark, /^\/assets\/branding\//)
  })

  it('generates app-owned placeholder images without remote hosts', () => {
    const placeholder = getImagePlaceholder(320, 240, 'Missing image')

    assert.match(placeholder, /^data:image\/svg\+xml;charset=utf-8,/)
    assert.doesNotMatch(placeholder, /^https?:\/\//)
    assert.doesNotMatch(decodeURIComponent(placeholder), /placehold\.co|unsplash|pexels/i)
  })

  it('keeps category source media under source assets, not managed upload roots', () => {
    for (const [slug, asset] of Object.entries(CATEGORY_PHOTO_ASSETS)) {
      assert.match(asset.path, /^\/assets\/categories\//, `${slug} must use a source asset path`)
      assert.doesNotMatch(asset.path, /^\/uploads\//, `${slug} must not use managed uploads as source media`)
    }
  })
})
