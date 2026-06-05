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

function createClassificationSummary() {
  return {
    enabled: false,
    mode: 'disabled',
    deletionPerformed: false,
    databaseUsed: false,
    matchedRecordsIncluded: false,
    filenamesIncluded: false,
    classificationSkippedNoDbAwareMode: 0,
    referencedActive: 0,
    referencedHistoricalEvidence: 0,
    unreferencedManagedCandidate: 0,
    unverifiedReferenceCheckFailed: 0,
    unsafeOrUnsupported: 0,
    sourceAssetProtected: 0,
    outsideManagedRoots: 0,
  }
}

function createDbAwareRefusalSummary(reason) {
  return {
    ...createClassificationSummary(),
    mode: 'refused',
    requested: true,
    reason,
  }
}

function incrementClassification(summary, key) {
  summary[key] = (summary[key] ?? 0) + 1
}

function publicPathForFile(root, rootPath, filePath) {
  const relativePath = path.relative(rootPath, filePath).split(path.sep).join('/')
  return `${root.publicPrefix}${relativePath}`
}

async function collectFiles(rootPath, summary, options = {}) {
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
      await collectFiles(entryPath, summary, options)
      continue
    }

    if (!entry.isFile()) continue

    const stats = await fs.stat(entryPath)
    const extension = path.extname(entry.name).toLowerCase() || '[none]'
    summary.fileCount += 1
    summary.totalBytes += stats.size
    summary.extensionCounts[extension] = (summary.extensionCounts[extension] ?? 0) + 1

    if (typeof options.onFile === 'function') {
      await options.onFile(entryPath)
    }
  }
}

async function loadMediaReferencePlanner() {
  const [
    lifecycle,
    guard,
  ] = await Promise.all([
    import('../src/backend/admin/media-lifecycle.ts'),
    import('../src/backend/admin/media-reference-guard.ts'),
  ])

  return {
    classifyAdminMediaPath: lifecycle.classifyAdminMediaPath,
    planAdminMediaDeletionWithReferences: guard.planAdminMediaDeletionWithReferences,
  }
}

function classifyPlanResult(plan) {
  if (plan.incomplete || plan.errors?.length) return 'unverifiedReferenceCheckFailed'
  if (plan.protectedReferenceCount > 0) return 'referencedHistoricalEvidence'
  if (plan.referenceCount > 0) return 'referencedActive'
  if (plan.shouldDeleteLocalFile) return 'unreferencedManagedCandidate'
  return 'unsafeOrUnsupported'
}

function classifyUnsupportedCandidate(classification) {
  if (classification.bucket === 'protected-source-code-asset') return 'sourceAssetProtected'
  if (classification.bucket === 'unknown-local-path') return 'outsideManagedRoots'
  return 'unsafeOrUnsupported'
}

async function classifyCandidateUrl(candidateUrl, planner, referenceSource, classificationSummary) {
  const classification = planner.classifyAdminMediaPath(candidateUrl)

  if (!classification.canDeleteLocalFile || !classification.normalizedPath) {
    incrementClassification(classificationSummary, classifyUnsupportedCandidate(classification))
    return
  }

  const plan = await planner.planAdminMediaDeletionWithReferences({
    candidateUrl: classification.normalizedPath,
    referenceSource,
  })

  incrementClassification(classificationSummary, classifyPlanResult(plan))
}

async function createDbAwareClassification(input) {
  if (!input.dbAware) return createClassificationSummary()

  if (!input.referenceSource) {
    return createDbAwareRefusalSummary(
      'DB-aware classification requires an injected read-only reference source and is disabled by default.',
    )
  }

  const classificationSummary = {
    ...createClassificationSummary(),
    enabled: true,
    mode: 'injected-reference-source',
    requested: true,
  }
  const planner = await loadMediaReferencePlanner()

  for (const candidateUrl of input.candidateUrls) {
    try {
      await classifyCandidateUrl(candidateUrl, planner, input.referenceSource, classificationSummary)
    } catch {
      incrementClassification(classificationSummary, 'unverifiedReferenceCheckFailed')
    }
  }

  for (const candidateUrl of input.additionalCandidateUrls) {
    try {
      await classifyCandidateUrl(candidateUrl, planner, input.referenceSource, classificationSummary)
    } catch {
      incrementClassification(classificationSummary, 'unverifiedReferenceCheckFailed')
    }
  }

  return classificationSummary
}

export async function collectAdminMediaOrphanInventory({
  publicRoot = path.resolve(process.cwd(), 'public'),
  dbAware = false,
  referenceSource,
  additionalCandidateUrls = [],
} = {}) {
  const roots = []
  const candidateUrls = []

  for (const root of ADMIN_MEDIA_ORPHAN_AUDIT_ROOTS) {
    const summary = createRootSummary(root)
    const rootPath = path.resolve(publicRoot, root.relativeRoot)

    try {
      const stats = await fs.stat(rootPath)
      summary.exists = stats.isDirectory()
      if (summary.exists) {
        await collectFiles(rootPath, summary, {
          async onFile(filePath) {
            candidateUrls.push(publicPathForFile(root, rootPath, filePath))
          },
        })
      }
    } catch (error) {
      if (!error || error.code !== 'ENOENT') throw error
    }

    roots.push(summary)
  }

  const classification = await createDbAwareClassification({
    dbAware,
    referenceSource,
    candidateUrls,
    additionalCandidateUrls,
  })

  if (!classification.enabled && classification.mode === 'disabled') {
    classification.classificationSkippedNoDbAwareMode = candidateUrls.length
  }

  return {
    dryRun: true,
    deletionPerformed: false,
    privateEnvRead: false,
    databaseUsed: false,
    canDetermineOrphansWithoutDbReferences: false,
    dbAwareReferenceAdapterAvailable: true,
    dbAwareReferenceCheckEnabled: classification.enabled,
    classification,
    note:
      'Read-only inventory only. This script does not delete files and does not prove orphan status. DB-aware confirmation requires an explicit reference adapter and is not enabled by default.',
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
