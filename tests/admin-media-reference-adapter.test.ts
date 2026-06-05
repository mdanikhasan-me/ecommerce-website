import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ADMIN_MEDIA_PRISMA_REFERENCE_QUERIES,
  AdminMediaPrismaDelegate,
  AdminMediaPrismaLikeClient,
  buildAdminMediaReferenceWhere,
  createPrismaAdminMediaReferenceSource,
  planAdminMediaDeletionUsingPrismaReferences,
} from '@/backend/admin/media-reference-adapter'
import {
  ADMIN_MEDIA_REFERENCE_FIELDS,
  AdminMediaReferenceField,
} from '@/backend/admin/media-reference-guard'

type CountCall = {
  where: Record<string, unknown>
}

function delegateReturning(count: number): AdminMediaPrismaDelegate & { calls: CountCall[] } {
  const calls: CountCall[] = []
  return {
    calls,
    count(args) {
      calls.push(args)
      return count
    },
  }
}

function fullPrismaClient(count = 0): AdminMediaPrismaLikeClient {
  const client: AdminMediaPrismaLikeClient = {}
  for (const query of ADMIN_MEDIA_PRISMA_REFERENCE_QUERIES) {
    client[query.delegateName] ??= delegateReturning(count)
  }
  return client
}

function fieldByKey(key: string): AdminMediaReferenceField {
  const field = ADMIN_MEDIA_REFERENCE_FIELDS.find((item) => item.key === key)
  assert.ok(field, `Missing field fixture for ${key}`)
  return field
}

describe('admin media Prisma-compatible reference adapter', () => {
  it('represents every shared media reference field from the guard map', () => {
    assert.deepEqual(
      ADMIN_MEDIA_PRISMA_REFERENCE_QUERIES.map((query) => query.fieldKey),
      ADMIN_MEDIA_REFERENCE_FIELDS.map((field) => field.key),
    )

    assert.deepEqual(
      ADMIN_MEDIA_PRISMA_REFERENCE_QUERIES.filter((query) => query.model === 'Seller').map((query) => query.fieldKey),
      ['Seller.storeLogo', 'Seller.storeBanner'],
    )
  })

  it('builds exact equality where clauses for scalar fields', () => {
    assert.deepEqual(
      buildAdminMediaReferenceWhere({
        field: fieldByKey('ProductImage.url'),
        candidateUrl: '/uploads/products/shared.webp',
      }),
      { url: '/uploads/products/shared.webp' },
    )
  })

  it('builds Prisma array containment where clauses for list fields', () => {
    assert.deepEqual(
      buildAdminMediaReferenceWhere({
        field: fieldByKey('ReturnRequest.images'),
        candidateUrl: '/uploads/products/shared.webp',
      }),
      { images: { has: '/uploads/products/shared.webp' } },
    )
  })

  it('applies operation-specific exclusions by exact model, field, id, and value', () => {
    assert.deepEqual(
      buildAdminMediaReferenceWhere({
        field: fieldByKey('Banner.imageUrl'),
        candidateUrl: '/uploads/admin/banners/old.webp',
        exclude: [
          {
            model: 'Banner',
            id: 'current-banner',
            field: 'imageUrl',
            value: '/uploads/admin/banners/old.webp',
          },
          {
            model: 'Banner',
            id: 'same-record-retained-field',
            field: 'mobileImageUrl',
            value: '/uploads/admin/banners/old.webp',
          },
        ],
      }),
      {
        imageUrl: '/uploads/admin/banners/old.webp',
        NOT: { id: { in: ['current-banner'] } },
      },
    )
  })

  it('counts all mapped fields with mocked Prisma delegates and returns field counts only', async () => {
    const source = createPrismaAdminMediaReferenceSource(fullPrismaClient(2))
    const result = await source.countReferences({
      candidateUrl: '/uploads/products/shared.webp',
      fields: ADMIN_MEDIA_REFERENCE_FIELDS,
    })

    assert.equal(result.complete, true)
    assert.equal(result.errors, undefined)
    assert.equal(result.fields.length, ADMIN_MEDIA_REFERENCE_FIELDS.length)
    assert.deepEqual(
      result.fields.map((field) => field.fieldKey),
      ADMIN_MEDIA_REFERENCE_FIELDS.map((field) => field.key),
    )
    assert.equal(result.fields.every((field) => field.count === 2), true)
    assert.equal(JSON.stringify(result).includes('matched-record'), false)
  })

  it('marks missing delegates incomplete without returning matched records or PII', async () => {
    const client = fullPrismaClient(0)
    delete client.seller

    const source = createPrismaAdminMediaReferenceSource(client)
    const result = await source.countReferences({
      candidateUrl: '/uploads/admin/sellers/logo.webp',
      fields: ADMIN_MEDIA_REFERENCE_FIELDS,
    })

    assert.equal(result.complete, false)
    assert.equal(result.fields.find((field) => field.fieldKey === 'Seller.storeLogo')?.count, 0)
    assert.match(result.errors?.join(' ') ?? '', /Missing read-only count delegate/)
    assert.doesNotMatch(JSON.stringify(result), /@/)
    assert.doesNotMatch(JSON.stringify(result), /matched-record/)
  })

  it('marks unconfigured fields and invalid count results incomplete', async () => {
    const invalidCountClient = fullPrismaClient(0)
    invalidCountClient.productImage = {
      count() {
        return Number.NaN
      },
    }
    const invalidCount = await createPrismaAdminMediaReferenceSource(invalidCountClient).countReferences({
      candidateUrl: '/uploads/products/shared.webp',
      fields: [fieldByKey('ProductImage.url')],
    })
    const unknownField = await createPrismaAdminMediaReferenceSource(fullPrismaClient(0)).countReferences({
      candidateUrl: '/uploads/products/shared.webp',
      fields: [
        {
          key: 'UnknownModel.image',
          model: 'UnknownModel',
          field: 'image',
          valueKind: 'scalar',
          referenceKind: 'active-record',
        },
      ],
    })

    assert.equal(invalidCount.complete, false)
    assert.match(invalidCount.errors?.join(' ') ?? '', /Invalid count result/)
    assert.equal(unknownField.complete, false)
    assert.match(unknownField.errors?.join(' ') ?? '', /No reference query/)
  })

  it('marks thrown delegate errors incomplete and redacts sensitive details', async () => {
    const client = fullPrismaClient(0)
    client.productImage = {
      count() {
        throw new Error('lookup failed postgresql://user:pass@example.test/db for buyer@example.test token=abc123')
      },
    }

    const source = createPrismaAdminMediaReferenceSource(client)
    const result = await source.countReferences({
      candidateUrl: '/uploads/products/shared.webp',
      fields: [fieldByKey('ProductImage.url')],
    })

    assert.equal(result.complete, false)
    assert.equal(result.fields[0]?.count, 0)
    assert.doesNotMatch(result.errors?.join(' ') ?? '', /postgresql:\/\/user/)
    assert.doesNotMatch(result.errors?.join(' ') ?? '', /buyer@example/)
    assert.doesNotMatch(result.errors?.join(' ') ?? '', /abc123/)
  })

  it('integrates with the shared-reference planner without requiring a live database', async () => {
    const blocked = await planAdminMediaDeletionUsingPrismaReferences({
      candidateUrl: '/uploads/products/shared.webp',
      prisma: fullPrismaClient(1),
      fields: [fieldByKey('ProductImage.url')],
    })
    const deletable = await planAdminMediaDeletionUsingPrismaReferences({
      candidateUrl: '/uploads/products/unused.webp',
      prisma: fullPrismaClient(0),
      fields: [fieldByKey('ProductImage.url')],
    })

    assert.equal(blocked.shouldDeleteLocalFile, false)
    assert.equal(blocked.referenceCount, 1)
    assert.equal(deletable.shouldDeleteLocalFile, true)
    assert.equal(deletable.referenceCount, 0)
  })
})
