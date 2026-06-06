import { spawnSync } from 'node:child_process'
import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  evaluateDatabaseSafety,
  loadEnv,
} from './check-db-url-safety.mjs'

const DEFAULT_OUT_DIR = path.join('audit-reports', '309-media-source-of-truth')
const MEDIA_ROOTS = ['public/assets', 'public/uploads']
const LOCAL_MEDIA_REFERENCE_PATTERN =
  /\/(?:assets|uploads)\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]+/g
const REMOTE_REFERENCE_PATTERN =
  /https?:\/\/[^\s"'`<>)]+/g
const IMAGE_FILE_REFERENCE_PATTERN =
  /[A-Za-z0-9._/\\-]+\.(?:avif|webp|jpe?g|png|svg|gif)(?:\?[^\s"'`<>)]+)?/gi
const MEDIA_EXTENSIONS = new Set(['.avif', '.webp', '.jpg', '.jpeg', '.png', '.svg', '.gif'])
const SOURCE_SCAN_ROOTS = ['src', 'prisma', 'scripts', 'tests']
const SKIPPED_SCAN_DIRS = new Set([
  '.git',
  '.next',
  'node_modules',
  'audit-reports',
  'public',
])

function normalizeSlash(value) {
  return value.split(path.sep).join('/')
}

function publicUrlForRelativePath(relativePath) {
  const normalized = normalizeSlash(relativePath)
  if (!normalized.startsWith('public/')) return null
  return `/${normalized.slice('public/'.length)}`
}

function filePathForPublicUrl(root, publicUrl) {
  if (!publicUrl?.startsWith('/')) return null
  const clean = publicUrl.split(/[?#]/, 1)[0]
  return path.join(root, 'public', ...clean.slice(1).split('/'))
}

function extensionOf(value) {
  return path.extname(value.split(/[?#]/, 1)[0]).toLowerCase()
}

function isMediaFile(relativePath) {
  const extension = extensionOf(relativePath)
  return MEDIA_EXTENSIONS.has(extension) || relativePath.endsWith('/.gitkeep')
}

function isPossibleQaTemp(publicPath) {
  return /(?:qa|test|temp|step[-_ ]?\d+|qamedia)/i.test(publicPath)
}

export function classifyPublicMediaPath(publicPath) {
  if (!publicPath?.startsWith('/')) {
    return {
      folderOwnerGuess: 'unknown',
      ownershipClass: 'unknown',
      safeToDelete: 'unknown/manual review',
      risk: 'unknown local or non-public path',
    }
  }

  if (publicPath.includes('\0') || publicPath.includes('..') || /[\\]/.test(publicPath)) {
    return {
      folderOwnerGuess: 'unknown',
      ownershipClass: 'unsafe local path',
      safeToDelete: 'unknown/manual review',
      risk: 'path traversal or unsafe path syntax; refuse automated cleanup',
    }
  }

  if (isPossibleQaTemp(publicPath)) {
    return {
      folderOwnerGuess: 'possible QA/temp leftover',
      ownershipClass: 'possible QA/temp leftover',
      safeToDelete: publicPath.startsWith('/uploads/')
        ? 'likely orphan candidate'
        : 'unknown/manual review',
      risk: 'name suggests temporary QA/test media; verify references before deletion',
    }
  }

  if (publicPath.startsWith('/assets/products/catalog/')) {
    return {
      folderOwnerGuess: 'product catalog source',
      ownershipClass: 'source asset',
      safeToDelete: 'never',
      risk: 'source-controlled catalog asset; admin cleanup must not delete it',
    }
  }

  if (publicPath.startsWith('/assets/banners/')) {
    return {
      folderOwnerGuess: 'banner source',
      ownershipClass: 'source asset',
      safeToDelete: 'never',
      risk: 'source-controlled banner asset; admin cleanup must not delete it',
    }
  }

  if (publicPath.startsWith('/assets/categories/subcategories/')) {
    return {
      folderOwnerGuess: 'managed upload',
      ownershipClass: 'approved category media folder',
      safeToDelete: 'only if unreferenced',
      risk: 'approved subcategory media exception under /assets; cleanup needs exact managed-prefix handling',
    }
  }

  if (publicPath.startsWith('/assets/categories/')) {
    return {
      folderOwnerGuess: 'category source',
      ownershipClass: 'source asset',
      safeToDelete: 'never',
      risk: 'source-controlled category asset; admin cleanup must not delete it',
    }
  }

  if (publicPath.startsWith('/assets/payments/')) {
    return {
      folderOwnerGuess: 'payment logo',
      ownershipClass: 'source asset',
      safeToDelete: 'never',
      risk: 'bundled payment logo asset',
    }
  }

  if (publicPath.startsWith('/assets/icons/')) {
    return {
      folderOwnerGuess: 'icon',
      ownershipClass: 'source asset',
      safeToDelete: 'never',
      risk: 'bundled UI/icon asset',
    }
  }

  if (publicPath.startsWith('/assets/')) {
    return {
      folderOwnerGuess: 'source asset',
      ownershipClass: 'source asset',
      safeToDelete: 'never',
      risk: 'bundled source asset',
    }
  }

  if (publicPath.startsWith('/uploads/admin/files/')) {
    return {
      folderOwnerGuess: 'managed upload',
      ownershipClass: 'generic admin file upload',
      safeToDelete: 'only if unreferenced',
      risk: 'generic admin file; orphan-prone unless a DB/source reference exists',
    }
  }

  if (publicPath.startsWith('/uploads/admin/') || publicPath.startsWith('/uploads/products/')) {
    return {
      folderOwnerGuess: 'managed upload',
      ownershipClass: 'managed upload',
      safeToDelete: 'only if unreferenced',
      risk: 'runtime/admin upload; deletion requires reference-safe cleanup',
    }
  }

  if (publicPath.startsWith('/uploads/')) {
    return {
      folderOwnerGuess: 'managed upload',
      ownershipClass: 'unknown upload root',
      safeToDelete: 'unknown/manual review',
      risk: 'upload-like path outside currently approved managed roots',
    }
  }

  return {
    folderOwnerGuess: 'unknown',
    ownershipClass: 'unknown',
    safeToDelete: 'unknown/manual review',
    risk: 'unrecognized public media path',
  }
}

export function classifyReferenceTarget(reference) {
  const value = String(reference ?? '').trim()
  if (!value) {
    return {
      isRemote: false,
      isLocal: false,
      targetClass: 'empty',
      riskClassification: 'empty reference',
    }
  }

  if (/^https?:\/\//i.test(value)) {
    const lower = value.toLowerCase()
    return {
      isRemote: true,
      isLocal: false,
      targetClass: 'remote',
      riskClassification: lower.includes('images.unsplash.com') || lower.includes('source.unsplash.com')
        ? 'active remote Unsplash media risk if used by runtime DB/source'
        : 'remote media risk if used by runtime DB/source',
    }
  }

  if (value.startsWith('/')) {
    const clean = value.split(/[?#]/, 1)[0]
    const pathClass = classifyPublicMediaPath(clean)
    return {
      isRemote: false,
      isLocal: true,
      targetClass: pathClass.ownershipClass,
      riskClassification: pathClass.risk,
    }
  }

  return {
    isRemote: false,
    isLocal: false,
    targetClass: 'non-public/local-token',
    riskClassification: 'not a public media URL',
  }
}

function runGit(args, cwd) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    windowsHide: true,
  })

  if (result.error || result.status !== 0) {
    return ''
  }

  return result.stdout ?? ''
}

function parseGitStatusZ(output) {
  const entries = new Map()
  const parts = output.split('\0').filter(Boolean)
  for (let index = 0; index < parts.length; index += 1) {
    const item = parts[index]
    const status = item.slice(0, 2)
    const file = item.slice(3)
    if (!file) continue

    if (status.includes('R') || status.includes('C')) {
      index += 1
      const nextPath = parts[index]
      entries.set(nextPath ?? file, status.trim())
      continue
    }

    entries.set(file, status.trim())
  }
  return entries
}

function statusLabelFor(relativePath, trackedSet, statusMap) {
  const status = statusMap.get(relativePath)
  if (status?.includes('D')) return 'deleted'
  if (status === '??') return 'untracked'
  if (status) return 'modified'
  if (trackedSet.has(relativePath)) return 'tracked'
  return 'untracked'
}

async function collectExistingFiles(root, relativeDir, output = []) {
  const absoluteDir = path.join(root, relativeDir)
  let entries = []
  try {
    entries = await fs.readdir(absoluteDir, { withFileTypes: true })
  } catch (error) {
    if (error?.code === 'ENOENT') return output
    throw error
  }

  for (const entry of entries) {
    const relativePath = normalizeSlash(path.join(relativeDir, entry.name))
    if (entry.isDirectory()) {
      await collectExistingFiles(root, relativePath, output)
      continue
    }
    if (!entry.isFile()) continue
    if (!isMediaFile(relativePath)) continue
    output.push(relativePath)
  }

  return output
}

async function collectQaTempDirectories(root, relativeDir, output = []) {
  const absoluteDir = path.join(root, relativeDir)
  let entries = []
  try {
    entries = await fs.readdir(absoluteDir, { withFileTypes: true })
  } catch (error) {
    if (error?.code === 'ENOENT') return output
    throw error
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const relativePath = normalizeSlash(path.join(relativeDir, entry.name))
    const publicPath = publicUrlForRelativePath(relativePath)
    if (publicPath && isPossibleQaTemp(publicPath)) {
      const nestedFiles = []
      await collectExistingFiles(root, relativePath, nestedFiles)
      output.push({
        relativeFilesystemPath: relativePath,
        publicUrlPath: publicPath,
        mediaFileCount: nestedFiles.length,
        safeToDelete: nestedFiles.length === 0 ? 'unknown/manual review' : 'only if unreferenced',
        risk: 'QA/test-looking directory; directory cleanup still needs explicit approval.',
      })
    }
    await collectQaTempDirectories(root, relativePath, output)
  }

  return output
}

async function buildMediaFileInventory({ cwd = process.cwd() } = {}) {
  const tracked = runGit(['ls-files', '-z', '--', ...MEDIA_ROOTS], cwd)
    .split('\0')
    .filter(Boolean)
    .filter(isMediaFile)
  const trackedSet = new Set(tracked)
  const statusMap = parseGitStatusZ(runGit(['status', '--porcelain=v1', '-z', '--', ...MEDIA_ROOTS], cwd))
  const existing = []

  for (const mediaRoot of MEDIA_ROOTS) {
    await collectExistingFiles(cwd, mediaRoot, existing)
  }
  const qaTempDirectories = []
  for (const mediaRoot of MEDIA_ROOTS) {
    await collectQaTempDirectories(cwd, mediaRoot, qaTempDirectories)
  }

  const allRelativePaths = Array.from(new Set([...existing, ...tracked])).sort((a, b) => a.localeCompare(b))
  const files = []

  for (const relativePath of allRelativePaths) {
    const absolutePath = path.join(cwd, ...relativePath.split('/'))
    const exists = existsSync(absolutePath)
    const publicPath = publicUrlForRelativePath(relativePath)
    const classification = classifyPublicMediaPath(publicPath)
    const stats = exists ? await fs.stat(absolutePath) : null

    files.push({
      relativeFilesystemPath: relativePath,
      publicUrlPath: publicPath,
      extension: extensionOf(relativePath) || '[none]',
      sizeBytes: stats?.size ?? 0,
      exists,
      ...classification,
      gitStatus: statusLabelFor(relativePath, trackedSet, statusMap),
    })
  }

  const summary = {
    totalEntries: files.length,
    existingEntries: files.filter((file) => file.exists).length,
    deletedTrackedEntries: files.filter((file) => file.gitStatus === 'deleted').length,
    managedUploadEntries: files.filter((file) => file.folderOwnerGuess === 'managed upload').length,
    sourceAssetEntries: files.filter((file) => file.ownershipClass === 'source asset').length,
    possibleQaTempEntries: files.filter((file) => file.folderOwnerGuess === 'possible QA/temp leftover').length,
    possibleQaTempDirectories: qaTempDirectories.length,
  }

  return {
    generatedAt: new Date().toISOString(),
    dryRun: true,
    deletionPerformed: false,
    roots: MEDIA_ROOTS,
    summary,
    qaTempDirectories,
    files,
  }
}

function pushReference(references, input) {
  if (!input.referencePathOrUrl) return
  const referencePathOrUrl = String(input.referencePathOrUrl).trim()
  if (!referencePathOrUrl) return
  const target = classifyReferenceTarget(referencePathOrUrl)
  const exists = target.isLocal
    ? existsSync(filePathForPublicUrl(process.cwd(), referencePathOrUrl))
    : null

  references.push({
    referencePathOrUrl,
    ownerType: input.ownerType,
    ownerDetail: input.ownerDetail ?? null,
    sourceFile: input.sourceFile ?? null,
    sourceLine: input.sourceLine ?? null,
    referencedFileExists: exists,
    isRemote: target.isRemote,
    isLocal: target.isLocal,
    targetClass: target.targetClass,
    riskClassification: target.riskClassification,
  })
}

async function addDatabaseReferences(references, env) {
  const prismaModule = await import('@prisma/client')
  const prisma = new prismaModule.PrismaClient({
    datasources: { db: { url: env.DATABASE_URL } },
    log: [],
  })

  try {
    const [
      productImages,
      productVariants,
      banners,
      categories,
      brands,
      sellers,
      users,
      orderItems,
      returnRequests,
      reviews,
    ] = await Promise.all([
      prisma.productImage.findMany({
        select: {
          url: true,
          product: { select: { slug: true, isActive: true } },
        },
      }),
      prisma.productVariant.findMany({
        where: { image: { not: null } },
        select: {
          image: true,
          product: { select: { slug: true, isActive: true } },
        },
      }),
      prisma.banner.findMany({
        select: {
          title: true,
          position: true,
          sortOrder: true,
          isActive: true,
          imageUrl: true,
          mobileImageUrl: true,
        },
      }),
      prisma.category.findMany({
        select: { slug: true, parentId: true, isActive: true, image: true },
      }),
      prisma.brand.findMany({
        select: { slug: true, isActive: true, logo: true, banner: true },
      }),
      prisma.seller.findMany({
        select: { status: true, storeLogo: true, storeBanner: true },
      }),
      prisma.user.findMany({
        where: { image: { not: null } },
        select: { image: true },
      }),
      prisma.orderItem.findMany({
        where: { imageUrl: { not: null } },
        select: { imageUrl: true },
      }),
      prisma.returnRequest.findMany({
        where: { images: { isEmpty: false } },
        select: { images: true },
      }),
      prisma.review.findMany({
        where: { images: { isEmpty: false } },
        select: { images: true },
      }),
    ])

    for (const row of productImages) {
      pushReference(references, {
        referencePathOrUrl: row.url,
        ownerType: 'DB product image',
        ownerDetail: `product:${row.product.slug};active:${row.product.isActive}`,
      })
    }

    for (const row of productVariants) {
      pushReference(references, {
        referencePathOrUrl: row.image,
        ownerType: 'DB product variant image',
        ownerDetail: `product:${row.product.slug};active:${row.product.isActive}`,
      })
    }

    for (const row of banners) {
      const detail = `banner:${row.title || '[untitled]'};position:${row.position};sort:${row.sortOrder};active:${row.isActive}`
      pushReference(references, {
        referencePathOrUrl: row.imageUrl,
        ownerType: 'DB banner image',
        ownerDetail: `${detail};field:imageUrl`,
      })
      pushReference(references, {
        referencePathOrUrl: row.mobileImageUrl,
        ownerType: 'DB banner image',
        ownerDetail: `${detail};field:mobileImageUrl`,
      })
    }

    for (const row of categories) {
      pushReference(references, {
        referencePathOrUrl: row.image,
        ownerType: 'DB category image',
        ownerDetail: `category:${row.slug};kind:${row.parentId ? 'subcategory' : 'category'};active:${row.isActive}`,
      })
    }

    for (const row of brands) {
      pushReference(references, {
        referencePathOrUrl: row.logo,
        ownerType: 'DB brand image',
        ownerDetail: `brand:${row.slug};active:${row.isActive};field:logo`,
      })
      pushReference(references, {
        referencePathOrUrl: row.banner,
        ownerType: 'DB brand image',
        ownerDetail: `brand:${row.slug};active:${row.isActive};field:banner`,
      })
    }

    for (const row of sellers) {
      pushReference(references, {
        referencePathOrUrl: row.storeLogo,
        ownerType: 'DB seller image',
        ownerDetail: `seller-status:${row.status};field:storeLogo`,
      })
      pushReference(references, {
        referencePathOrUrl: row.storeBanner,
        ownerType: 'DB seller image',
        ownerDetail: `seller-status:${row.status};field:storeBanner`,
      })
    }

    for (const row of users) {
      pushReference(references, {
        referencePathOrUrl: row.image,
        ownerType: 'DB user image',
        ownerDetail: 'user avatar;id omitted',
      })
    }

    for (const row of orderItems) {
      pushReference(references, {
        referencePathOrUrl: row.imageUrl,
        ownerType: 'DB historical order item image',
        ownerDetail: 'historical order evidence;id omitted',
      })
    }

    for (const row of returnRequests) {
      for (const image of row.images ?? []) {
        pushReference(references, {
          referencePathOrUrl: image,
          ownerType: 'DB historical return image',
          ownerDetail: 'historical return evidence;id omitted',
        })
      }
    }

    for (const row of reviews) {
      for (const image of row.images ?? []) {
        pushReference(references, {
          referencePathOrUrl: image,
          ownerType: 'DB historical review image',
          ownerDetail: 'historical review evidence;id omitted',
        })
      }
    }
  } finally {
    await prisma.$disconnect().catch(() => undefined)
  }
}

async function collectSourceFiles(root, relativeDir, output = []) {
  const absoluteDir = path.join(root, relativeDir)
  let entries = []
  try {
    entries = await fs.readdir(absoluteDir, { withFileTypes: true })
  } catch (error) {
    if (error?.code === 'ENOENT') return output
    throw error
  }

  for (const entry of entries) {
    if (SKIPPED_SCAN_DIRS.has(entry.name)) continue
    const relativePath = normalizeSlash(path.join(relativeDir, entry.name))
    if (entry.isDirectory()) {
      await collectSourceFiles(root, relativePath, output)
      continue
    }
    if (!entry.isFile()) continue
    if (!/\.(?:ts|tsx|js|jsx|mjs|cjs|json|md|css|prisma)$/i.test(entry.name)) continue
    output.push(relativePath)
  }
  return output
}

function ownerTypeForSourceReference(relativePath, reference) {
  if (relativePath.startsWith('tests/')) return 'test fixture'
  if (relativePath.startsWith('scripts/')) return 'script/repair reference'
  if (relativePath === 'prisma/seed.ts') {
    if (reference.includes('/assets/products/catalog/')) return 'seed product image'
    if (reference.includes('/assets/banners/') || reference.includes('images.unsplash.com')) return 'seed banner image'
    return 'seed/config media reference'
  }
  if (relativePath.includes('Footer') || reference.includes('/assets/payments/')) return 'CSS/icon/payment asset'
  return 'source code import'
}

function extractReferencesFromText(text) {
  const matches = new Set()
  for (const pattern of [LOCAL_MEDIA_REFERENCE_PATTERN, REMOTE_REFERENCE_PATTERN, IMAGE_FILE_REFERENCE_PATTERN]) {
    for (const match of text.matchAll(pattern)) {
      const value = match[0].replace(/["'`),.;\]}]+$/g, '')
      if (!value) continue
      if (/^(?:import|from|className|imageUrl|images)$/i.test(value)) continue
      if (!value.startsWith('/') && !value.startsWith('http') && !value.startsWith('public/')) continue
      matches.add(value.startsWith('public/') ? publicUrlForRelativePath(value) : value)
    }
  }
  return Array.from(matches).filter(Boolean)
}

async function addSourceReferences(references, { cwd = process.cwd() } = {}) {
  const files = []
  for (const root of SOURCE_SCAN_ROOTS) {
    await collectSourceFiles(cwd, root, files)
  }

  for (const relativePath of files.sort((a, b) => a.localeCompare(b))) {
    const text = await fs.readFile(path.join(cwd, ...relativePath.split('/')), 'utf8')
    const refs = extractReferencesFromText(text)
    for (const reference of refs) {
      const line = text.slice(0, text.indexOf(reference)).split(/\r?\n/).length
      pushReference(references, {
        referencePathOrUrl: reference,
        ownerType: ownerTypeForSourceReference(relativePath, reference),
        ownerDetail: null,
        sourceFile: relativePath,
        sourceLine: line,
      })
    }
  }
}

async function buildMediaReferenceInventory({ cwd = process.cwd() } = {}) {
  const references = []
  const env = loadEnv({ cwd, baseEnv: process.env })
  const safety = evaluateDatabaseSafety(env)

  if (!safety.safeForLocalMigration) {
    throw new Error('Refusing DB media reference inventory before local DB safety passes.')
  }

  await addDatabaseReferences(references, env)
  await addSourceReferences(references, { cwd })

  const uniqueReferencePaths = new Set(references.map((reference) => reference.referencePathOrUrl))
  const summary = {
    totalReferences: references.length,
    uniqueReferencePaths: uniqueReferencePaths.size,
    remoteReferences: references.filter((reference) => reference.isRemote).length,
    localReferences: references.filter((reference) => reference.isLocal).length,
    missingLocalReferences: references.filter((reference) => reference.isLocal && reference.referencedFileExists === false).length,
    databaseReferences: references.filter((reference) => reference.ownerType.startsWith('DB ')).length,
    sourceAndSeedReferences: references.filter((reference) => !reference.ownerType.startsWith('DB ')).length,
  }

  return {
    generatedAt: new Date().toISOString(),
    dryRun: true,
    dbReadOnly: true,
    dbMutationPerformed: false,
    dbSafety: {
      databaseUrl: safety.databaseUrl,
      shadowDatabaseUrl: safety.shadowDatabaseUrl,
      shadowDatabaseSeparate: safety.shadowDatabaseSeparate,
      localMigrationReady: safety.safeForLocalMigration,
    },
    excludedFromActiveSourceConclusions: ['audit-reports/**', 'public/**', 'node_modules/**', '.next/**'],
    summary,
    references,
  }
}

function buildOrphanSummary(fileInventory, referenceInventory) {
  const referenced = new Set(
    referenceInventory.references
      .filter((reference) => reference.isLocal)
      .map((reference) => reference.referencePathOrUrl.split(/[?#]/, 1)[0]),
  )

  const existingManaged = fileInventory.files.filter((file) =>
    file.exists &&
    (file.publicUrlPath.startsWith('/uploads/admin/') ||
      file.publicUrlPath.startsWith('/uploads/products/') ||
      file.publicUrlPath.startsWith('/assets/categories/subcategories/'))
  )

  return {
    existingManagedFileCount: existingManaged.length,
    unreferencedManagedFileCount: existingManaged.filter((file) => !referenced.has(file.publicUrlPath)).length,
    referencedManagedFileCount: existingManaged.filter((file) => referenced.has(file.publicUrlPath)).length,
  }
}

export async function buildPublicMediaSourceOfTruthAudit({ cwd = process.cwd(), outDir = DEFAULT_OUT_DIR } = {}) {
  const resolvedOutDir = path.resolve(cwd, outDir)
  await fs.mkdir(resolvedOutDir, { recursive: true })

  const fileInventory = await buildMediaFileInventory({ cwd })
  const referenceInventory = await buildMediaReferenceInventory({ cwd })
  referenceInventory.orphanSummary = buildOrphanSummary(fileInventory, referenceInventory)

  const fileInventoryPath = path.join(resolvedOutDir, 'media-file-inventory.json')
  const referenceInventoryPath = path.join(resolvedOutDir, 'media-reference-inventory.json')

  await fs.writeFile(fileInventoryPath, `${JSON.stringify(fileInventory, null, 2)}\n`)
  await fs.writeFile(referenceInventoryPath, `${JSON.stringify(referenceInventory, null, 2)}\n`)

  return {
    fileInventoryPath,
    referenceInventoryPath,
    fileInventory,
    referenceInventory,
  }
}

function parseCliArgs(argv) {
  const args = {
    outDir: DEFAULT_OUT_DIR,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--out-dir') {
      args.outDir = argv[index + 1]
      index += 1
      continue
    }
    throw new Error('Unsupported public media audit option.')
  }

  return args
}

export async function runPublicMediaSourceOfTruthAuditCli({
  argv = process.argv.slice(2),
  cwd = process.cwd(),
  stdout = console.log,
} = {}) {
  const args = parseCliArgs(argv)
  const result = await buildPublicMediaSourceOfTruthAudit({ cwd, outDir: args.outDir })
  stdout(JSON.stringify({
    dryRun: true,
    deletionPerformed: false,
    dbMutationPerformed: false,
    fileInventoryPath: normalizeSlash(path.relative(cwd, result.fileInventoryPath)),
    referenceInventoryPath: normalizeSlash(path.relative(cwd, result.referenceInventoryPath)),
    fileSummary: result.fileInventory.summary,
    referenceSummary: result.referenceInventory.summary,
    orphanSummary: result.referenceInventory.orphanSummary,
  }, null, 2))
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runPublicMediaSourceOfTruthAuditCli()
    .then((status) => {
      process.exit(status)
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : 'Public media audit failed.')
      process.exit(1)
    })
}
