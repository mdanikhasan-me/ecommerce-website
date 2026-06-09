import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import { buildCatalogProductAssetPath } from '@/backend/admin/media-paths'
import { classifyAdminMediaPath } from '@/backend/admin/media-lifecycle'
import { deleteManagedUpload } from '@/backend/admin/product-editor'
import {
  CATALOG_PRODUCT_MEDIA,
  CATALOG_PRODUCT_MEDIA_ROOT,
} from '@/shared/product-media'
import {
  collectLocalAssetDependencyAudit,
  createLocalAssetDependencyEvidence,
} from '../scripts/audit-local-asset-dependencies.mjs'

function productSeedText() {
  return readFileSync(join(process.cwd(), 'prisma/seed.ts'), 'utf8')
}

function publicAssetExists(pathname: string) {
  return existsSync(join(process.cwd(), 'public', pathname.replace(/^\//, '')))
}

describe('catalog product media localization', () => {
  it('keeps the committed product media manifest empty for a real-product-only catalog', () => {
    assert.equal(CATALOG_PRODUCT_MEDIA_ROOT, '/assets/products/catalog')
    assert.equal(CATALOG_PRODUCT_MEDIA.length, 0)
  })

  it('does not keep a seeded productsData block in prisma seed output', () => {
    const seed = productSeedText()

    assert.equal(seed.includes('const productsData:'), false)
    assert.equal(seed.includes('Creating '), false)
    assert.equal(seed.includes('/assets/products/catalog/'), false)
  })

  it('keeps product source assets protected from managed upload cleanup', async () => {
    const sourcePath = '/assets/products/catalog/electronics/mobile-phones/example-product/main.jpg'
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
    assert.equal(publicAssetExists(sourcePath), false)
  })

  it('still audits the aggregate source tree without any demo product rows', async () => {
    const audit = await collectLocalAssetDependencyAudit()
    const evidence = createLocalAssetDependencyEvidence(audit)
    const formatted = JSON.stringify(evidence)

    assert.equal(evidence.productSourceAssetFolder.exists, false)
    assert.equal(evidence.productSourceAssetFolder.productFolderCount, 0)
    assert.equal(evidence.productSeedMedia.productSeedProductCount, 0)
    assert.equal(evidence.productSeedMedia.productSeedLocalProductSourceAssetCount, 0)
    assert.equal(evidence.productSeedMedia.productSeedLocalManagedUploadCount, 0)
    assert.equal(evidence.productSeedMedia.productSeedRemoteCatalogMediaCount, 0)
    assert.equal(evidence.productSeedMedia.productSeedMissingLocalSourceAssetCount, 0)
    assert.equal(evidence.summary.remoteStaticUiAsset, 0)
    assert.equal(evidence.remoteStaticUiAssetRisk, false)
    assert.doesNotMatch(formatted, /token=|postgresql:\/\/|private-upload-name/i)
  })

  it('still builds organized local product asset paths for future uploads', () => {
    assert.equal(
      buildCatalogProductAssetPath({
        categorySlug: 'Electronics',
        subcategorySlug: 'Mobile Phones',
        productSlug: 'Example Product',
        extension: 'JPG',
      }),
      '/assets/products/catalog/electronics/mobile-phones/example-product/main.jpg',
    )
  })
})
