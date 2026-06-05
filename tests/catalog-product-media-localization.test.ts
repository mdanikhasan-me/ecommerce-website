import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import { buildCatalogProductAssetPath } from '@/backend/admin/media-paths'
import { classifyAdminMediaPath } from '@/backend/admin/media-lifecycle'
import { deleteManagedUpload } from '@/backend/admin/product-editor'
import {
  CATALOG_PRODUCT_MEDIA,
  CATALOG_PRODUCT_MEDIA_BY_SLUG,
  CATALOG_PRODUCT_MEDIA_ROOT,
  OWNER_REVIEW_NEEDED_PRODUCT_MEDIA,
} from '@/shared/product-media'
import {
  collectLocalAssetDependencyAudit,
  createLocalAssetDependencyEvidence,
} from '../scripts/audit-local-asset-dependencies.mjs'

type ProductSeedEntry = {
  slug: string
  imageUrl: string
}

function productSeedEntries() {
  const seed = readFileSync(join(process.cwd(), 'prisma/seed.ts'), 'utf8')
  const productsBlock = seed.match(/const productsData:[\s\S]*?= \[([\s\S]*?)\n  \]/)?.[1]
  assert.ok(productsBlock, 'productsData block should be present')

  const entries: ProductSeedEntry[] = []
  for (const match of productsBlock.matchAll(/\{[\s\S]*?sku:[\s\S]*?\n    \}/g)) {
    const block = match[0]
    const slug = block.match(/slug:\s*'([^']+)'/)?.[1]
    const imageUrl = block.match(/imageUrl:\s*'([^']+)'/)?.[1]
    if (slug && imageUrl) entries.push({ slug, imageUrl })
  }

  return entries
}

function publicAssetExists(pathname: string) {
  return existsSync(join(process.cwd(), 'public', pathname.replace(/^\//, '')))
}

describe('catalog product media localization', () => {
  it('keeps the source-controlled product media manifest under public assets', () => {
    assert.equal(CATALOG_PRODUCT_MEDIA_ROOT, '/assets/products/catalog')
    assert.equal(CATALOG_PRODUCT_MEDIA.length, 21)
    assert.equal(OWNER_REVIEW_NEEDED_PRODUCT_MEDIA.length, 14)

    for (const entry of CATALOG_PRODUCT_MEDIA) {
      assert.equal(entry.sourceControlled, true)
      assert.match(
        entry.path,
        /^\/assets\/products\/catalog\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+\/main\.(?:avif|jpe?g|webp)$/,
      )
      assert.equal(
        entry.path,
        buildCatalogProductAssetPath({
          categorySlug: entry.categorySlug,
          subcategorySlug: entry.subcategorySlug,
          productSlug: entry.slug,
          extension: entry.path.split('.').pop() ?? 'webp',
        }),
      )
      assert.equal(publicAssetExists(entry.path), true, `${entry.slug} catalog asset should exist`)
      assert.doesNotMatch(entry.path, /^\/uploads\//)
    }
  })

  it('points every seeded product image at a committed catalog product asset', () => {
    const entries = productSeedEntries()

    assert.equal(entries.length, CATALOG_PRODUCT_MEDIA.length)

    for (const entry of entries) {
      const manifestEntry = CATALOG_PRODUCT_MEDIA_BY_SLUG[entry.slug as keyof typeof CATALOG_PRODUCT_MEDIA_BY_SLUG]

      assert.ok(manifestEntry, `${entry.slug} should have catalog media manifest metadata`)
      assert.equal(entry.imageUrl, manifestEntry.path)
      assert.match(entry.imageUrl, /^\/assets\/products\/catalog\//)
      assert.equal(publicAssetExists(entry.imageUrl), true, `${entry.slug} seed image should resolve locally`)
      assert.doesNotMatch(entry.imageUrl, /^https?:\/\//)
      assert.doesNotMatch(entry.imageUrl, /^\/uploads\/products\//)
    }
  })

  it('keeps product source assets protected from managed upload cleanup', async () => {
    const sourcePath = '/assets/products/catalog/electronics/mobile-phones/iphone-15-pro-128gb/main.jpg'
    const classification = classifyAdminMediaPath(sourcePath)
    let referenceChecks = 0

    assert.equal(classification.bucket, 'protected-source-code-asset')
    assert.equal(classification.canDeleteLocalFile, false)
    assert.equal(classification.managedPrefix, null)

    const deleted = await deleteManagedUpload(sourcePath, {
      referenceSource: {
        async countReferences() {
          referenceChecks += 1
          return { complete: true, fields: [] }
        },
      },
    })

    assert.equal(deleted, false)
    assert.equal(referenceChecks, 0)
    assert.equal(publicAssetExists(sourcePath), true)
  })

  it('reports product catalog source assets with aggregate-safe audit evidence', async () => {
    const audit = await collectLocalAssetDependencyAudit()
    const evidence = createLocalAssetDependencyEvidence(audit)
    const formatted = JSON.stringify(evidence)
    const catalogImageCount = (
      (evidence.productSourceAssetFolder.extensionCounts['.avif'] ?? 0) +
      (evidence.productSourceAssetFolder.extensionCounts['.jpg'] ?? 0) +
      (evidence.productSourceAssetFolder.extensionCounts['.jpeg'] ?? 0) +
      (evidence.productSourceAssetFolder.extensionCounts['.png'] ?? 0) +
      (evidence.productSourceAssetFolder.extensionCounts['.webp'] ?? 0)
    )

    assert.equal(evidence.productSourceAssetFolder.exists, true)
    assert.equal(catalogImageCount, CATALOG_PRODUCT_MEDIA.length)
    assert.equal(evidence.productSourceAssetFolder.productFolderCount, CATALOG_PRODUCT_MEDIA.length)
    assert.equal(evidence.productSeedMedia.productSeedProductCount, CATALOG_PRODUCT_MEDIA.length)
    assert.equal(evidence.productSeedMedia.productSeedLocalProductSourceAssetCount, CATALOG_PRODUCT_MEDIA.length)
    assert.equal(evidence.productSeedMedia.productSeedLocalManagedUploadCount, 0)
    assert.equal(evidence.productSeedMedia.productSeedRemoteCatalogMediaCount, 0)
    assert.equal(evidence.productSeedMedia.productSeedMissingLocalSourceAssetCount, 0)
    assert.equal(evidence.summary.remoteStaticUiAsset, 0)
    assert.equal(evidence.remoteStaticUiAssetRisk, false)
    assert.doesNotMatch(formatted, /token=|postgresql:\/\/|private-upload-name/i)
  })
})
