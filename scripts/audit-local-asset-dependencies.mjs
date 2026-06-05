import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const DEFAULT_SCAN_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.scss',
  '.md',
  '.json',
  '.prisma',
])

const DEFAULT_SKIP_DIRS = new Set([
  '.git',
  '.next',
  '.turbo',
  '.vercel',
  'audit-reports',
  'coverage',
  'dist',
  'build',
  'node_modules',
])

const SOURCE_ASSET_PREFIXES = ['/assets/', '/images/']
const MANAGED_UPLOAD_PREFIXES = ['/uploads/admin/', '/uploads/products/']
export const PRODUCT_SOURCE_ASSET_PREFIX = '/assets/products/'
export const PRODUCT_SOURCE_PUBLIC_ROOT = 'public/assets/products'
export const ICON_SOURCE_PUBLIC_ROOT = 'public/assets/icons'
const REQUIRED_UI_ICON_FILES = [
  'arrow-right.svg',
  'cart.svg',
  'chevron-down.svg',
  'chevron-up.svg',
  'close.svg',
  'compare.svg',
  'eye.svg',
  'filter.svg',
  'grid.svg',
  'heart.svg',
  'location.svg',
  'mail.svg',
  'menu.svg',
  'minus.svg',
  'package.svg',
  'phone.svg',
  'plus.svg',
  'search.svg',
  'share.svg',
  'star-filled.svg',
  'star.svg',
  'user.svg',
]
const REQUIRED_SOCIAL_ICON_FILES = [
  'facebook.svg',
  'instagram.svg',
  'youtube.svg',
]
const KNOWN_REMOTE_IMAGE_HOSTS = new Set([
  'images.unsplash.com',
  'images.pexels.com',
  'placehold.co',
  'uploadthing.com',
  'utfs.io',
  'lh3.googleusercontent.com',
])
const IMAGE_EXTENSION_PATTERN = /\.(?:svg|png|jpe?g|webp|gif|avif)(?:[?#][^'"`\s)]*)?$/i
const MEDIA_REFERENCE_PATTERN =
  /(?<quote>['"`])(?<value>(?:https?:\/\/|data:image\/|\/(?:assets|images|uploads)\/|public\/(?:assets|images|uploads)\/)[^'"`\s<>]*)\k<quote>|url\(\s*(?<urlquote>['"]?)(?<urlvalue>(?:https?:\/\/|data:image\/|\/(?:assets|images|uploads)\/|public\/(?:assets|images|uploads)\/)[^'")\s<>]+)\k<urlquote>\s*\)/gi

function normalizeRelativePath(value) {
  return value.split(path.sep).join('/')
}

function shouldSkipDir(name) {
  return DEFAULT_SKIP_DIRS.has(name)
}

function shouldScanFile(filePath) {
  return DEFAULT_SCAN_EXTENSIONS.has(path.extname(filePath).toLowerCase())
}

async function walkFiles(root, options = {}) {
  const files = []

  async function visit(directory) {
    let entries
    try {
      entries = await fs.readdir(directory, { withFileTypes: true })
    } catch (error) {
      if (error?.code === 'ENOENT') return
      throw error
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (shouldSkipDir(entry.name)) continue
        const next = path.join(directory, entry.name)
        const relative = normalizeRelativePath(path.relative(root, next))
        if (options.skipRelativeDir?.(relative)) continue
        await visit(next)
        continue
      }

      if (!entry.isFile()) continue
      const filePath = path.join(directory, entry.name)
      if (options.includeFile?.(filePath) === false) continue
      files.push(filePath)
    }
  }

  await visit(root)
  return files
}

function isRemoteMediaUrl(value) {
  try {
    const parsed = new URL(value)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    if (IMAGE_EXTENSION_PATTERN.test(parsed.pathname)) return true
    return KNOWN_REMOTE_IMAGE_HOSTS.has(parsed.hostname.toLowerCase())
  } catch {
    return false
  }
}

function isRemoteImageProviderConfigContext(relativeFile) {
  return (
    relativeFile === 'next.config.js' ||
    relativeFile === 'next.config.mjs' ||
    relativeFile === 'src/backend/security/csp.ts' ||
    relativeFile === 'src/app/layout.tsx'
  )
}

function isCatalogOrSeedContext(relativeFile) {
  return (
    relativeFile === 'prisma/seed.ts' ||
    relativeFile.includes('category-media') ||
    relativeFile.includes('storefront-media') ||
    relativeFile.includes('repair-storefront') ||
    relativeFile.includes('repair-known-broken-image-urls') ||
    relativeFile.includes('product') ||
    relativeFile.includes('category') ||
    relativeFile.includes('banner')
  )
}

function isIgnoredForStaticUiRisk(relativeFile) {
  return (
    relativeFile.startsWith('docs/') ||
    relativeFile.startsWith('.agents/') ||
    relativeFile.startsWith('public/') ||
    relativeFile.startsWith('audit-reports/') ||
    relativeFile.startsWith('tests/') ||
    relativeFile.startsWith('scripts/') ||
    relativeFile.startsWith('prisma/')
  )
}

export function classifyAssetReference(value, relativeFile = '') {
  const reference = String(value ?? '').trim()

  if (!reference) return 'unknown'

  if (reference.startsWith('data:image/')) return 'data-url'

  if (
    SOURCE_ASSET_PREFIXES.some((prefix) => reference.startsWith(prefix)) ||
    reference.startsWith('public/assets/') ||
    reference.startsWith('public/images/')
  ) {
    return 'local-source-asset'
  }

  if (
    MANAGED_UPLOAD_PREFIXES.some((prefix) => reference.startsWith(prefix)) ||
    reference.startsWith('public/uploads/')
  ) {
    return 'local-managed-upload'
  }

  if (/^https?:\/\//i.test(reference)) {
    if (!isRemoteMediaUrl(reference)) return 'remote-non-media-link'
    if (isRemoteImageProviderConfigContext(relativeFile)) return 'remote-allowed-provider-cdn'
    if (isCatalogOrSeedContext(relativeFile)) return 'remote-product-catalog-media'
    if (!isIgnoredForStaticUiRisk(relativeFile)) return 'remote-static-ui-asset'
    return 'remote-product-catalog-media'
  }

  return 'unknown'
}

function collectMediaReferences(content, relativeFile) {
  const references = []

  for (const match of content.matchAll(MEDIA_REFERENCE_PATTERN)) {
    const value = match.groups?.value ?? match.groups?.urlvalue
    if (!value) continue
    references.push({
      classification: classifyAssetReference(value, relativeFile),
      value,
    })
  }

  return references
}

function resolveLocalSourceAssetPath(reference, root) {
  const value = String(reference ?? '').trim().split(/[?#]/, 1)[0]
  if (!value) return null
  if (value.endsWith('/')) return null
  if (value.includes('${')) return null

  const publicRelative = value.startsWith('public/')
    ? value
    : value.startsWith('/assets/') || value.startsWith('/images/')
      ? `public${value}`
      : null

  if (!publicRelative) return null

  const publicRoot = path.resolve(root, 'public')
  const resolved = path.resolve(root, publicRelative)
  if (resolved === publicRoot || !resolved.startsWith(`${publicRoot}${path.sep}`)) return null
  return resolved
}

function localSourceAssetExists(reference, root) {
  const value = String(reference ?? '').trim().split(/[?#]/, 1)[0]
  if (value.endsWith('/')) return true
  if (value.includes('${')) return true

  const resolved = resolveLocalSourceAssetPath(reference, root)
  return Boolean(resolved && existsSync(resolved))
}

function countLucideIconImports(content) {
  let importCount = 0
  let iconCount = 0

  const importPattern = /import\s*\{([\s\S]*?)\}\s*from\s*['"]lucide-react['"]/g
  for (const match of content.matchAll(importPattern)) {
    importCount += 1
    iconCount += match[1]
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean).length
  }

  return { importCount, iconCount }
}

function createReferenceSummary() {
  return {
    localSourceAsset: 0,
    localManagedUpload: 0,
    bundledIconImportFiles: 0,
    bundledIconImportCount: 0,
    inlineSvgOccurrences: 0,
    dataUrl: 0,
    remoteNonMediaLink: 0,
    remoteAllowedProviderCdn: 0,
    remoteProductCatalogMedia: 0,
    remoteStaticUiAsset: 0,
    unknown: 0,
  }
}

function increment(summary, key, by = 1) {
  summary[key] = (summary[key] ?? 0) + by
}

async function collectPublicInventory(root) {
  const inventory = {}

  for (const relativeRoot of ['public/assets', 'public/images', 'public/uploads']) {
    const absoluteRoot = path.join(root, relativeRoot)
    const label = relativeRoot.replace(/^public\//, '')
    const summary = {
      exists: false,
      fileCount: 0,
      totalBytes: 0,
      extensionCounts: {},
    }

    if (!existsSync(absoluteRoot)) {
      inventory[label] = summary
      continue
    }

    summary.exists = true
    const files = await walkFiles(absoluteRoot)
    for (const filePath of files) {
      const stats = await fs.stat(filePath)
      const extension = path.extname(filePath).toLowerCase() || '[none]'
      summary.fileCount += 1
      summary.totalBytes += stats.size
      summary.extensionCounts[extension] = (summary.extensionCounts[extension] ?? 0) + 1
    }

    inventory[label] = summary
  }

  return inventory
}

async function collectProductSourceAssetInventory(root) {
  const absoluteRoot = path.join(root, PRODUCT_SOURCE_PUBLIC_ROOT)
  const catalogRoot = path.join(absoluteRoot, 'catalog')
  const summary = {
    exists: false,
    fileCount: 0,
    totalBytes: 0,
    extensionCounts: {},
    catalogRoot: `${PRODUCT_SOURCE_PUBLIC_ROOT}/catalog`,
    categoryFolderCount: 0,
    subcategoryFolderCount: 0,
    productFolderCount: 0,
    categoryFolders: [],
  }

  if (!existsSync(absoluteRoot)) return summary

  summary.exists = true
  const categoryFolders = new Set()
  const subcategoryFolders = new Set()
  const productFolders = new Set()

  if (existsSync(catalogRoot)) {
    const entries = await fs.readdir(catalogRoot, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) categoryFolders.add(entry.name)
    }
  }

  const files = await walkFiles(absoluteRoot)

  for (const filePath of files) {
    const stats = await fs.stat(filePath)
    const extension = path.extname(filePath).toLowerCase() || '[none]'
    const isCatalogFile = filePath.startsWith(`${catalogRoot}${path.sep}`)
    const relative = isCatalogFile ? normalizeRelativePath(path.relative(catalogRoot, filePath)) : ''
    const parts = relative ? relative.split('/') : []

    summary.fileCount += 1
    summary.totalBytes += stats.size
    summary.extensionCounts[extension] = (summary.extensionCounts[extension] ?? 0) + 1
    if (isCatalogFile && parts.length >= 4) {
      categoryFolders.add(parts[0])
      subcategoryFolders.add(`${parts[0]}/${parts[1]}`)
      productFolders.add(`${parts[0]}/${parts[1]}/${parts[2]}`)
    }
  }

  summary.categoryFolderCount = categoryFolders.size
  summary.subcategoryFolderCount = subcategoryFolders.size
  summary.productFolderCount = productFolders.size
  summary.categoryFolders = [...categoryFolders].sort()

  return summary
}

async function collectPhysicalIconInventory(root) {
  const iconRoot = path.join(root, ICON_SOURCE_PUBLIC_ROOT)
  const uiRoot = path.join(iconRoot, 'ui')
  const socialRoot = path.join(iconRoot, 'social')

  async function collect(rootPath, requiredFiles) {
    const summary = {
      exists: existsSync(rootPath),
      fileCount: 0,
      requiredFileCount: requiredFiles.length,
      missingRequiredFiles: [],
    }

    if (summary.exists) {
      const files = await walkFiles(rootPath)
      summary.fileCount = files.filter((filePath) => path.extname(filePath).toLowerCase() === '.svg').length
    }

    summary.missingRequiredFiles = requiredFiles.filter((fileName) => !existsSync(path.join(rootPath, fileName)))
    return summary
  }

  const ui = await collect(uiRoot, REQUIRED_UI_ICON_FILES)
  const social = await collect(socialRoot, REQUIRED_SOCIAL_ICON_FILES)

  return {
    exists: existsSync(iconRoot),
    root: ICON_SOURCE_PUBLIC_ROOT,
    ui,
    social,
    requiredIconCount: ui.requiredFileCount + social.requiredFileCount,
    requiredMissingIconCount: ui.missingRequiredFiles.length + social.missingRequiredFiles.length,
    physicalIconFileCount: ui.fileCount + social.fileCount,
  }
}

function collectProductSeedEntries(seedText) {
  const productsBlock = seedText.match(/const productsData:[\s\S]*?= \[([\s\S]*?)\n  \]/)?.[1]
  if (!productsBlock) return []

  const products = []
  const productPattern = /\{[\s\S]*?sku:[\s\S]*?\n    \}/g
  for (const match of productsBlock.matchAll(productPattern)) {
    const block = match[0]
    const slug = block.match(/slug:\s*'([^']+)'/)?.[1]
    const imageUrl = block.match(/imageUrl:\s*'([^']+)'/)?.[1]
    if (slug && imageUrl) products.push({ slug, imageUrl })
  }

  return products
}

async function collectProductSeedMediaSummary(root) {
  const summary = {
    productSeedProductCount: 0,
    productSeedLocalProductSourceAssetCount: 0,
    productSeedLocalManagedUploadCount: 0,
    productSeedLocalNonProductSourceAssetCount: 0,
    productSeedRemoteCatalogMediaCount: 0,
    productSeedMissingLocalSourceAssetCount: 0,
    productSeedUnknownMediaCount: 0,
    productSeedOwnerReviewNeededCount: 0,
  }

  let seedText = ''
  try {
    seedText = await fs.readFile(path.join(root, 'prisma', 'seed.ts'), 'utf8')
  } catch (error) {
    if (error?.code === 'ENOENT') return summary
    throw error
  }

  const products = collectProductSeedEntries(seedText)
  summary.productSeedProductCount = products.length

  let ownerReviewNeededSlugs = new Set()
  try {
    const productMediaSource = await fs.readFile(path.join(root, 'src', 'shared', 'product-media.ts'), 'utf8')
    const entries = productMediaSource.match(/\{[\s\S]*?slug:\s*'[^']+'[\s\S]*?\n  \}/g) ?? []
    ownerReviewNeededSlugs = new Set(
      entries
        .filter((entry) => /ownerReviewNeeded:\s*true/.test(entry))
        .map((entry) => entry.match(/slug:\s*'([^']+)'/)?.[1])
        .filter(Boolean),
    )
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }

  for (const product of products) {
    const imageUrl = product.imageUrl
    if (ownerReviewNeededSlugs.has(product.slug)) {
      summary.productSeedOwnerReviewNeededCount += 1
    }

    if (imageUrl.startsWith(PRODUCT_SOURCE_ASSET_PREFIX)) {
      summary.productSeedLocalProductSourceAssetCount += 1
      if (!localSourceAssetExists(imageUrl, root)) {
        summary.productSeedMissingLocalSourceAssetCount += 1
      }
      continue
    }

    if (MANAGED_UPLOAD_PREFIXES.some((prefix) => imageUrl.startsWith(prefix))) {
      summary.productSeedLocalManagedUploadCount += 1
      continue
    }

    if (SOURCE_ASSET_PREFIXES.some((prefix) => imageUrl.startsWith(prefix))) {
      summary.productSeedLocalNonProductSourceAssetCount += 1
      if (!localSourceAssetExists(imageUrl, root)) {
        summary.productSeedMissingLocalSourceAssetCount += 1
      }
      continue
    }

    if (/^https?:\/\//i.test(imageUrl)) {
      summary.productSeedRemoteCatalogMediaCount += 1
      continue
    }

    summary.productSeedUnknownMediaCount += 1
  }

  return summary
}

async function collectPaymentAssetConfigStatus(root) {
  const assetSourcePath = path.join(root, 'src', 'shared', 'assets.ts')
  let assetSource = ''

  try {
    assetSource = await fs.readFile(assetSourcePath, 'utf8')
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }

  const stripeAssetDeclared = /\bSTRIPE\s*:\s*\{/.test(assetSource)
  const stripeMissingAssetPathDeclared = /\/assets\/payments\/stripe\.svg/.test(assetSource)

  return {
    stripeAssetDeclared,
    stripeMissingAssetPathDeclared,
    stripeMissingAssetDecision: stripeAssetDeclared || stripeMissingAssetPathDeclared
      ? 'stripe-asset-reference-still-declared'
      : 'unused-stripe-asset-reference-removed-until-payment-provider-approval',
    paymentBehaviorChanged: false,
  }
}

export async function collectLocalAssetDependencyAudit({
  cwd = process.cwd(),
} = {}) {
  const root = path.resolve(cwd)
  const files = await walkFiles(root, {
    skipRelativeDir(relativeDir) {
      return relativeDir === 'public/uploads'
    },
    includeFile(filePath) {
      return shouldScanFile(filePath)
    },
  })

  const summary = createReferenceSummary()
  const filesWithRemoteStaticUiAssets = new Set()
  const filesWithRemoteCatalogMedia = new Set()
  const filesWithManagedUploadReferences = new Set()
  const filesWithSourceAssetReferences = new Set()
  const filesWithMissingSourceAssetReferences = new Set()
  let missingLocalSourceAssetReferences = 0

  for (const filePath of files) {
    const relativeFile = normalizeRelativePath(path.relative(root, filePath))
    const content = await fs.readFile(filePath, 'utf8')
    const references = collectMediaReferences(content, relativeFile)
    const lucide = countLucideIconImports(content)

    if (lucide.importCount > 0) {
      increment(summary, 'bundledIconImportFiles')
      increment(summary, 'bundledIconImportCount', lucide.iconCount)
    }

    const inlineSvgCount = (content.match(/<svg[\s>]/g) ?? []).length
    increment(summary, 'inlineSvgOccurrences', inlineSvgCount)

    for (const reference of references) {
      switch (reference.classification) {
        case 'local-source-asset':
          increment(summary, 'localSourceAsset')
          filesWithSourceAssetReferences.add(relativeFile)
          if (
            !isIgnoredForStaticUiRisk(relativeFile) &&
            !localSourceAssetExists(reference.value, root)
          ) {
            missingLocalSourceAssetReferences += 1
            filesWithMissingSourceAssetReferences.add(relativeFile)
          }
          break
        case 'local-managed-upload':
          increment(summary, 'localManagedUpload')
          filesWithManagedUploadReferences.add(relativeFile)
          break
        case 'data-url':
          increment(summary, 'dataUrl')
          break
        case 'remote-non-media-link':
          increment(summary, 'remoteNonMediaLink')
          break
        case 'remote-allowed-provider-cdn':
          increment(summary, 'remoteAllowedProviderCdn')
          break
        case 'remote-product-catalog-media':
          increment(summary, 'remoteProductCatalogMedia')
          filesWithRemoteCatalogMedia.add(relativeFile)
          break
        case 'remote-static-ui-asset':
          increment(summary, 'remoteStaticUiAsset')
          filesWithRemoteStaticUiAssets.add(relativeFile)
          break
        default:
          increment(summary, 'unknown')
      }
    }
  }

  return {
    scannedFileCount: files.length,
    summary,
    publicInventory: await collectPublicInventory(root),
    productSourceAssetFolder: await collectProductSourceAssetInventory(root),
    physicalIconAssets: await collectPhysicalIconInventory(root),
    productSeedMedia: await collectProductSeedMediaSummary(root),
    paymentAssetConfig: await collectPaymentAssetConfigStatus(root),
    safeAggregateOnly: true,
    privateEnvRead: false,
    deletionPerformed: false,
    realMediaFilesDeleted: false,
    remoteStaticUiAssetRisk: summary.remoteStaticUiAsset > 0,
    remoteStaticUiAssetFiles: [...filesWithRemoteStaticUiAssets].sort(),
    remoteProductCatalogMediaFiles: [...filesWithRemoteCatalogMedia].sort(),
    managedUploadReferenceFiles: [...filesWithManagedUploadReferences].sort(),
    sourceAssetReferenceFiles: [...filesWithSourceAssetReferences].sort(),
    missingLocalSourceAssetReferences,
    missingLocalSourceAssetReferenceFiles: [...filesWithMissingSourceAssetReferences].sort(),
    notes: [
      'This audit is read-only and does not print matched media values.',
      'public/uploads is inventoried with aggregate counts only.',
      'Remote catalog media is tracked separately from static UI asset dependencies.',
      'Physical public/assets/icons SVG files are tracked separately from bundled lucide-react imports.',
      'Missing local source asset warnings are aggregate-only and exclude docs, tests, scripts, prisma, and audit reports.',
    ],
  }
}

export function formatLocalAssetDependencyAudit(audit) {
  return JSON.stringify(audit, null, 2)
}

export function createLocalAssetDependencyEvidence(audit) {
  return {
    scannedFileCount: audit.scannedFileCount,
    summary: audit.summary,
    publicInventory: audit.publicInventory,
    productSourceAssetFolder: audit.productSourceAssetFolder,
    physicalIconAssets: audit.physicalIconAssets,
    productSeedMedia: audit.productSeedMedia,
    remoteCatalogBacklog: {
      remainingRemoteProductCatalogMediaCount: audit.summary.remoteProductCatalogMedia,
      filesWithRemoteProductCatalogMediaCount: audit.remoteProductCatalogMediaFiles.length,
      seedProductRemoteCatalogMediaCount: audit.productSeedMedia.productSeedRemoteCatalogMediaCount,
      ownerReviewNeededProductMediaCount: audit.productSeedMedia.productSeedOwnerReviewNeededCount,
    },
    sourceUploadBoundary: {
      sourceControlledProductAssetsRootLabel: 'public-assets-products',
      sourceControlledProductAssetsPrefixLabel: 'assets-products',
      managedProductUploadRootLabel: 'public-uploads-products',
      productSeedUsesManagedUploadCount: audit.productSeedMedia.productSeedLocalManagedUploadCount,
      productSeedUsesProductSourceAssetCount: audit.productSeedMedia.productSeedLocalProductSourceAssetCount,
    },
    paymentAssetConfig: audit.paymentAssetConfig,
    safeAggregateOnly: audit.safeAggregateOnly,
    privateEnvRead: audit.privateEnvRead,
    deletionPerformed: audit.deletionPerformed,
    realMediaFilesDeleted: audit.realMediaFilesDeleted,
    remoteStaticUiAssetRisk: audit.remoteStaticUiAssetRisk,
    missingAssetWarnings: {
      missingLocalSourceAssetReferenceCount: audit.missingLocalSourceAssetReferences,
      filesWithMissingLocalSourceAssetReferenceCount: audit.missingLocalSourceAssetReferenceFiles.length,
    },
    filesWithRemoteStaticUiAssetCount: audit.remoteStaticUiAssetFiles.length,
    filesWithRemoteProductCatalogMediaCount: audit.remoteProductCatalogMediaFiles.length,
    filesWithManagedUploadReferenceCount: audit.managedUploadReferenceFiles.length,
    filesWithSourceAssetReferenceCount: audit.sourceAssetReferenceFiles.length,
    notes: audit.notes,
  }
}

export async function runLocalAssetDependencyAuditCli({
  argv = process.argv.slice(2),
  cwd = process.cwd(),
  stdout = console.log,
  stderr = console.error,
} = {}) {
  const evidenceMode = argv.includes('--evidence')
  const outIndex = argv.indexOf('--out')
  const outPath = outIndex >= 0 ? argv[outIndex + 1] : null
  const allowedArgs = new Set(['--evidence', '--out', outPath].filter(Boolean))
  const unknownArgs = argv.filter((arg) => !allowedArgs.has(arg))

  if (unknownArgs.length > 0 || (outIndex >= 0 && !outPath)) {
    stderr('Unsupported local asset dependency audit option.')
    return 1
  }

  const audit = await collectLocalAssetDependencyAudit({ cwd })
  const payload = evidenceMode
    ? createLocalAssetDependencyEvidence(audit)
    : audit
  const formatted = JSON.stringify(payload, null, 2)

  if (outPath) {
    const resolvedOutPath = path.resolve(cwd, outPath)
    await fs.mkdir(path.dirname(resolvedOutPath), { recursive: true })
    await fs.writeFile(resolvedOutPath, `${formatted}\n`)
  } else {
    stdout(formatted)
  }

  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runLocalAssetDependencyAuditCli()
    .then((status) => {
      process.exit(status)
    })
    .catch(() => {
      console.error('Local asset dependency audit failed before aggregate output was produced.')
      process.exit(1)
    })
}
