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
      assert.doesNotMatch(formatted, /banner-private-name/)
      assert.doesNotMatch(formatted, /product-private-name/)
      await assert.doesNotReject(fs.stat(adminFile))
      await assert.doesNotReject(fs.stat(productFile))
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })
})
