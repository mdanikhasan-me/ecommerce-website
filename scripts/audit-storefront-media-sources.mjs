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
