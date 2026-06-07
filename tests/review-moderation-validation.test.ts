import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ReviewStatus } from '@prisma/client'

import { parseAdminReviewModerationPayload } from '@/backend/admin/review-moderation'

describe('admin review moderation validation', () => {
  it('accepts only final moderation statuses and preserves enum values', () => {
    const acceptedStatuses = [ReviewStatus.APPROVED, ReviewStatus.REJECTED]

    for (const status of acceptedStatuses) {
      const parsed = parseAdminReviewModerationPayload({ status })

      assert.equal(parsed.success, true)
      if (parsed.success) {
        assert.equal(parsed.data.status, status)
      }
    }
  })

  it('rejects unsupported review statuses', () => {
    const unsupportedStatuses = [
      ReviewStatus.PENDING,
      'approved',
      'rejected',
      ' APPROVED ',
      '',
      'SPAM',
    ]

    for (const status of unsupportedStatuses) {
      const parsed = parseAdminReviewModerationPayload({ status })

      assert.equal(parsed.success, false)
      if (!parsed.success) {
        assert.equal(parsed.error, 'Invalid review status')
      }
    }
  })

  it('does not coerce malformed moderation payloads', () => {
    const malformedPayloads: unknown[] = [
      {},
      null,
      [],
      'APPROVED',
      { status: ['APPROVED'] },
      { status: 1 },
      { status: true },
      { status: { value: 'APPROVED' } },
    ]

    for (const payload of malformedPayloads) {
      const parsed = parseAdminReviewModerationPayload(payload)

      assert.equal(parsed.success, false)
      if (!parsed.success) {
        assert.equal(typeof parsed.error, 'string')
        assert.notEqual(parsed.error.length, 0)
      }
    }
  })
})
