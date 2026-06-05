import { promises as fs } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export const ADMIN_MEDIA_ORPHAN_AUDIT_ROOTS = [
  {
    label: 'admin',
    publicPrefix: '/uploads/admin/',
    relativeRoot: path.join('uploads', 'admin'),
  },
  {
    label: 'products',
    publicPrefix: '/uploads/products/',
    relativeRoot: path.join('uploads', 'products'),
  },
]

function createRootSummary(root) {
  return {
    label: root.label,
    publicPrefix: root.publicPrefix,
    exists: false,
    fileCount: 0,
    totalBytes: 0,
    extensionCounts: {},
  }
}

async function collectFiles(rootPath, summary) {
  let entries
  try {
    entries = await fs.readdir(rootPath, { withFileTypes: true })
  } catch (error) {
    if (error && error.code === 'ENOENT') return
    throw error
  }

  for (const entry of entries) {
    const entryPath = path.join(rootPath, entry.name)

    if (entry.isDirectory()) {
      await collectFiles(entryPath, summary)
      continue
    }

    if (!entry.isFile()) continue

    const stats = await fs.stat(entryPath)
    const extension = path.extname(entry.name).toLowerCase() || '[none]'
    summary.fileCount += 1
    summary.totalBytes += stats.size
    summary.extensionCounts[extension] = (summary.extensionCounts[extension] ?? 0) + 1
  }
}

export async function collectAdminMediaOrphanInventory({
  publicRoot = path.resolve(process.cwd(), 'public'),
} = {}) {
  const roots = []

  for (const root of ADMIN_MEDIA_ORPHAN_AUDIT_ROOTS) {
    const summary = createRootSummary(root)
    const rootPath = path.resolve(publicRoot, root.relativeRoot)

    try {
      const stats = await fs.stat(rootPath)
      summary.exists = stats.isDirectory()
      if (summary.exists) {
        await collectFiles(rootPath, summary)
      }
    } catch (error) {
      if (!error || error.code !== 'ENOENT') throw error
    }

    roots.push(summary)
  }

  return {
    dryRun: true,
    deletionPerformed: false,
    privateEnvRead: false,
    databaseUsed: false,
    canDetermineOrphansWithoutDbReferences: false,
    note: 'Read-only inventory only. This script does not delete files and does not prove orphan status.',
    roots,
  }
}

export function formatAdminMediaOrphanInventory(inventory) {
  return JSON.stringify(inventory, null, 2)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const inventory = await collectAdminMediaOrphanInventory()
  console.log(formatAdminMediaOrphanInventory(inventory))
}
