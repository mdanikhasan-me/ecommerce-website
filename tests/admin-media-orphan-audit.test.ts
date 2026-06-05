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
        runAdminMediaOrphanAuditCli,
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
      assert.equal(inventory.localDbReadOnlyAllowed, false)
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

      const stdout: string[] = []
      const defaultStatus = await runAdminMediaOrphanAuditCli({
        publicRoot,
        stdout: (line: string) => stdout.push(line),
        createLocalReferenceSource() {
          throw new Error('Default CLI must not create a Prisma reference source.')
        },
      })
      const defaultCliInventory = JSON.parse(stdout.join('\n'))

      assert.equal(defaultStatus, 0)
      assert.equal(defaultCliInventory.databaseUsed, false)
      assert.equal(defaultCliInventory.dbAwareReferenceCheckEnabled, false)
      assert.equal(defaultCliInventory.classification.mode, 'disabled')
      assert.doesNotMatch(stdout.join('\n'), /banner-private-name/)
      assert.doesNotMatch(stdout.join('\n'), /product-private-name/)
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

  it('refuses explicit local DB-aware CLI mode before Prisma when local guard is unsafe', async () => {
    const {
      LOCAL_DB_AWARE_READONLY_FLAG,
      runAdminMediaOrphanAuditCli,
    } = await import(scriptUrl)
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'boilabin-media-orphan-audit-'))
    let sourceCreated = false

    try {
      const publicRoot = path.join(root, 'public')
      const productFile = path.join(publicRoot, 'uploads', 'products', 'unsafe-guard-private.jpg')

      await fs.mkdir(path.dirname(productFile), { recursive: true })
      await fs.writeFile(productFile, 'product')

      const stdout: string[] = []
      const stderr: string[] = []
      const status = await runAdminMediaOrphanAuditCli({
        argv: [LOCAL_DB_AWARE_READONLY_FLAG],
        publicRoot,
        stdout: (line: string) => stdout.push(line),
        stderr: (line: string) => stderr.push(line),
        createLocalGuard() {
          return {
            env: {},
            safety: {
              databaseUrl: 'remote-looking',
              shadowDatabaseUrl: 'missing',
              shadowDatabaseSeparate: false,
              safeForLocalMigration: false,
            },
            localDbReadOnlyAllowed: false,
            reason: 'Refusing local DB-aware read-only audit: DATABASE_URL and SHADOW_DATABASE_URL must both be local and separate.',
          }
        },
        createLocalReferenceSource() {
          sourceCreated = true
          throw new Error('Unsafe guard must refuse before Prisma.')
        },
      })
      const formatted = stdout.join('\n')
      const inventory = JSON.parse(formatted)

      assert.equal(status, 1)
      assert.equal(sourceCreated, false)
      assert.equal(inventory.dryRun, true)
      assert.equal(inventory.deletionPerformed, false)
      assert.equal(inventory.databaseUsed, false)
      assert.equal(inventory.dbAwareReferenceCheckEnabled, false)
      assert.equal(inventory.localDbReadOnlyAllowed, false)
      assert.equal(inventory.classification.mode, 'local-prisma-readonly-refused')
      assert.equal(inventory.classification.databaseUrl, 'remote-looking')
      assert.equal(inventory.classification.shadowDatabaseUrl, 'missing')
      assert.match(stderr.join('\n'), /Refusing local DB-aware read-only audit/)
      assert.doesNotMatch(formatted, /unsafe-guard-private/)
      assert.doesNotMatch(formatted, /postgresql:\/\//)
      await assert.doesNotReject(fs.stat(productFile))
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })

  it('runs explicit local DB-aware CLI mode through a mocked count-only source', async () => {
    const {
      LOCAL_DB_AWARE_READONLY_FLAG,
      runAdminMediaOrphanAuditCli,
    } = await import(scriptUrl)
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'boilabin-media-orphan-audit-'))
    const calls: string[] = []
    let closed = false

    try {
      const publicRoot = path.join(root, 'public')
      const activeFile = path.join(publicRoot, 'uploads', 'products', 'cli-active-private.jpg')
      const historicalFile = path.join(publicRoot, 'uploads', 'admin', 'banners', 'cli-historical-private.webp')
      const unreferencedFile = path.join(publicRoot, 'uploads', 'products', 'cli-unreferenced-private.webp')
      const failedFile = path.join(publicRoot, 'uploads', 'products', 'cli-lookup-failure-private.webp')

      for (const file of [activeFile, historicalFile, unreferencedFile, failedFile]) {
        await fs.mkdir(path.dirname(file), { recursive: true })
        await fs.writeFile(file, 'fixture')
      }

      const stdout: string[] = []
      const stderr: string[] = []
      const status = await runAdminMediaOrphanAuditCli({
        argv: [LOCAL_DB_AWARE_READONLY_FLAG],
        publicRoot,
        stdout: (line: string) => stdout.push(line),
        stderr: (line: string) => stderr.push(line),
        createLocalGuard() {
          return {
            env: {
              DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/boilabin_local',
            },
            safety: {
              databaseUrl: 'local',
              shadowDatabaseUrl: 'local',
              shadowDatabaseSeparate: true,
              safeForLocalMigration: true,
            },
            localDbReadOnlyAllowed: true,
            reason: 'Local DB-aware read-only audit allowed by local and separate DB URL guardrails.',
          }
        },
        async createLocalReferenceSource() {
          return {
            referenceSource: {
              async countReferences(input: { candidateUrl: string; fields: Array<{ key: string }> }) {
                calls.push(input.candidateUrl)
                if (input.candidateUrl.includes('lookup-failure')) {
                  throw new Error('lookup failed for postgresql://user:pass@localhost/db token=secret')
                }

                return {
                  complete: true,
                  fields: input.fields.map((field) => ({
                    fieldKey: field.key,
                    count:
                      input.candidateUrl.includes('active-private') && field.key === 'ProductImage.url'
                        ? 1
                        : input.candidateUrl.includes('historical-private') && field.key === 'OrderItem.imageUrl'
                          ? 1
                          : 0,
                  })),
                }
              },
            },
            async close() {
              closed = true
            },
          }
        },
      })
      const formatted = stdout.join('\n')
      const inventory = JSON.parse(formatted)

      assert.equal(status, 0)
      assert.deepEqual(stderr, [])
      assert.equal(closed, true)
      assert.equal(calls.length, 4)
      assert.equal(inventory.dryRun, true)
      assert.equal(inventory.deletionPerformed, false)
      assert.equal(inventory.databaseUsed, true)
      assert.equal(inventory.dbAwareReferenceCheckEnabled, true)
      assert.equal(inventory.localDbReadOnlyAllowed, true)
      assert.equal(inventory.classification.mode, 'local-prisma-readonly')
      assert.equal(inventory.classification.databaseUsed, true)
      assert.equal(inventory.classification.databaseUrl, 'local')
      assert.equal(inventory.classification.shadowDatabaseUrl, 'local')
      assert.equal(inventory.classification.referencedActive, 1)
      assert.equal(inventory.classification.referencedHistoricalEvidence, 1)
      assert.equal(inventory.classification.unreferencedManagedCandidate, 1)
      assert.equal(inventory.classification.unverifiedReferenceCheckFailed, 1)
      assert.equal(inventory.classification.filenamesIncluded, false)
      assert.equal(inventory.classification.matchedRecordsIncluded, false)

      for (const privateText of [
        'cli-active-private',
        'cli-historical-private',
        'cli-unreferenced-private',
        'cli-lookup-failure-private',
        'postgresql://user',
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

  it('rejects unsupported CLI options without enabling deletion or local DB reads', async () => {
    const { runAdminMediaOrphanAuditCli } = await import(scriptUrl)
    const stdout: string[] = []
    const stderr: string[] = []
    let sourceCreated = false

    const status = await runAdminMediaOrphanAuditCli({
      argv: ['--delete'],
      stdout: (line: string) => stdout.push(line),
      stderr: (line: string) => stderr.push(line),
      createLocalReferenceSource() {
        sourceCreated = true
        throw new Error('Unsupported options must not create a Prisma reference source.')
      },
    })

    assert.equal(status, 1)
    assert.equal(sourceCreated, false)
    assert.deepEqual(stdout, [])
    assert.match(stderr.join('\n'), /Unsupported admin media orphan audit option/)
    assert.doesNotMatch(stderr.join('\n'), /postgresql:\/\//)
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
      assert.match(inventory.note, /does not prove orphan status/)
      assert.doesNotMatch(formatted, /safeToDelete|safeDeletion|safe-to-delete|safe to delete|deletable/i)

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
