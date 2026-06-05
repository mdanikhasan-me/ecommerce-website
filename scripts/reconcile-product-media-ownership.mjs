import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { PrismaClient } from '@prisma/client'

import {
  evaluateDatabaseSafety,
  loadEnv,
} from './check-db-url-safety.mjs'

const CATALOG_PRODUCT_MEDIA_SOURCE = 'src/shared/product-media.ts'
const CATALOG_PUBLIC_PREFIX = '/assets/products/catalog/'
const MANAGED_PRODUCT_UPLOAD_PREFIX = '/uploads/products/'
const DEFAULT_BACKUP_PATH = 'audit-reports/290-media-filesystem-ownership-icon-reconciliation/product-media-reconciliation-backup.json'

const ALLOWED_EXTENSIONS = new Set(['avif', 'gif', 'jpg', 'jpeg', 'png', 'webp'])

function parseArgs(argv) {
  const options = {
    dryRun: true,
    apply: false,
    outPath: null,
    backupPath: DEFAULT_BACKUP_PATH,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }

    if (arg === '--apply-managed-upload-backfill') {
      options.apply = true
      options.dryRun = false
      continue
    }

    if (arg === '--out') {
      options.outPath = argv[index + 1]
      index += 1
      continue
    }

    if (arg === '--backup-out') {
      options.backupPath = argv[index + 1]
      index += 1
      continue
    }

    throw new Error('Unsupported product media reconciliation option.')
  }

  if (options.apply && !options.backupPath) {
    throw new Error('Apply mode requires a backup output path.')
  }

  return options
}

function sanitizeSegment(value, fallback = 'general') {
  const raw = String(value ?? '').trim().toLowerCase()

  if (!raw || /[\0-\x1f\x7f]/.test(raw) || raw.includes('..') || /[\\/]/.test(raw)) {
    return fallback
  }

  const sanitized = raw
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  return sanitized || fallback
}

function normalizeExtension(value, fallback = 'webp') {
  const extension = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^\.+/, '')
    .replace(/[^a-z0-9]/g, '')

  return extension && ALLOWED_EXTENSIONS.has(extension) ? extension : fallback
}

function publicUploadPathForProduct({ categorySlug, subcategorySlug, productSlug, mediaId, extension }) {
  const category = sanitizeSegment(categorySlug, 'uncategorized')
  const subcategory = sanitizeSegment(subcategorySlug, 'general')
  const product = sanitizeSegment(productSlug, 'product')
  const media = sanitizeSegment(mediaId, 'source-catalog')
  const normalizedExtension = normalizeExtension(extension)

  return `${MANAGED_PRODUCT_UPLOAD_PREFIX}${category}/${subcategory}/${product}/${media}.${normalizedExtension}`
}

function publicUrlToSourceFile(publicPath, cwd) {
  const clean = String(publicPath ?? '').split(/[?#]/, 1)[0]
  if (!clean.startsWith('/assets/')) return null
  if (clean.includes('\0') || clean.includes('..') || /[\\]/.test(clean)) return null

  const publicRoot = path.resolve(cwd, 'public')
  const resolved = path.resolve(publicRoot, clean.replace(/^\/+/, ''))

  if (resolved === publicRoot || !resolved.startsWith(`${publicRoot}${path.sep}`)) return null
  return resolved
}

function publicUrlToManagedFile(publicPath, cwd) {
  const clean = String(publicPath ?? '').split(/[?#]/, 1)[0]
  if (!clean.startsWith(MANAGED_PRODUCT_UPLOAD_PREFIX)) return null
  if (clean.includes('\0') || clean.includes('..') || /[\\]/.test(clean)) return null

  const uploadsRoot = path.resolve(cwd, 'public', 'uploads')
  const resolved = path.resolve(cwd, 'public', clean.replace(/^\/+/, ''))

  if (resolved === uploadsRoot || !resolved.startsWith(`${uploadsRoot}${path.sep}`)) return null
  return resolved
}

function parseCatalogProductMediaEntries(source) {
  const entries = new Map()
  const paths = new Map()
  const entryPattern = /\{\s*slug:\s*'(?<slug>[^']+)'[\s\S]*?categorySlug:\s*'(?<categorySlug>[^']+)'[\s\S]*?subcategorySlug:\s*'(?<subcategorySlug>[^']+)'[\s\S]*?path:\s*'(?<publicPath>\/assets\/products\/catalog\/[^']+)'[\s\S]*?\n\s*\}/g

  for (const match of source.matchAll(entryPattern)) {
    const groups = match.groups ?? {}
    const entry = {
      slug: groups.slug,
      categorySlug: groups.categorySlug,
      subcategorySlug: groups.subcategorySlug,
      publicPath: groups.publicPath,
    }
    entries.set(entry.slug, entry)
    paths.set(entry.publicPath, entry)
  }

  return { entries, paths }
}

function deriveCatalogEntryForImage({ imageUrl, productSlug, catalogBySlug, catalogByPath }) {
  if (catalogByPath.has(imageUrl)) return catalogByPath.get(imageUrl)
  if (catalogBySlug.has(productSlug)) return catalogBySlug.get(productSlug)
  return null
}

function createBaseEvidence({ safety, applyRequested }) {
  return {
    dryRun: !applyRequested,
    applyRequested,
    updatesApplied: false,
    dbSafety: {
      databaseUrl: safety.databaseUrl,
      shadowDatabaseUrl: safety.shadowDatabaseUrl,
      shadowDatabaseSeparate: safety.shadowDatabaseSeparate,
      localMigrationReady: safety.safeForLocalMigration,
    },
    localDbQueried: false,
    localDbReachable: false,
    safeAggregateOnly: true,
    privateEnvPrinted: false,
    fullDbUrlPrinted: false,
    sourceCatalogRowsFound: 0,
    nestedSourceCatalogRowsFound: 0,
    oldFlatSourceCatalogRowsFound: 0,
    alreadyManagedUploadRowsFound: 0,
    remoteOrOtherRowsFound: 0,
    missingSourceFileCount: 0,
    plannedCopyCount: 0,
    plannedUpdateCount: 0,
    copiedFileCount: 0,
    updatedRowCount: 0,
    skippedRows: {
      noCatalogEntry: 0,
      missingSourceFile: 0,
      alreadyAtTarget: 0,
    },
    stopped: false,
    stopReason: null,
    notes: [
      'Dry-run is the default.',
      'Apply mode only copies source catalog files into public/uploads/products and updates local ProductImage.url rows.',
      'The script never deletes source catalog files.',
      'Console output is aggregate-only and does not print DB URLs or private upload filenames.',
    ],
  }
}

async function loadCatalogManifest(cwd) {
  const sourcePath = path.join(cwd, CATALOG_PRODUCT_MEDIA_SOURCE)
  const source = existsSync(sourcePath) ? await fs.readFile(sourcePath, 'utf8') : ''
  return parseCatalogProductMediaEntries(source)
}

async function collectPlans({ cwd, prisma, catalogBySlug, catalogByPath, evidence }) {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      slug: true,
      category: {
        select: {
          slug: true,
          parent: {
            select: {
              slug: true,
            },
          },
        },
      },
      images: {
        select: {
          id: true,
          url: true,
          sortOrder: true,
        },
      },
    },
  })

  const plans = []

  for (const product of products) {
    for (const image of product.images) {
      const imageUrl = String(image.url ?? '')

      if (imageUrl.startsWith(MANAGED_PRODUCT_UPLOAD_PREFIX)) {
        evidence.alreadyManagedUploadRowsFound += 1
        continue
      }

      if (!imageUrl.startsWith(CATALOG_PUBLIC_PREFIX)) {
        evidence.remoteOrOtherRowsFound += 1
        continue
      }

      evidence.sourceCatalogRowsFound += 1
      if (/^\/assets\/products\/catalog\/[^/]+\.[a-z0-9]+$/i.test(imageUrl)) {
        evidence.oldFlatSourceCatalogRowsFound += 1
      } else {
        evidence.nestedSourceCatalogRowsFound += 1
      }

      const catalogEntry = deriveCatalogEntryForImage({
        imageUrl,
        productSlug: product.slug,
        catalogBySlug,
        catalogByPath,
      })

      if (!catalogEntry) {
        evidence.skippedRows.noCatalogEntry += 1
        continue
      }

      const sourceFile = publicUrlToSourceFile(catalogEntry.publicPath, cwd)
      if (!sourceFile || !existsSync(sourceFile)) {
        evidence.missingSourceFileCount += 1
        evidence.skippedRows.missingSourceFile += 1
        continue
      }

      const categorySlug = product.category?.parent?.slug ?? product.category?.slug ?? catalogEntry.categorySlug
      const subcategorySlug = product.category?.parent?.slug ? product.category?.slug : catalogEntry.subcategorySlug
      const extension = path.extname(sourceFile).replace(/^\./, '')
      const mediaId = Number.isFinite(image.sortOrder) ? `source-catalog-${image.sortOrder}` : 'source-catalog-main'
      const targetPublicUrl = publicUploadPathForProduct({
        categorySlug,
        subcategorySlug,
        productSlug: product.slug,
        mediaId,
        extension,
      })

      if (imageUrl === targetPublicUrl) {
        evidence.skippedRows.alreadyAtTarget += 1
        continue
      }

      const targetFile = publicUrlToManagedFile(targetPublicUrl, cwd)
      if (!targetFile) continue

      plans.push({
        productId: product.id,
        productImageId: image.id,
        sourcePublicUrl: catalogEntry.publicPath,
        previousPublicUrl: imageUrl,
        targetPublicUrl,
        sourceFile,
        targetFile,
      })
    }
  }

  evidence.plannedCopyCount = plans.length
  evidence.plannedUpdateCount = plans.length
  return plans
}

async function applyPlans({ plans, prisma, backupPath, cwd, evidence }) {
  const backup = {
    createdAt: new Date().toISOString(),
    safeLocalOnly: true,
    rows: plans.map((plan) => ({
      productId: plan.productId,
      productImageId: plan.productImageId,
      previousPublicUrl: plan.previousPublicUrl,
      targetPublicUrl: plan.targetPublicUrl,
      sourcePublicUrl: plan.sourcePublicUrl,
    })),
  }
  const resolvedBackupPath = path.resolve(cwd, backupPath)
  await fs.mkdir(path.dirname(resolvedBackupPath), { recursive: true })
  await fs.writeFile(resolvedBackupPath, `${JSON.stringify(backup, null, 2)}\n`)

  for (const plan of plans) {
    await fs.mkdir(path.dirname(plan.targetFile), { recursive: true })
    await fs.copyFile(plan.sourceFile, plan.targetFile)
    evidence.copiedFileCount += 1
    await prisma.productImage.update({
      where: { id: plan.productImageId },
      data: { url: plan.targetPublicUrl },
    })
    evidence.updatedRowCount += 1
  }

  evidence.updatesApplied = true
}

export async function collectProductMediaOwnershipReconciliation({
  cwd = process.cwd(),
  argv = ['--dry-run'],
} = {}) {
  const options = parseArgs(argv)
  const env = loadEnv({ cwd })
  const safety = evaluateDatabaseSafety(env)
  const evidence = createBaseEvidence({ safety, applyRequested: options.apply })

  if (!safety.safeForLocalMigration) {
    evidence.stopped = true
    evidence.stopReason = 'DATABASE_URL and SHADOW_DATABASE_URL must both be local and separate before DB reconciliation.'
    return { evidence, options }
  }

  process.env.DATABASE_URL = env.DATABASE_URL
  process.env.SHADOW_DATABASE_URL = env.SHADOW_DATABASE_URL

  const { entries: catalogBySlug, paths: catalogByPath } = await loadCatalogManifest(cwd)
  const prisma = new PrismaClient()

  try {
    evidence.localDbQueried = true
    const plans = await collectPlans({ cwd, prisma, catalogBySlug, catalogByPath, evidence })
    evidence.localDbReachable = true

    if (options.apply) {
      await applyPlans({
        plans,
        prisma,
        backupPath: options.backupPath,
        cwd,
        evidence,
      })
    }
  } catch (error) {
    evidence.stopped = true
    evidence.stopReason = 'Local database was not reachable or reconciliation query failed before any aggregate DB update evidence could be completed.'
    if (options.apply) throw error
  } finally {
    await prisma.$disconnect().catch(() => undefined)
  }

  return { evidence, options }
}

export function formatProductMediaOwnershipReconciliation(evidence) {
  return JSON.stringify(evidence, null, 2)
}

export async function runProductMediaOwnershipReconciliationCli({
  argv = process.argv.slice(2),
  cwd = process.cwd(),
  stdout = console.log,
  stderr = console.error,
} = {}) {
  let result
  try {
    result = await collectProductMediaOwnershipReconciliation({ cwd, argv })
  } catch (error) {
    stderr(error?.message ?? 'Product media ownership reconciliation failed.')
    return 1
  }

  const formatted = formatProductMediaOwnershipReconciliation(result.evidence)

  if (result.options.outPath) {
    const resolvedOutPath = path.resolve(cwd, result.options.outPath)
    await fs.mkdir(path.dirname(resolvedOutPath), { recursive: true })
    await fs.writeFile(resolvedOutPath, `${formatted}\n`)
  } else {
    stdout(formatted)
  }

  if (result.options.apply && result.evidence.stopped) return 1
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runProductMediaOwnershipReconciliationCli()
    .then((status) => {
      process.exit(status)
    })
    .catch(() => {
      console.error('Product media ownership reconciliation failed before aggregate output was produced.')
      process.exit(1)
    })
}
