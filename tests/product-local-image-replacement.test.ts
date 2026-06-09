import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { deleteManagedUpload } from '@/backend/admin/product-editor'
import {
  buildProductImageLocalizationPlan,
  resolveLocalCatalogImageForSlug,
} from '@/backend/catalog/product-local-image-replacement'
import { CATALOG_PRODUCT_MEDIA } from '@/shared/product-media'

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

function syntheticInventory(slug: string, publicUrl: string) {
  return [
    {
      productSlug: slug,
      publicUrl,
      fileName: publicUrl.split('/').pop() ?? 'main.jpg',
      extension: publicUrl.slice(publicUrl.lastIndexOf('.')),
      fileExists: true,
      sourceControlled: true,
      gitTracked: true,
      mapsCleanlyToProductSlug: true,
    },
  ]
}

describe('product local catalog image replacement', () => {
  it('resolves a matching local catalog asset when a manifest entry is supplied', () => {
    const slug = 'example-product'
    const localUrl = '/assets/products/catalog/electronics/general/example-product/main.webp'

    const resolution = resolveLocalCatalogImageForSlug(
      slug,
      syntheticInventory(slug, localUrl),
      [
        {
          slug,
          categorySlug: 'electronics',
          subcategorySlug: 'general',
          path: localUrl,
          sourceType: 'existing-local-source-copied',
          sourceControlled: true,
          ownerReviewNeeded: false,
          note: 'synthetic test asset',
        },
      ],
    )

    assert.equal(resolution.status, 'found')
    if (resolution.status !== 'found') return
    assert.equal(resolution.image.publicUrl, localUrl)
  })

  it('refuses ambiguous or missing local catalog image matches', () => {
    const inventory = [
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
      resolveLocalCatalogImageForSlug('ambiguous-product', inventory, []).status,
      'ambiguous',
    )
    assert.equal(resolveLocalCatalogImageForSlug('missing-product', [], []).status, 'missing')
  })

  it('maps remote product images to local synthetic assets when a matching local catalog asset exists', () => {
    const slug = 'synthetic-product'
    const remoteUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format'
    const localUrl = '/assets/products/catalog/electronics/general/synthetic-product/main.avif'
    const plan = buildProductImageLocalizationPlan({
      generatedAt: '2026-06-06T00:00:00.000Z',
      products: [
        productFixture(slug, [
          imageFixture(remoteUrl, {
            id: 'synthetic-image',
            alt: 'Synthetic product image',
            isPrimary: true,
            sortOrder: 2,
          }),
        ]),
      ],
      localCatalogImages: syntheticInventory(slug, localUrl),
      manifestEntries: [
        {
          slug,
          categorySlug: 'electronics',
          subcategorySlug: 'general',
          path: localUrl,
          sourceType: 'existing-local-source-copied',
          sourceControlled: true,
          ownerReviewNeeded: false,
          note: 'synthetic test asset',
        },
      ],
    })

    assert.equal(plan.replacementCount, 1)
    assert.equal(plan.replacements[0].slug, slug)
    assert.equal(plan.replacements[0].currentUrl, remoteUrl)
    assert.equal(plan.replacements[0].proposedReplacementUrl, localUrl)
    assert.equal(plan.replacements[0].alt, 'Synthetic product image')
    assert.equal(plan.replacements[0].isPrimary, true)
    assert.equal(plan.replacements[0].sortOrder, 2)
  })

  it('does not change already-local image rows', () => {
    const slug = 'already-local-product'
    const localUrl = '/assets/products/catalog/electronics/general/already-local-product/main.avif'

    const plan = buildProductImageLocalizationPlan({
      products: [productFixture(slug, [imageFixture(localUrl)])],
      localCatalogImages: syntheticInventory(slug, localUrl),
      manifestEntries: [],
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
      localCatalogImages: [],
      manifestEntries: [],
    })

    assert.equal(plan.replacementCount, 0)
    assert.equal(plan.rows[0].action, 'keep because no local match')
  })

  it('keeps the product media manifest empty for future real uploads', () => {
    assert.equal(CATALOG_PRODUCT_MEDIA.length, 0)
  })

  it('keeps source catalog product paths protected from managed deletion', async () => {
    const sourcePath = '/assets/products/catalog/electronics/audio/example-product/main.avif'
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
  })
})
