import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseAdminReviewModerationPayload } from '@/backend/admin/review-moderation'

describe('admin review moderation validation', () => {
  it('accepts moderation statuses', () => {
    const approved = parseAdminReviewModerationPayload({ status: 'APPROVED' })
    const rejected = parseAdminReviewModerationPayload({ status: 'REJECTED' })

    assert.equal(approved.success, true)
    assert.equal(rejected.success, true)
  })

  it('rejects unsupported review statuses', () => {
    const parsed = parseAdminReviewModerationPayload({ status: 'PENDING' })

    assert.equal(parsed.success, false)
  })

  it('does not coerce malformed moderation payloads', () => {
    assert.equal(parseAdminReviewModerationPayload({}).success, false)
    assert.equal(parseAdminReviewModerationPayload(null).success, false)
    assert.equal(parseAdminReviewModerationPayload({ status: ' approved ' }).success, false)
    assert.equal(parseAdminReviewModerationPayload({ status: ['APPROVED'] }).success, false)
  })
})
