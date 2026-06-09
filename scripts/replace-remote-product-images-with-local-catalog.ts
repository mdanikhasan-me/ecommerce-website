import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { PrismaClient } from '@prisma/client'

import {
  buildProductImageLocalizationPlan,
  type LocalCatalogProductImage,
  type ProductImageLocalizationPlanRow,
} from '@/backend/catalog/product-local-image-replacement'
import { CATALOG_PRODUCT_MEDIA } from '@/shared/product-media'
import {
  evaluateDatabaseSafety,
  loadEnv,
} from './check-db-url-safety.mjs'

const DEFAULT_PLAN_OUT = '../boilabin-audit-archive/audit-reports/306-product-local-image-replacement/product-image-localization-plan.json'
const DEFAULT_EVIDENCE_OUT = '../boilabin-audit-archive/audit-reports/306-product-local-image-replacement/product-image-localization-apply-evidence.json'
const CATALOG_ROOT = path.join('public', 'assets', 'products', 'catalog')
const IMAGE_EXTENSION_PATTERN = /\.(?:avif|gif|jpe?g|png|webp)$/i

type CliOptions = {
  apply: boolean
  planIn: string | null
  planOut: string
  evidenceOut: string
}

type DbSafetyResult = {
  databaseUrl: string
  shadowDatabaseUrl: string
  shadowDatabaseSeparate: boolean
  safeForLocalMigration: boolean
}

type LoadedProduct = {
  productName: string
  sku: string
  slug: string
  images: Array<{
    id: string
    url: string
    alt: string | null
    isPrimary: boolean
    sortOrder: number
  }>
}

type ReplacementPlanReport = {
  step: number
  generatedAt: string
  script: string
  dbSafety: {
    databaseUrl: string
    shadowDatabaseUrl: string
    shadowDatabaseSeparate: boolean
    localMigrationReady: boolean
  }
  localDbQueried: boolean
  dbMutationPerformed: boolean
  fullDbUrlPrinted: boolean
  privateEnvPrinted: boolean
  localCatalogInventory: Array<LocalCatalogProductImage & { bytes: number }>
  summary: {
    productCount: number
    productImageRowCount: number
    localCatalogAssetCount: number
    remoteReplacementCount: number
    ambiguousCount: number
    missingLocalMatchCount: number
    alreadyLocalCount: number
  }
  replacementPlan: ReturnType<typeof buildProductImageLocalizationPlan>
  replacements: ProductImageLocalizationPlanRow[]
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    apply: false,
    planIn: null,
    planOut: DEFAULT_PLAN_OUT,
    evidenceOut: DEFAULT_EVIDENCE_OUT,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--apply') {
      options.apply = true
      continue
    }

    if (arg === '--plan-in') {
      options.planIn = argv[index + 1] ?? null
      index += 1
      continue
    }

    if (arg === '--plan-out') {
      options.planOut = argv[index + 1] ?? options.planOut
      index += 1
      continue
    }

    if (arg === '--evidence-out') {
      options.evidenceOut = argv[index + 1] ?? options.evidenceOut
      index += 1
      continue
    }

    throw new Error('Unsupported product local image replacement option.')
  }

  if (options.apply && !options.planIn) {
    throw new Error('Apply mode requires --plan-in so a saved replacement plan exists before mutation.')
  }

  return options
}

function normalizePublicPath(filePath: string, cwd: string) {
  return `/${path.relative(path.join(cwd, 'public'), filePath).replace(/\\/g, '/')}`
}

function walkFiles(dir: string): string[] {
  if (!existsSync(dir)) return []

  const files: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...walkFiles(fullPath))
    else files.push(fullPath)
  }
  return files
}

function isGitTracked(cwd: string, filePath: string) {
  const relativePath = path.relative(cwd, filePath).replace(/\\/g, '/')

  try {
    execFileSync('git', ['ls-files', '--error-unmatch', relativePath], {
      cwd,
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

function collectLocalCatalogInventory(cwd: string): Array<LocalCatalogProductImage & { bytes: number }> {
  const root = path.join(cwd, CATALOG_ROOT)
  const manifestSlugs = new Set<string>(CATALOG_PRODUCT_MEDIA.map((entry) => entry.slug))
  const manifestPaths = new Set<string>(CATALOG_PRODUCT_MEDIA.map((entry) => entry.path))

  return walkFiles(root)
    .filter((filePath) => IMAGE_EXTENSION_PATTERN.test(filePath))
    .map((filePath) => {
      const publicUrl = normalizePublicPath(filePath, cwd)
      const productSlug = publicUrl.split('/').at(-2) ?? ''

      return {
        productSlug,
        publicUrl,
        fileName: path.basename(filePath),
        extension: path.extname(filePath).toLowerCase(),
        bytes: statSync(filePath).size,
        fileExists: true,
        sourceControlled: manifestPaths.has(publicUrl),
        gitTracked: isGitTracked(cwd, filePath),
        mapsCleanlyToProductSlug: manifestSlugs.has(productSlug),
      }
    })
    .sort((a, b) => a.publicUrl.localeCompare(b.publicUrl))
}

async function loadProducts(prisma: PrismaClient): Promise<LoadedProduct[]> {
  const products = await prisma.product.findMany({
    orderBy: { slug: 'asc' },
    select: {
      sku: true,
      name: true,
      slug: true,
      images: {
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          url: true,
          alt: true,
          isPrimary: true,
          sortOrder: true,
        },
      },
    },
  })

  return products.map((product) => ({
    productName: product.name,
    sku: product.sku,
    slug: product.slug,
    images: product.images,
  }))
}

function publicUrlExists(cwd: string, publicUrl: string | null) {
  if (!publicUrl?.startsWith('/assets/products/catalog/')) return false
  if (publicUrl.includes('\0') || publicUrl.includes('..') || /[\\?#]/.test(publicUrl)) return false

  const publicRoot = path.resolve(cwd, 'public')
  const filePath = path.resolve(publicRoot, publicUrl.replace(/^\/+/, ''))
  return filePath.startsWith(`${publicRoot}${path.sep}`) && existsSync(filePath)
}

function createReport({
  safety,
  localCatalogInventory,
  plan,
  dbMutationPerformed,
}: {
  safety: DbSafetyResult
  localCatalogInventory: Array<LocalCatalogProductImage & { bytes: number }>
  plan: ReturnType<typeof buildProductImageLocalizationPlan>
  dbMutationPerformed: boolean
}): ReplacementPlanReport {
  return {
    step: 306,
    generatedAt: plan.generatedAt,
    script: 'scripts/replace-remote-product-images-with-local-catalog.ts',
    dbSafety: {
      databaseUrl: safety.databaseUrl,
      shadowDatabaseUrl: safety.shadowDatabaseUrl,
      shadowDatabaseSeparate: safety.shadowDatabaseSeparate,
      localMigrationReady: safety.safeForLocalMigration,
    },
    localDbQueried: true,
    dbMutationPerformed,
    fullDbUrlPrinted: false,
    privateEnvPrinted: false,
    localCatalogInventory,
    summary: {
      productCount: plan.productCount,
      productImageRowCount: plan.productImageRowCount,
      localCatalogAssetCount: plan.localCatalogAssetCount,
      remoteReplacementCount: plan.replacementCount,
      ambiguousCount: plan.ambiguousCount,
      missingLocalMatchCount: plan.missingLocalMatchCount,
      alreadyLocalCount: plan.alreadyLocalCount,
    },
    replacementPlan: plan,
    replacements: plan.replacements,
  }
}

async function writeJson(outPath: string, data: unknown, cwd: string) {
  const resolved = path.resolve(cwd, outPath)
  await fs.mkdir(path.dirname(resolved), { recursive: true })
  await fs.writeFile(resolved, `${JSON.stringify(data, null, 2)}\n`)
  return resolved
}

async function createPlan({
  cwd,
  safety,
  prisma,
  outPath,
}: {
  cwd: string
  safety: DbSafetyResult
  prisma: PrismaClient
  outPath: string
}) {
  const localCatalogInventory = collectLocalCatalogInventory(cwd)
  const products = await loadProducts(prisma)
  const plan = buildProductImageLocalizationPlan({
    products,
    localCatalogImages: localCatalogInventory,
  })
  const report = createReport({
    safety,
    localCatalogInventory,
    plan,
    dbMutationPerformed: false,
  })

  await writeJson(outPath, report, cwd)
  return report
}

async function applyPlan({
  cwd,
  safety,
  prisma,
  planPath,
  evidenceOut,
}: {
  cwd: string
  safety: DbSafetyResult
  prisma: PrismaClient
  planPath: string
  evidenceOut: string
}) {
  const resolvedPlanPath = path.resolve(cwd, planPath)
  const report = JSON.parse(readFileSync(resolvedPlanPath, 'utf8')) as ReplacementPlanReport
  const replacements = Array.isArray(report.replacements) ? report.replacements : []
  const evidence: {
    step: number
    generatedAt: string
    script: string
    planPath: string
    dbSafety: ReplacementPlanReport['dbSafety']
    dbMutationPerformed: boolean
    attemptedReplacementCount: number
    updatedRowCount: number
    skippedRows: Array<{ imageId: string; slug: string; reason: string }>
    beforeAfter: Array<{
      productName: string
      sku: string
      slug: string
      imageId: string
      beforeUrl: string
      afterUrl: string
      altPreserved: string | null
      isPrimaryPreserved: boolean
      sortOrderPreserved: number
    }>
    remainingRemoteProductImageCount: number | null
    sampleBeforeAfter: unknown
    fullDbUrlPrinted: boolean
    privateEnvPrinted: boolean
  } = {
    step: 306,
    generatedAt: new Date().toISOString(),
    script: 'scripts/replace-remote-product-images-with-local-catalog.ts',
    planPath: path.relative(cwd, resolvedPlanPath).replace(/\\/g, '/'),
    dbSafety: {
      databaseUrl: safety.databaseUrl,
      shadowDatabaseUrl: safety.shadowDatabaseUrl,
      shadowDatabaseSeparate: safety.shadowDatabaseSeparate,
      localMigrationReady: safety.safeForLocalMigration,
    },
    dbMutationPerformed: false,
    attemptedReplacementCount: replacements.length,
    updatedRowCount: 0,
    skippedRows: [],
    beforeAfter: [],
    remainingRemoteProductImageCount: null,
    sampleBeforeAfter: null,
    fullDbUrlPrinted: false,
    privateEnvPrinted: false,
  }

  for (const replacement of replacements) {
    if (!replacement.proposedReplacementUrl || !publicUrlExists(cwd, replacement.proposedReplacementUrl)) {
      evidence.skippedRows.push({
        imageId: replacement.imageId,
        slug: replacement.slug,
        reason: 'Proposed replacement local catalog file is missing or unsafe.',
      })
      continue
    }

    const current = await prisma.productImage.findUnique({
      where: { id: replacement.imageId },
      select: {
        id: true,
        url: true,
        alt: true,
        isPrimary: true,
        sortOrder: true,
        product: { select: { name: true, sku: true, slug: true } },
      },
    })

    if (!current || current.url !== replacement.currentUrl || current.product.slug !== replacement.slug) {
      evidence.skippedRows.push({
        imageId: replacement.imageId,
        slug: replacement.slug,
        reason: 'Current DB row no longer matches the saved replacement plan.',
      })
      continue
    }

    await prisma.productImage.update({
      where: { id: replacement.imageId },
      data: { url: replacement.proposedReplacementUrl },
    })

    evidence.dbMutationPerformed = true
    evidence.updatedRowCount += 1
    evidence.beforeAfter.push({
      productName: current.product.name,
      sku: current.product.sku,
      slug: current.product.slug,
      imageId: current.id,
      beforeUrl: current.url,
      afterUrl: replacement.proposedReplacementUrl,
      altPreserved: current.alt,
      isPrimaryPreserved: current.isPrimary,
      sortOrderPreserved: current.sortOrder,
    })
  }

  evidence.remainingRemoteProductImageCount = await prisma.productImage.count({
    where: {
      OR: [
        { url: { startsWith: 'https://images.unsplash.com' } },
        { url: { startsWith: 'http://images.unsplash.com' } },
      ],
    },
  })
  evidence.sampleBeforeAfter = evidence.beforeAfter[0] ?? null

  await writeJson(evidenceOut, evidence, cwd)
  return evidence
}

export async function runProductLocalImageReplacementCli({
  argv = process.argv.slice(2),
  cwd = process.cwd(),
  stdout = console.log,
  stderr = console.error,
}: {
  argv?: string[]
  cwd?: string
  stdout?: (text: string) => void
  stderr?: (text: string) => void
} = {}) {
  let options: CliOptions
  try {
    options = parseArgs(argv)
  } catch (error) {
    stderr(error instanceof Error ? error.message : 'Invalid product local image replacement options.')
    return 1
  }

  const env = loadEnv({ cwd })
  const safety = evaluateDatabaseSafety(env) as DbSafetyResult
  if (!safety.safeForLocalMigration) {
    stderr('Local DB safety check failed. Product image replacement did not query or mutate the database.')
    return 1
  }

  process.env.DATABASE_URL = env.DATABASE_URL
  process.env.SHADOW_DATABASE_URL = env.SHADOW_DATABASE_URL

  const prisma = new PrismaClient()
  try {
    if (options.apply) {
      const evidence = await applyPlan({
        cwd,
        safety,
        prisma,
        planPath: options.planIn!,
        evidenceOut: options.evidenceOut,
      })
      stdout(JSON.stringify({
        applied: evidence.dbMutationPerformed,
        updatedRowCount: evidence.updatedRowCount,
        skippedRowCount: evidence.skippedRows.length,
        remainingRemoteProductImageCount: evidence.remainingRemoteProductImageCount,
      }, null, 2))
      return evidence.skippedRows.length > 0 ? 1 : 0
    }

    const report = await createPlan({
      cwd,
      safety,
      prisma,
      outPath: options.planOut,
    })
    stdout(JSON.stringify({
      planOut: options.planOut,
      remoteReplacementCount: report.summary.remoteReplacementCount,
      ambiguousCount: report.summary.ambiguousCount,
      missingLocalMatchCount: report.summary.missingLocalMatchCount,
      dbMutationPerformed: report.dbMutationPerformed,
    }, null, 2))
    return 0
  } catch (error) {
    stderr(error instanceof Error ? error.message : 'Product local image replacement failed.')
    return 1
  } finally {
    await prisma.$disconnect().catch(() => undefined)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runProductLocalImageReplacementCli()
    .then((status) => {
      process.exit(status)
    })
    .catch(() => {
      console.error('Product local image replacement failed before safe output was produced.')
      process.exit(1)
    })
}
