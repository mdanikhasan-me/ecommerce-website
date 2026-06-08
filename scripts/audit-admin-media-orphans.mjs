import { spawnSync } from 'node:child_process'
import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  evaluateDatabaseSafety,
  loadEnv,
} from './check-db-url-safety.mjs'

export const LOCAL_DB_AWARE_READONLY_FLAG = '--db-aware-readonly-local'

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
    requested: false,
    deletionPerformed: false,
    databaseUsed: false,
    localDbReadOnlyAllowed: false,
    localDbReadOnlyReason: 'Local DB-aware read-only mode was not requested.',
    databaseUrl: 'not-checked',
    shadowDatabaseUrl: 'not-checked',
    shadowDatabaseSeparate: false,
    safeForLocalMigration: false,
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

function createDbAwareRefusalSummary(reason, options = {}) {
  return {
    ...createClassificationSummary(),
    mode: options.mode ?? 'refused',
    requested: true,
    reason,
    localDbReadOnlyAllowed: Boolean(options.localDbReadOnlyAllowed),
    localDbReadOnlyReason: options.localDbReadOnlyReason ?? reason,
    databaseUrl: options.safety?.databaseUrl ?? 'not-checked',
    shadowDatabaseUrl: options.safety?.shadowDatabaseUrl ?? 'not-checked',
    shadowDatabaseSeparate: Boolean(options.safety?.shadowDatabaseSeparate),
    safeForLocalMigration: Boolean(options.safety?.safeForLocalMigration),
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
  const importModule = await createTypeScriptModuleImporter()
  const [
    lifecycleModule,
    guardModule,
  ] = await Promise.all([
    importModule('../src/backend/admin/media-lifecycle.ts'),
    importModule('../src/backend/admin/media-reference-guard.ts'),
  ])
  const lifecycle = unwrapImportedModule(lifecycleModule)
  const guard = unwrapImportedModule(guardModule)

  return {
    classifyAdminMediaPath: lifecycle.classifyAdminMediaPath,
    planAdminMediaDeletionWithReferences: guard.planAdminMediaDeletionWithReferences,
  }
}

function unwrapImportedModule(module) {
  return module?.default ?? module?.['module.exports'] ?? module
}

async function createTypeScriptModuleImporter() {
  if (isRunningWithTsx()) {
    return (specifier) => import(new URL(specifier, import.meta.url).href)
  }

  const { tsImport } = await import('tsx/esm/api')
  return (specifier) => tsImport(specifier, import.meta.url)
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
  if (input.dbAwareLocalReadOnly) {
    const guard = input.localDbReadOnlyGuard

    if (!guard?.localDbReadOnlyAllowed) {
      return createDbAwareRefusalSummary(
        guard?.reason ?? 'Local DB-aware read-only classification requires an explicit local DB safety guard.',
        {
          mode: 'local-prisma-readonly-refused',
          localDbReadOnlyAllowed: false,
          localDbReadOnlyReason:
            guard?.reason ?? 'Local DB-aware read-only classification was refused before Prisma execution.',
          safety: guard?.safety,
        },
      )
    }

    if (!input.referenceSource) {
      return createDbAwareRefusalSummary(
        'Local DB-aware read-only classification requires a read-only Prisma reference source.',
        {
          mode: 'local-prisma-readonly-refused',
          localDbReadOnlyAllowed: false,
          localDbReadOnlyReason: 'Read-only Prisma reference source could not be created safely.',
          safety: guard.safety,
        },
      )
    }

    return classifyWithReferenceSource({
      candidateUrls: input.candidateUrls,
      additionalCandidateUrls: input.additionalCandidateUrls,
      referenceSource: input.referenceSource,
      mode: 'local-prisma-readonly',
      databaseUsed: true,
      localDbReadOnlyAllowed: true,
      localDbReadOnlyReason: guard.reason,
      safety: guard.safety,
    })
  }

  if (!input.dbAware) return createClassificationSummary()

  if (!input.referenceSource) {
    return createDbAwareRefusalSummary(
      'DB-aware classification requires an injected read-only reference source and is disabled by default.',
    )
  }

  return classifyWithReferenceSource({
    candidateUrls: input.candidateUrls,
    additionalCandidateUrls: input.additionalCandidateUrls,
    referenceSource: input.referenceSource,
    mode: 'injected-reference-source',
    databaseUsed: false,
  })
}

async function classifyWithReferenceSource(input) {
  const classificationSummary = {
    ...createClassificationSummary(),
    enabled: true,
    mode: input.mode,
    requested: true,
    databaseUsed: Boolean(input.databaseUsed),
    localDbReadOnlyAllowed: Boolean(input.localDbReadOnlyAllowed),
    localDbReadOnlyReason: input.localDbReadOnlyReason ?? 'Local DB-aware read-only mode was not used.',
    databaseUrl: input.safety?.databaseUrl ?? 'not-checked',
    shadowDatabaseUrl: input.safety?.shadowDatabaseUrl ?? 'not-checked',
    shadowDatabaseSeparate: Boolean(input.safety?.shadowDatabaseSeparate),
    safeForLocalMigration: Boolean(input.safety?.safeForLocalMigration),
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

export function createLocalDbReadOnlyGuard({
  cwd = process.cwd(),
  baseEnv = process.env,
} = {}) {
  const env = loadEnv({ cwd, baseEnv })
  const safety = evaluateDatabaseSafety(env)
  const localDbReadOnlyAllowed = Boolean(safety.safeForLocalMigration)

  return {
    env,
    safety,
    localDbReadOnlyAllowed,
    reason: localDbReadOnlyAllowed
      ? 'Local DB-aware read-only audit allowed by local and separate DB URL guardrails.'
      : 'Refusing local DB-aware read-only audit: DATABASE_URL and SHADOW_DATABASE_URL must both be local and separate.',
  }
}

export async function createLocalPrismaReferenceSource(env) {
  const [
    prismaModule,
    adapterModule,
  ] = await Promise.all([
    import('@prisma/client'),
    createTypeScriptModuleImporter().then((importModule) => (
      importModule('../src/backend/admin/media-reference-adapter.ts')
    )),
  ])
  const adapter = unwrapImportedModule(adapterModule)
  const prisma = new prismaModule.PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log: [],
  })

  return {
    referenceSource: adapter.createPrismaAdminMediaReferenceSource(prisma),
    async close() {
      if (typeof prisma.$disconnect === 'function') {
        await prisma.$disconnect().catch(() => undefined)
      }
    },
  }
}

function isRunningWithTsx() {
  return process.execArgv.some((arg) => arg.toLowerCase().includes('tsx'))
}

function relayProcessOutput(value, write) {
  const output = String(value ?? '').trimEnd()
  if (output) write(output)
}

export function runAdminMediaOrphanAuditWithTsx({
  argv,
  cwd = process.cwd(),
  stdout = console.log,
  stderr = console.error,
  spawn = spawnSync,
} = {}) {
  const tsxCli = path.resolve(cwd, 'node_modules', 'tsx', 'dist', 'cli.mjs')
  if (!existsSync(tsxCli)) {
    stderr('Local DB-aware read-only audit requires the project-local TypeScript runner.')
    return 1
  }

  const scriptPath = path.resolve(cwd, 'scripts', 'audit-admin-media-orphans.mjs')
  const result = spawn(process.execPath, [tsxCli, scriptPath, ...argv], {
    cwd,
    encoding: 'utf8',
  })

  relayProcessOutput(result.stdout, stdout)
  relayProcessOutput(result.stderr, stderr)

  if (result.error) {
    stderr('Local DB-aware read-only audit failed to start safely.')
    return 1
  }

  return result.status ?? 1
}

export async function collectAdminMediaOrphanInventory({
  publicRoot = path.resolve(process.cwd(), 'public'),
  dbAware = false,
  dbAwareLocalReadOnly = false,
  referenceSource,
  localDbReadOnlyGuard,
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
    dbAwareLocalReadOnly,
    referenceSource,
    localDbReadOnlyGuard,
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
    databaseUsed: Boolean(classification.databaseUsed),
    canDetermineOrphansWithoutDbReferences: false,
    dbAwareReferenceAdapterAvailable: true,
    dbAwareReferenceCheckEnabled: classification.enabled,
    localDbReadOnlyAllowed: Boolean(classification.localDbReadOnlyAllowed),
    localDbReadOnlyReason: classification.localDbReadOnlyReason,
    classification,
    note:
      'Read-only inventory only. This script does not delete files and does not prove orphan status. DB-aware confirmation requires an explicit reference adapter and is not enabled by default.',
    roots,
  }
}

export function formatAdminMediaOrphanInventory(inventory) {
  return JSON.stringify(inventory, null, 2)
}

export async function runAdminMediaOrphanAuditCli({
  argv = process.argv.slice(2),
  cwd = process.cwd(),
  publicRoot = path.resolve(cwd, 'public'),
  stdout = console.log,
  stderr = console.error,
  createLocalGuard = () => createLocalDbReadOnlyGuard({ cwd }),
  createLocalReferenceSource = createLocalPrismaReferenceSource,
  allowTsxRerun = false,
  spawn = spawnSync,
} = {}) {
  const localReadOnlyRequested = argv.includes(LOCAL_DB_AWARE_READONLY_FLAG)
  const unknownArgs = argv.filter((arg) => arg !== LOCAL_DB_AWARE_READONLY_FLAG)

  if (unknownArgs.length > 0) {
    stderr('Unsupported admin media orphan audit option.')
    return 1
  }

  if (!localReadOnlyRequested) {
    const inventory = await collectAdminMediaOrphanInventory({ publicRoot })
    stdout(formatAdminMediaOrphanInventory(inventory))
    return 0
  }

  const guard = createLocalGuard()
  if (!guard.localDbReadOnlyAllowed) {
    const inventory = await collectAdminMediaOrphanInventory({
      publicRoot,
      dbAwareLocalReadOnly: true,
      localDbReadOnlyGuard: guard,
    })
    stdout(formatAdminMediaOrphanInventory(inventory))
    stderr('Refusing local DB-aware read-only audit before Prisma execution.')
    return 1
  }

  if (allowTsxRerun && createLocalReferenceSource === createLocalPrismaReferenceSource && !isRunningWithTsx()) {
    return runAdminMediaOrphanAuditWithTsx({
      argv: [LOCAL_DB_AWARE_READONLY_FLAG],
      cwd,
      stdout,
      stderr,
      spawn,
    })
  }

  let sourceHandle
  try {
    sourceHandle = await createLocalReferenceSource(guard.env)
    const inventory = await collectAdminMediaOrphanInventory({
      publicRoot,
      dbAwareLocalReadOnly: true,
      localDbReadOnlyGuard: guard,
      referenceSource: sourceHandle.referenceSource,
    })
    stdout(formatAdminMediaOrphanInventory(inventory))
    return 0
  } catch {
    const inventory = await collectAdminMediaOrphanInventory({
      publicRoot,
      dbAwareLocalReadOnly: true,
      localDbReadOnlyGuard: {
        ...guard,
        localDbReadOnlyAllowed: false,
        reason: 'Local DB-aware read-only audit could not create a safe Prisma reference source.',
      },
    })
    stdout(formatAdminMediaOrphanInventory(inventory))
    stderr('Local DB-aware read-only audit failed before safe aggregate execution.')
    return 1
  } finally {
    if (sourceHandle && typeof sourceHandle.close === 'function') {
      await sourceHandle.close()
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runAdminMediaOrphanAuditCli({ allowTsxRerun: true })
    .then((status) => {
      process.exit(status)
    })
    .catch(() => {
      console.error('Admin media orphan audit failed before safe aggregate output was produced.')
      process.exit(1)
    })
}
