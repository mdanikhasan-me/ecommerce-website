import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, it } from 'node:test'

const scriptUrl = pathToFileURL(path.resolve('scripts/audit-admin-media-orphans.mjs')).href

describe('admin media orphan dry-run inventory', () => {
  it('summarizes managed upload roots without deleting files or printing names', async () => {
    const {
      collectAdminMediaOrphanInventory,
      formatAdminMediaOrphanInventory,
    } = await import(scriptUrl)
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'boilabin-media-orphan-audit-'))

    try {
      const publicRoot = path.join(root, 'public')
      const adminFile = path.join(publicRoot, 'uploads', 'admin', 'banners', 'banner-private-name.webp')
      const productFile = path.join(publicRoot, 'uploads', 'products', 'product-private-name.jpg')

      await fs.mkdir(path.dirname(adminFile), { recursive: true })
      await fs.mkdir(path.dirname(productFile), { recursive: true })
      await fs.writeFile(adminFile, 'admin')
      await fs.writeFile(productFile, 'product')

      const inventory = await collectAdminMediaOrphanInventory({ publicRoot })
      const formatted = formatAdminMediaOrphanInventory(inventory)

      assert.equal(inventory.dryRun, true)
      assert.equal(inventory.deletionPerformed, false)
      assert.equal(inventory.privateEnvRead, false)
      assert.equal(inventory.databaseUsed, false)
      assert.equal(inventory.canDetermineOrphansWithoutDbReferences, false)
      assert.equal(inventory.dbAwareReferenceAdapterAvailable, true)
      assert.equal(inventory.dbAwareReferenceCheckEnabled, false)
      assert.equal(inventory.classification.enabled, false)
      assert.equal(inventory.classification.mode, 'disabled')
      assert.equal(inventory.classification.classificationSkippedNoDbAwareMode, 2)
      assert.deepEqual(
        inventory.roots.map((rootSummary: { label: string; fileCount: number }) => [
          rootSummary.label,
          rootSummary.fileCount,
        ]),
        [
          ['admin', 1],
          ['products', 1],
        ],
      )
      assert.match(formatted, /"dryRun": true/)
      assert.match(formatted, /explicit reference adapter/)
      assert.doesNotMatch(formatted, /banner-private-name/)
      assert.doesNotMatch(formatted, /product-private-name/)
      await assert.doesNotReject(fs.stat(adminFile))
      await assert.doesNotReject(fs.stat(productFile))
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })

  it('requires explicit injected references before DB-aware classification is enabled', async () => {
    const {
      collectAdminMediaOrphanInventory,
      formatAdminMediaOrphanInventory,
    } = await import(scriptUrl)
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'boilabin-media-orphan-audit-'))

    try {
      const publicRoot = path.join(root, 'public')
      const productFile = path.join(publicRoot, 'uploads', 'products', 'product-private-name.jpg')

      await fs.mkdir(path.dirname(productFile), { recursive: true })
      await fs.writeFile(productFile, 'product')

      const inventory = await collectAdminMediaOrphanInventory({ publicRoot, dbAware: true })
      const formatted = formatAdminMediaOrphanInventory(inventory)

      assert.equal(inventory.dryRun, true)
      assert.equal(inventory.deletionPerformed, false)
      assert.equal(inventory.privateEnvRead, false)
      assert.equal(inventory.databaseUsed, false)
      assert.equal(inventory.dbAwareReferenceCheckEnabled, false)
      assert.equal(inventory.classification.mode, 'refused')
      assert.equal(inventory.classification.requested, true)
      assert.match(inventory.classification.reason, /injected read-only reference source/)
      assert.doesNotMatch(formatted, /product-private-name/)
      await assert.doesNotReject(fs.stat(productFile))
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })

  it('classifies DB-aware orphan candidates with aggregate counts only', async () => {
    const {
      collectAdminMediaOrphanInventory,
      formatAdminMediaOrphanInventory,
    } = await import(scriptUrl)
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'boilabin-media-orphan-audit-'))
    const calls: string[] = []

    const referenceSource = {
      async countReferences(input: { candidateUrl: string; fields: Array<{ key: string }> }) {
        calls.push(input.candidateUrl)

        if (input.candidateUrl.includes('lookup-failure')) {
          throw new Error('reference lookup failed for token=secret')
        }

        return {
          complete: true,
          fields: input.fields.map((field) => ({
            fieldKey: field.key,
            count:
              input.candidateUrl.includes('active-reference') && field.key === 'ProductImage.url'
                ? 1
                : input.candidateUrl.includes('historical-reference') && field.key === 'OrderItem.imageUrl'
                  ? 1
                  : 0,
          })),
        }
      },
    }

    try {
      const publicRoot = path.join(root, 'public')
      const activeFile = path.join(publicRoot, 'uploads', 'products', 'active-reference-private.jpg')
      const historicalFile = path.join(publicRoot, 'uploads', 'admin', 'banners', 'historical-reference-private.webp')
      const unreferencedFile = path.join(publicRoot, 'uploads', 'products', 'unreferenced-private.webp')
      const failedFile = path.join(publicRoot, 'uploads', 'products', 'lookup-failure-private.webp')

      for (const file of [activeFile, historicalFile, unreferencedFile, failedFile]) {
        await fs.mkdir(path.dirname(file), { recursive: true })
        await fs.writeFile(file, 'fixture')
      }

      const inventory = await collectAdminMediaOrphanInventory({
        publicRoot,
        dbAware: true,
        referenceSource,
        additionalCandidateUrls: [
          '/assets/private-source.webp',
          '/images/private-source.jpg',
          '/uploads/other/private-outside.webp',
          '/uploads/products/private-query.webp?token=secret',
          'https://cdn.example.test/private-remote.jpg',
        ],
      })
      const formatted = formatAdminMediaOrphanInventory(inventory)

      assert.equal(inventory.dryRun, true)
      assert.equal(inventory.deletionPerformed, false)
      assert.equal(inventory.privateEnvRead, false)
      assert.equal(inventory.databaseUsed, false)
      assert.equal(inventory.dbAwareReferenceCheckEnabled, true)
      assert.equal(inventory.classification.enabled, true)
      assert.equal(inventory.classification.mode, 'injected-reference-source')
      assert.equal(inventory.classification.referencedActive, 1)
      assert.equal(inventory.classification.referencedHistoricalEvidence, 1)
      assert.equal(inventory.classification.unreferencedManagedCandidate, 1)
      assert.equal(inventory.classification.unverifiedReferenceCheckFailed, 1)
      assert.equal(inventory.classification.sourceAssetProtected, 2)
      assert.equal(inventory.classification.outsideManagedRoots, 1)
      assert.equal(inventory.classification.unsafeOrUnsupported, 2)
      assert.equal(inventory.classification.filenamesIncluded, false)
      assert.equal(inventory.classification.matchedRecordsIncluded, false)
      assert.equal(inventory.classification.deletionPerformed, false)
      assert.equal(calls.length, 4)

      for (const privateText of [
        'active-reference-private',
        'historical-reference-private',
        'unreferenced-private',
        'lookup-failure-private',
        'private-source',
        'private-outside',
        'private-query',
        'private-remote',
        'token=secret',
      ]) {
        assert.doesNotMatch(formatted, new RegExp(privateText))
      }

      for (const file of [activeFile, historicalFile, unreferencedFile, failedFile]) {
        await assert.doesNotReject(fs.stat(file))
      }
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })
})
