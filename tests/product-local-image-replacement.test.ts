import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'

import { deleteManagedUpload } from '@/backend/admin/product-editor'
import {
  buildProductImageLocalizationPlan,
  type LocalCatalogProductImage,
  resolveLocalCatalogImageForSlug,
} from '@/backend/catalog/product-local-image-replacement'
import {
  CATALOG_PRODUCT_MEDIA,
  CATALOG_PRODUCT_MEDIA_BY_SLUG,
} from '@/shared/product-media'

function publicAssetExists(publicUrl: string) {
  return existsSync(path.join(process.cwd(), 'public', publicUrl.replace(/^\/+/, '')))
}

function inventoryFromCatalogManifest(): LocalCatalogProductImage[] {
  return CATALOG_PRODUCT_MEDIA.map((entry) => ({
    productSlug: entry.slug,
    publicUrl: entry.path,
    fileName: path.basename(entry.path),
    extension: path.extname(entry.path),
    fileExists: publicAssetExists(entry.path),
    sourceControlled: entry.sourceControlled,
    gitTracked: true,
    mapsCleanlyToProductSlug: true,
  }))
}

function imageFixture(url: string, overrides: Partial<{
  id: string
  alt: string | null
  isPrimary: boolean
  sortOrder: number
}> = {}) {
  return {
    id: overrides.id ?? 'image-1',
    url,
    alt: overrides.alt ?? null,
    isPrimary: overrides.isPrimary ?? true,
    sortOrder: overrides.sortOrder ?? 0,
  }
}

function productFixture(slug: string, images: ReturnType<typeof imageFixture>[]) {
  return {
    productName: slug,
    sku: slug.toUpperCase(),
    slug,
    images,
  }
}

describe('product local catalog image replacement', () => {
  it('resolves the Bose local catalog image from the committed product catalog', () => {
    const inventory = inventoryFromCatalogManifest()
    const resolution = resolveLocalCatalogImageForSlug('bose-quietcomfort-45-headphones', inventory)

    assert.equal(resolution.status, 'found')
    if (resolution.status !== 'found') return

    assert.equal(
      resolution.image.publicUrl,
      '/assets/products/catalog/electronics/audio/bose-quietcomfort-45-headphones/main.avif',
    )
    assert.equal(resolution.image.fileExists, true)
    assert.equal(publicAssetExists(resolution.image.publicUrl), true)
  })

  it('refuses ambiguous or missing local catalog image matches', () => {
    const ambiguousInventory: LocalCatalogProductImage[] = [
      {
        productSlug: 'ambiguous-product',
        publicUrl: '/assets/products/catalog/electronics/general/ambiguous-product/main.jpg',
        fileName: 'main.jpg',
        extension: '.jpg',
        fileExists: true,
        sourceControlled: true,
        gitTracked: true,
        mapsCleanlyToProductSlug: true,
      },
      {
        productSlug: 'ambiguous-product',
        publicUrl: '/assets/products/catalog/electronics/general/ambiguous-product/main.webp',
        fileName: 'main.webp',
        extension: '.webp',
        fileExists: true,
        sourceControlled: true,
        gitTracked: true,
        mapsCleanlyToProductSlug: true,
      },
    ]

    assert.equal(
      resolveLocalCatalogImageForSlug('ambiguous-product', ambiguousInventory, []).status,
      'ambiguous',
    )
    assert.equal(resolveLocalCatalogImageForSlug('missing-product', [], []).status, 'missing')
  })

  it('maps the Bose remote ProductImage row to its local catalog path', () => {
    const remoteUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format'
    const plan = buildProductImageLocalizationPlan({
      generatedAt: '2026-06-06T00:00:00.000Z',
      products: [
        productFixture('bose-quietcomfort-45-headphones', [
          imageFixture(remoteUrl, {
            id: 'bose-image',
            alt: 'QuietComfort headphones',
            isPrimary: true,
            sortOrder: 2,
          }),
        ]),
      ],
      localCatalogImages: inventoryFromCatalogManifest(),
    })

    assert.equal(plan.replacementCount, 1)
    assert.equal(plan.replacements[0].slug, 'bose-quietcomfort-45-headphones')
    assert.equal(plan.replacements[0].currentUrl, remoteUrl)
    assert.equal(
      plan.replacements[0].proposedReplacementUrl,
      '/assets/products/catalog/electronics/audio/bose-quietcomfort-45-headphones/main.avif',
    )
    assert.equal(plan.replacements[0].alt, 'QuietComfort headphones')
    assert.equal(plan.replacements[0].isPrimary, true)
    assert.equal(plan.replacements[0].sortOrder, 2)
  })

  it('does not change already-local image rows', () => {
    const localUrl = CATALOG_PRODUCT_MEDIA_BY_SLUG['sony-wh-1000xm5'].path
    const plan = buildProductImageLocalizationPlan({
      products: [productFixture('sony-wh-1000xm5', [imageFixture(localUrl)])],
      localCatalogImages: inventoryFromCatalogManifest(),
    })

    assert.equal(plan.replacementCount, 0)
    assert.equal(plan.rows[0].action, 'keep because already local')
    assert.equal(plan.rows[0].proposedReplacementUrl, null)
  })

  it('does not change remote rows when no matching local catalog asset exists', () => {
    const plan = buildProductImageLocalizationPlan({
      products: [
        productFixture('remote-without-local-asset', [
          imageFixture('https://images.unsplash.com/photo-safe?w=800&auto=format'),
        ]),
      ],
      localCatalogImages: inventoryFromCatalogManifest(),
    })

    assert.equal(plan.replacementCount, 0)
    assert.equal(plan.rows[0].action, 'keep because no local match')
  })

  it('keeps active seed/catalog product source from preferring Unsplash when local media exists', () => {
    const seed = readFileSync(path.join(process.cwd(), 'prisma/seed.ts'), 'utf8')
    const productsBlock = seed.match(/const productsData:[\s\S]*?= \[([\s\S]*?)\n  \]/)?.[1]

    assert.ok(productsBlock)
    assert.doesNotMatch(productsBlock, /images\.unsplash\.com/)

    for (const entry of CATALOG_PRODUCT_MEDIA) {
      assert.match(productsBlock, new RegExp(`slug:\\s*'${entry.slug}'[\\s\\S]*?imageUrl:\\s*'${entry.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`))
      assert.equal(publicAssetExists(entry.path), true, `${entry.path} should exist`)
    }
  })

  it('keeps Step 305 product cleanup from deleting source catalog product images', async () => {
    const sourcePath = '/assets/products/catalog/electronics/audio/bose-quietcomfort-45-headphones/main.avif'
    let referenceChecks = 0

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
})
