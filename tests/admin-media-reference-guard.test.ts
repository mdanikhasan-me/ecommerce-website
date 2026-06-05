import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ADMIN_MEDIA_REFERENCE_FIELDS,
  AdminMediaReferenceExclusion,
  AdminMediaReferenceSource,
  planAdminMediaDeletionWithReferences,
} from '@/backend/admin/media-reference-guard'

type ReferenceRecord = {
  model: string
  id: string
  values: Record<string, string | string[] | null | undefined>
}

function createMockReferenceSource(records: ReferenceRecord[]): AdminMediaReferenceSource {
  return {
    async countReferences(input) {
      return {
        complete: true,
        fields: input.fields.map((field) => {
          let count = 0
          for (const record of records) {
            if (record.model !== field.model) continue

            const value = record.values[field.field]
            if (Array.isArray(value)) {
              if (value.some((entry) => entry.trim() === input.candidateUrl)) {
                const isExcluded = (input.exclude ?? []).some(
                  (item) =>
                    item.model === record.model &&
                    item.id === record.id &&
                    item.field === field.field &&
                    item.value === input.candidateUrl,
                )
                if (!isExcluded) count += 1
              }
              continue
            }

            if (value?.trim() === input.candidateUrl) {
              const isExcluded = (input.exclude ?? []).some(
                (item) =>
                  item.model === record.model &&
                  item.id === record.id &&
                  item.field === field.field &&
                  item.value === input.candidateUrl,
              )
              if (!isExcluded) count += 1
            }
          }

          return {
            fieldKey: field.key,
            count,
          }
        }),
      }
    },
  }
}

function createFailingSource(error: Error): AdminMediaReferenceSource {
  return {
    async countReferences() {
      throw error
    },
  }
}

const allFieldKeys = ADMIN_MEDIA_REFERENCE_FIELDS.map((field) => field.key)

describe('admin media DB-aware shared-reference guard', () => {
  it('maps every known Prisma media reference field', () => {
    assert.deepEqual(allFieldKeys, [
      'ProductImage.url',
      'ProductVariant.image',
      'Category.image',
      'Brand.logo',
      'Brand.banner',
      'Seller.storeLogo',
      'Seller.storeBanner',
      'Banner.imageUrl',
      'Banner.mobileImageUrl',
      'OrderItem.imageUrl',
      'ReturnRequest.images',
      'Review.images',
      'User.image',
    ])

    assert.equal(
      ADMIN_MEDIA_REFERENCE_FIELDS.filter((field) => field.referenceKind === 'historical-evidence').length,
      4,
    )
  })

  it('plans classifier-approved unreferenced admin and product uploads as deletable in mock context', async () => {
    const source = createMockReferenceSource([])
    const admin = await planAdminMediaDeletionWithReferences({
      candidateUrl: '/uploads/admin/banners/banner.webp',
      referenceSource: source,
    })
    const product = await planAdminMediaDeletionWithReferences({
      candidateUrl: '/uploads/products/product.webp',
      referenceSource: source,
    })

    assert.equal(admin.shouldDeleteLocalFile, true)
    assert.equal(admin.referenceCount, 0)
    assert.equal(product.shouldDeleteLocalFile, true)
    assert.equal(product.referenceCount, 0)
    assert.deepEqual(admin.checkedFields, allFieldKeys)
  })

  it('blocks media referenced by another active banner, category, product, variant, or brand field', async () => {
    for (const record of [
      { model: 'Banner', id: 'banner-2', values: { imageUrl: '/uploads/admin/banners/shared.webp' } },
      { model: 'Category', id: 'category-2', values: { image: '/uploads/admin/categories/shared.webp' } },
      { model: 'ProductImage', id: 'product-image-2', values: { url: '/uploads/products/shared.webp' } },
      { model: 'ProductVariant', id: 'variant-2', values: { image: '/uploads/products/shared.webp' } },
      { model: 'Brand', id: 'brand-2', values: { logo: '/uploads/admin/brands/shared.webp' } },
      { model: 'Brand', id: 'brand-3', values: { banner: '/uploads/admin/brands/shared.webp' } },
      { model: 'Seller', id: 'seller-2', values: { storeLogo: '/uploads/admin/sellers/shared.webp' } },
      { model: 'Seller', id: 'seller-3', values: { storeBanner: '/uploads/admin/sellers/shared.webp' } },
    ] satisfies ReferenceRecord[]) {
      const candidate = Object.values(record.values)[0] as string
      const plan = await planAdminMediaDeletionWithReferences({
        candidateUrl: candidate,
        referenceSource: createMockReferenceSource([record]),
      })

      assert.equal(plan.shouldDeleteLocalFile, false)
      assert.equal(plan.referenceCount, 1)
      assert.equal(plan.protectedReferenceCount, 0)
      assert.match(plan.reason, /still referenced/)
    }
  })

  it('preserves historical evidence references from orders, returns, reviews, and users', async () => {
    const candidate = '/uploads/products/evidence.webp'
    const source = createMockReferenceSource([
      { model: 'OrderItem', id: 'order-item-1', values: { imageUrl: candidate } },
      { model: 'ReturnRequest', id: 'return-1', values: { images: [candidate, '/uploads/products/other.webp'] } },
      { model: 'Review', id: 'review-1', values: { images: ['/uploads/products/other.webp', candidate] } },
      { model: 'User', id: 'user-1', values: { image: candidate } },
    ])

    const plan = await planAdminMediaDeletionWithReferences({
      candidateUrl: candidate,
      referenceSource: source,
    })

    assert.equal(plan.shouldDeleteLocalFile, false)
    assert.equal(plan.referenceCount, 4)
    assert.equal(plan.protectedReferenceCount, 4)
    assert.match(plan.reason, /historical evidence/)
  })

  it('refuses remote, source, unknown, and unsafe paths before reference lookup', async () => {
    let calls = 0
    const source: AdminMediaReferenceSource = {
      async countReferences() {
        calls += 1
        return { complete: true, fields: [] }
      },
    }

    for (const candidate of [
      'https://cdn.example.test/product.webp',
      '/assets/banners/home.webp',
      '/images/legacy.webp',
      '/uploads/admin/',
      '/uploads/admin/banners/banner.webp?download=1',
      '/uploads/products/../../package.json',
      '/unknown/path.webp',
    ]) {
      const plan = await planAdminMediaDeletionWithReferences({
        candidateUrl: candidate,
        referenceSource: source,
      })

      assert.equal(plan.shouldDeleteLocalFile, false)
      assert.equal(plan.referenceCount, 0)
      assert.equal(plan.checkedFields.length, 0)
    }

    assert.equal(calls, 0)
  })

  it('fails safe when the reference source throws or returns incomplete results', async () => {
    const throwing = await planAdminMediaDeletionWithReferences({
      candidateUrl: '/uploads/products/product.webp',
      referenceSource: createFailingSource(new Error('lookup failed for postgresql://user:pass@example.test/db')),
    })
    const incomplete = await planAdminMediaDeletionWithReferences({
      candidateUrl: '/uploads/products/product.webp',
      referenceSource: {
        async countReferences() {
          return {
            complete: false,
            fields: [{ fieldKey: 'ProductImage.url', count: 0 }],
            errors: ['partial query failure for postgresql://user:pass@example.test/db'],
          }
        },
      },
    })

    assert.equal(throwing.shouldDeleteLocalFile, false)
    assert.equal(throwing.incomplete, true)
    assert.doesNotMatch(throwing.errors.join(' '), /postgresql:\/\/user/)
    assert.match(throwing.reason, /failed/)
    assert.equal(incomplete.shouldDeleteLocalFile, false)
    assert.equal(incomplete.incomplete, true)
    assert.doesNotMatch(incomplete.errors.join(' '), /postgresql:\/\/user/)
    assert.match(incomplete.reason, /incomplete/)
  })

  it('supports excluding the current record without ignoring other records', async () => {
    const candidate = '/uploads/admin/banners/shared.webp'
    const exclude: AdminMediaReferenceExclusion[] = [
      {
        model: 'Banner',
        id: 'current-banner',
        field: 'imageUrl',
        value: candidate,
      },
    ]
    const currentOnly = createMockReferenceSource([
      { model: 'Banner', id: 'current-banner', values: { imageUrl: candidate } },
    ])
    const currentAndOther = createMockReferenceSource([
      { model: 'Banner', id: 'current-banner', values: { imageUrl: candidate } },
      { model: 'Banner', id: 'other-banner', values: { mobileImageUrl: candidate } },
    ])

    const currentOnlyPlan = await planAdminMediaDeletionWithReferences({
      candidateUrl: candidate,
      referenceSource: currentOnly,
      exclude,
    })
    const otherPlan = await planAdminMediaDeletionWithReferences({
      candidateUrl: candidate,
      referenceSource: currentAndOther,
      exclude,
    })

    assert.equal(currentOnlyPlan.shouldDeleteLocalFile, true)
    assert.equal(currentOnlyPlan.referenceCount, 0)
    assert.equal(otherPlan.shouldDeleteLocalFile, false)
    assert.equal(otherPlan.referenceCount, 1)
  })

  it('uses field-aware exclusions so retained fields on the same record still block deletion', async () => {
    const candidate = '/uploads/admin/banners/shared.webp'
    const source = createMockReferenceSource([
      {
        model: 'Banner',
        id: 'current-banner',
        values: {
          imageUrl: candidate,
          mobileImageUrl: candidate,
        },
      },
    ])

    const plan = await planAdminMediaDeletionWithReferences({
      candidateUrl: candidate,
      referenceSource: source,
      exclude: [
        {
          model: 'Banner',
          id: 'current-banner',
          field: 'imageUrl',
          value: candidate,
        },
      ],
    })

    assert.equal(plan.shouldDeleteLocalFile, false)
    assert.equal(plan.referenceCount, 1)
  })
})
