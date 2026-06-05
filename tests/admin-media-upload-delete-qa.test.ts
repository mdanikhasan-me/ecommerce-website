import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'

import {
  runAdminMediaUploadDeleteQa,
  sanitizeAdminMediaQaEvidence,
} from '../scripts/qa-admin-media-upload-delete.mjs'

describe('guarded admin media upload-delete QA harness', () => {
  it('stops before helper imports or DB mutation when local DB URL safety fails', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'boilabin-admin-media-qa-unsafe-'))

    try {
      const evidence = await runAdminMediaUploadDeleteQa({
        cwd: root,
        baseEnv: {
          DATABASE_URL: 'postgresql://user:secret@example.com:5432/prod',
          SHADOW_DATABASE_URL: '',
        },
      })

      assert.equal(evidence.stopped, true)
      assert.equal(evidence.apiHelperPathRan, false)
      assert.equal(evidence.browserPathRan, false)
      assert.equal(evidence.preflight.dbUrlSafetyPassed, false)
      assert.equal(evidence.preflight.localDbReachable, false)
      assert.equal(evidence.cleanup.tempRecordsCreated, 0)
      assert.equal(evidence.cleanup.tempFilesCreated, 0)
      assert.equal(evidence.cleanup.realMediaFilesDeleted, false)
      assert.match(evidence.stopReason, /Local DB URL safety failed/)
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })

  it('sanitizes secrets, emails, and full database URLs from evidence strings', () => {
    const evidence = sanitizeAdminMediaQaEvidence({
      message:
        'postgresql://user:secret@example.com:5432/db password=Secret123 token=abc admin@example.com',
      nested: {
        value: 'authorization=Bearer cookie=private',
      },
    })

    const formatted = JSON.stringify(evidence)
    assert.doesNotMatch(formatted, /postgresql:\/\/user:secret/)
    assert.doesNotMatch(formatted, /admin@example\.com/)
    assert.doesNotMatch(formatted, /Secret123|abc|private/)
    assert.match(formatted, /\[redacted-db-url\]/)
    assert.match(formatted, /\[redacted-email\]/)
  })
})
