import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export const CANONICAL_CATEGORY_ASSETS = [
  '/assets/categories/electronics.jpg',
  '/assets/categories/fashion.jpg',
  '/assets/categories/home-appliances.jpg',
  '/assets/categories/beauty-health.jpg',
  '/assets/categories/sports-fitness.jpg',
  '/assets/categories/books-stationery.jpg',
  '/assets/categories/gaming.jpg',
  '/assets/categories/toys-collectibles.jpg',
]

export const CANONICAL_HERO_ASSETS = [
  '/assets/banners/home-hero-iphone-15-pro.jpg',
  '/assets/banners/home-hero-galaxy-s24-ultra.jpg',
]

export const CANONICAL_PRODUCT_IMAGE_REPLACEMENTS = [
  {
    product: 'iPhone 15 Pro 128GB',
    slug: 'iphone-15-pro-128gb',
    remote: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format',
    local: '/assets/products/catalog/electronics/mobile-phones/iphone-15-pro-128gb/main.jpg',
    note: 'Temporary exact-product hero asset reuse until a dedicated product-card asset is supplied.',
  },
  {
    product: 'Samsung Galaxy S24 Ultra 256GB',
    slug: 'samsung-galaxy-s24-ultra-256gb',
    remote: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format',
    local: '/assets/products/catalog/electronics/mobile-phones/samsung-galaxy-s24-ultra-256gb/main.jpg',
    note: 'Exact committed product upload.',
  },
  {
    product: 'Anker 737 Power Bank 24000mAh',
    slug: 'anker-737-power-bank-24000mah',
    remote: 'https://images.unsplash.com/photo-1609428614116-c91f3c1eac77?w=800&auto=format',
    local: '/assets/products/catalog/electronics/general/anker-737-power-bank-24000mah/main.webp',
    note: 'Exact committed product upload.',
  },
  {
    product: 'Anker 511 Nano Pro 65W USB-C Charger',
    slug: 'anker-511-nano-pro-65w-charger',
    remote: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format',
    local: '/assets/products/catalog/electronics/general/anker-511-nano-pro-65w-charger/main.jpg',
    note: 'Exact committed product upload.',
  },
  {
    product: 'Dell UltraSharp 27" 4K USB-C Monitor U2723DE',
    slug: 'dell-ultrasharp-27-4k-usb-c-u2723de',
    remote: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format',
    local: '/assets/products/catalog/electronics/laptops/dell-ultrasharp-27-4k-usb-c-u2723de/main.jpg',
    note: 'Exact committed product upload.',
  },
  {
    product: 'Samsung Galaxy Tab S9 128GB WiFi',
    slug: 'samsung-galaxy-tab-s9-128gb',
    remote: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format',
    local: '/assets/products/catalog/electronics/general/samsung-galaxy-tab-s9-128gb/main.jpg',
    note: 'Exact committed product upload selected from same-slug local assets.',
  },
  {
    product: 'Xiaomi Redmi Note 13 Pro 256GB',
    slug: 'xiaomi-redmi-note-13-pro-256gb',
    remote: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format',
    local: '/assets/products/catalog/electronics/mobile-phones/xiaomi-redmi-note-13-pro-256gb/main.webp',
    note: 'Exact committed product upload.',
  },
]

export const RETIRED_STOREFRONT_REMOTE_MEDIA = [
  'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1600&auto=format',
  'https://images.unsplash.com/photo-1706165965474-1e45ede2e5c4?w=1600&auto=format',
]

export const ACCEPTED_REMOTE_MEDIA = [
  {
    url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1600&auto=format',
    classification: 'active-storefront-hero-remote',
    note: 'Sony hero remains remote until a local replacement is approved.',
  },
]

const DEFAULT_SCAN_FILES = [
  'next.config.js',
  'prisma/seed.ts',
  'scripts/repair-known-broken-image-urls.mjs',
  'scripts/repair-storefront-image-sources.mjs',
  'src/shared/category-media.ts',
  'tests/storefront-image-source.test.ts',
]

const REMOTE_URL_PATTERN = /https?:\/\/[^\s'"`)>,]+/g

function normalizePath(pathname) {
  return pathname.replaceAll('\\', '/')
}

function unique(values) {
  return [...new Set(values)]
}

function publicPathExists(cwd, pathname) {
  return existsSync(join(cwd, 'public', pathname.replace(/^\//, '')))
}

function collectRemoteUrlsFromFile(cwd, file) {
  const absolutePath = join(cwd, file)
  if (!existsSync(absolutePath)) return []

  const text = readFileSync(absolutePath, 'utf8')
  return unique(text.match(REMOTE_URL_PATTERN) ?? []).map((url) => ({
    file: normalizePath(file),
    url,
    classification: classifyRemoteUrl({ file, url }),
  }))
}

function readFileIfPresent(cwd, file) {
  const absolutePath = join(cwd, file)
  if (!existsSync(absolutePath)) return ''
  return readFileSync(absolutePath, 'utf8')
}

function classifyRemoteUrl({ file, url }) {
  if (file === 'next.config.js') return 'next-image-remote-allowlist'
  if (file === 'prisma/seed.ts' && url.includes('w=1600')) return 'seed-hero-remote'
  if (file === 'prisma/seed.ts' && url.includes('w=800')) return 'product-seed-remote'
  if (file === 'prisma/seed.ts' && url.includes('w=400')) return 'seed-promotional-remote'
  if (file.includes('repair-known-broken-image-urls')) return 'repair-mapping-remote'
  if (file.includes('repair-storefront-image-sources')) return 'retired-storefront-repair-remote'
  if (file.startsWith('tests/')) return 'test-policy-reference'
  return 'remote-media-reference'
}

export function auditStorefrontMediaSources({ cwd = process.cwd(), scanFiles = DEFAULT_SCAN_FILES } = {}) {
  const seedText = readFileIfPresent(cwd, 'prisma/seed.ts')
  const knownRepairText = readFileIfPresent(cwd, 'scripts/repair-known-broken-image-urls.mjs')
  const categoryAssets = CANONICAL_CATEGORY_ASSETS.map((pathname) => ({
    pathname,
    exists: publicPathExists(cwd, pathname),
  }))
  const heroAssets = CANONICAL_HERO_ASSETS.map((pathname) => ({
    pathname,
    exists: publicPathExists(cwd, pathname),
  }))
  const babyKidsExists = publicPathExists(cwd, '/assets/categories/baby-kids.jpg')
  const remoteReferences = scanFiles.flatMap((file) => collectRemoteUrlsFromFile(cwd, file))
  const remoteUrls = unique(remoteReferences.map((reference) => reference.url))
  const acceptedRemoteUrls = new Set(ACCEPTED_REMOTE_MEDIA.map((entry) => entry.url))
  const productImageReplacements = CANONICAL_PRODUCT_IMAGE_REPLACEMENTS.map((replacement) => ({
    ...replacement,
    localExists: publicPathExists(cwd, replacement.local),
    seedUsesLocal: seedText.includes(`imageUrl: '${replacement.local}'`),
    seedUsesRemote: seedText.includes(`imageUrl: '${replacement.remote}'`),
    repairMapsRemoteToLocal:
      knownRepairText.includes(`from: '${replacement.remote}'`) &&
      knownRepairText.includes(`to: '${replacement.local}'`),
  }))

  return {
    cwd: normalizePath(cwd),
    scanFiles: scanFiles.map(normalizePath),
    categoryAssets,
    heroAssets,
    babyKidsExists,
    toysCollectibles: {
      pathname: '/assets/categories/toys-collectibles.jpg',
      exists: publicPathExists(cwd, '/assets/categories/toys-collectibles.jpg'),
      sharesPixelsWithGaming: true,
    },
    remoteReferences,
    remoteUrls,
    productImageReplacements,
    retiredStorefrontRemoteMedia: RETIRED_STOREFRONT_REMOTE_MEDIA.map((url) => ({
      url,
      presentInActiveSeedHero: remoteReferences.some(
        (reference) => reference.file === 'prisma/seed.ts' && reference.url === url,
      ),
    })),
    acceptedRemoteMedia: ACCEPTED_REMOTE_MEDIA.map((entry) => ({
      ...entry,
      present: remoteUrls.includes(entry.url),
    })),
    productSeedRemoteCount: remoteReferences.filter((reference) => reference.classification === 'product-seed-remote')
      .length,
    productSeedLocalReplacementCount: productImageReplacements.filter(
      (replacement) => replacement.seedUsesLocal && replacement.localExists,
    ).length,
    staleProductReplacementRemoteCount: productImageReplacements.filter((replacement) => replacement.seedUsesRemote)
      .length,
    unexpectedRemoteHeroCount: remoteReferences.filter(
      (reference) =>
        reference.classification === 'seed-hero-remote' && !acceptedRemoteUrls.has(reference.url),
    ).length,
  }
}

function formatAudit(audit) {
  const lines = []
  lines.push('Storefront media source audit')
  lines.push(`Scanned files: ${audit.scanFiles.length}`)
  lines.push(`Category assets present: ${audit.categoryAssets.every((asset) => asset.exists)}`)
  lines.push(`Hero assets present: ${audit.heroAssets.every((asset) => asset.exists)}`)
  lines.push(`Baby Kids asset restored: ${audit.babyKidsExists}`)
  lines.push(`Product seed remote images: ${audit.productSeedRemoteCount}`)
  lines.push(`Product seed local replacements: ${audit.productSeedLocalReplacementCount}`)
  lines.push(`Stale product replacement remotes: ${audit.staleProductReplacementRemoteCount}`)
  lines.push(`Unexpected seed hero remotes: ${audit.unexpectedRemoteHeroCount}`)
  lines.push('Remote media references:')
  for (const reference of audit.remoteReferences) {
    lines.push(`- ${reference.classification}: ${reference.file}: ${reference.url}`)
  }
  return lines.join('\n')
}

function isCliEntrypoint() {
  return Boolean(process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
}

if (isCliEntrypoint()) {
  const audit = auditStorefrontMediaSources()
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(audit, null, 2))
  } else {
    console.log(formatAudit(audit))
  }
}
