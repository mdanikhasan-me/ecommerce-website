import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const CATALOG_ROOT = 'public/assets/products/catalog'
const PRODUCT_MEDIA_SOURCE = 'src/shared/product-media.ts'
const IMAGE_EXTENSIONS = new Set(['.avif', '.gif', '.jpg', '.jpeg', '.png', '.webp'])

function normalizePath(value) {
  return value.split(path.sep).join('/')
}

function parseArgs(argv) {
  const options = {
    dryRun: true,
    outPath: null,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }

    if (arg === '--out') {
      options.outPath = argv[index + 1]
      index += 1
      continue
    }

    if (arg === '--apply' || arg === '--delete') {
      throw new Error('Source catalog prune is dry-run only in this step.')
    }

    throw new Error('Unsupported source catalog prune option.')
  }

  return options
}

function parseCatalogProductMediaEntries(source) {
  const entries = []
  const entryPattern = /\{\s*slug:\s*'(?<slug>[^']+)'[\s\S]*?categorySlug:\s*'(?<categorySlug>[^']+)'[\s\S]*?subcategorySlug:\s*'(?<subcategorySlug>[^']+)'[\s\S]*?path:\s*'(?<publicPath>\/assets\/products\/catalog\/[^']+)'[\s\S]*?\n\s*\}/g

  for (const match of source.matchAll(entryPattern)) {
    const groups = match.groups ?? {}
    const publicPath = groups.publicPath
    const parts = publicPath.replace(/^\/assets\/products\/catalog\/?/, '').split('/')

    entries.push({
      slug: groups.slug,
      categorySlug: groups.categorySlug,
      subcategorySlug: groups.subcategorySlug,
      publicPath,
      productFolder: parts.length >= 4
        ? `/assets/products/catalog/${parts.slice(0, 3).join('/')}`
        : null,
    })
  }

  return entries
}

async function walkFiles(root) {
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
      const next = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        await visit(next)
      } else if (entry.isFile()) {
        files.push(next)
      }
    }
  }

  await visit(root)
  return files
}

async function collectCatalogFolders(root, catalogRoot) {
  if (!existsSync(catalogRoot)) {
    return {
      categoryFolders: [],
      subcategoryFolders: [],
      productFolders: [],
      files: [],
    }
  }

  const categoryFolders = new Set()
  const subcategoryFolders = new Set()
  const productFolders = new Set()

  async function collectDirectories(directory, depth = 0, segments = []) {
    let entries
    try {
      entries = await fs.readdir(directory, { withFileTypes: true })
    } catch (error) {
      if (error?.code === 'ENOENT') return
      throw error
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const nextSegments = [...segments, entry.name]
      if (depth === 0) categoryFolders.add(entry.name)
      if (depth === 1) subcategoryFolders.add(nextSegments.join('/'))
      if (depth === 2) productFolders.add(`/assets/products/catalog/${nextSegments.join('/')}`)
      await collectDirectories(path.join(directory, entry.name), depth + 1, nextSegments)
    }
  }

  await collectDirectories(catalogRoot)

  const files = (await walkFiles(catalogRoot))
    .filter((filePath) => IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase()))
    .map((filePath) => {
      const relative = normalizePath(path.relative(catalogRoot, filePath))
      const parts = relative.split('/')
      return {
        relative,
        category: parts[0] ?? null,
        subcategory: parts[1] ?? null,
        product: parts[2] ?? null,
        publicPath: `/assets/products/catalog/${relative}`,
        productFolder: parts.length >= 4
          ? `/assets/products/catalog/${parts.slice(0, 3).join('/')}`
        : null,
      }
    })

  for (const file of files) {
    if (file.category) categoryFolders.add(file.category)
    if (file.category && file.subcategory) subcategoryFolders.add(`${file.category}/${file.subcategory}`)
    if (file.productFolder) productFolders.add(file.productFolder)
  }

  return {
    categoryFolders: [...categoryFolders].sort(),
    subcategoryFolders: [...subcategoryFolders].sort(),
    productFolders: [...productFolders].sort(),
    files,
  }
}

export async function collectSourceCatalogProductPruneAudit({ cwd = process.cwd() } = {}) {
  const root = path.resolve(cwd)
  const catalogRoot = path.join(root, CATALOG_ROOT)
  const productMediaPath = path.join(root, PRODUCT_MEDIA_SOURCE)
  const productMediaSource = existsSync(productMediaPath)
    ? await fs.readFile(productMediaPath, 'utf8')
    : ''
  const referencedEntries = parseCatalogProductMediaEntries(productMediaSource)
  const referencedPaths = new Set(referencedEntries.map((entry) => entry.publicPath))
  const referencedFolders = new Set(referencedEntries.map((entry) => entry.productFolder).filter(Boolean))
  const catalog = await collectCatalogFolders(root, catalogRoot)
  const physicalPaths = new Set(catalog.files.map((file) => file.publicPath))
  const unreferencedFiles = catalog.files.filter((file) => !referencedPaths.has(file.publicPath))
  const unreferencedProductFolders = catalog.productFolders.filter((folder) => !referencedFolders.has(folder))
  const missingReferencedFiles = referencedEntries.filter((entry) => !physicalPaths.has(entry.publicPath))

  return {
    dryRun: true,
    deletionPerformed: false,
    realMediaFilesDeleted: false,
    safeAggregateOnly: true,
    sourceCatalogRoot: CATALOG_ROOT,
    referencedCatalogProductCount: referencedEntries.length,
    physicalCatalogImageCount: catalog.files.length,
    categoryFolderCount: catalog.categoryFolders.length,
    subcategoryFolderCount: catalog.subcategoryFolders.length,
    productFolderCount: catalog.productFolders.length,
    categoryFolders: catalog.categoryFolders,
    subcategoryFolders: catalog.subcategoryFolders,
    unreferencedCatalogImageCount: unreferencedFiles.length,
    unreferencedProductFolderCount: unreferencedProductFolders.length,
    missingReferencedCatalogImageCount: missingReferencedFiles.length,
    referencedProductFolderCount: referencedFolders.size,
    notes: [
      'This script is dry-run only in Step 290.',
      'It only inspects source-controlled catalog assets under public/assets/products/catalog.',
      'It never deletes public/uploads and never runs from admin runtime cleanup.',
      'Source catalog files are developer/source-owned, not admin-managed upload files.',
    ],
  }
}

export function formatSourceCatalogProductPruneAudit(audit) {
  return JSON.stringify(audit, null, 2)
}

export async function runSourceCatalogProductPruneCli({
  argv = process.argv.slice(2),
  cwd = process.cwd(),
  stdout = console.log,
  stderr = console.error,
} = {}) {
  let options
  try {
    options = parseArgs(argv)
  } catch (error) {
    stderr(error?.message ?? 'Unsupported source catalog prune option.')
    return 1
  }

  const audit = await collectSourceCatalogProductPruneAudit({ cwd })
  const formatted = formatSourceCatalogProductPruneAudit(audit)

  if (options.outPath) {
    const resolvedOutPath = path.resolve(cwd, options.outPath)
    await fs.mkdir(path.dirname(resolvedOutPath), { recursive: true })
    await fs.writeFile(resolvedOutPath, `${formatted}\n`)
  } else {
    stdout(formatted)
  }

  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runSourceCatalogProductPruneCli()
    .then((status) => {
      process.exit(status)
    })
    .catch(() => {
      console.error('Source catalog product prune audit failed before aggregate output was produced.')
      process.exit(1)
    })
}
