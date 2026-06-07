import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

export const CATEGORY_PHOTO_ASSETS: Record<string, { path: string; version: string }> = {
  electronics: {
    path: '/assets/categories/electronics.jpg',
    version: '75b478cf761d',
  },
  fashion: {
    path: '/assets/categories/fashion.jpg',
    version: '50f7092c1d2d',
  },
  'home-appliances': {
    path: '/assets/categories/home-appliances.jpg',
    version: '4ea4173c04ae',
  },
  'beauty-health': {
    path: '/assets/categories/beauty-health.jpg',
    version: '5709ce7f5817',
  },
  'sports-fitness': {
    path: '/assets/categories/sports-fitness.jpg',
    version: 'f91b7397630a',
  },
  'books-stationery': {
    path: '/assets/categories/books-stationery.jpg',
    version: '9b0fa704b0cb',
  },
  gaming: {
    path: '/assets/categories/gaming.jpg',
    version: '1ec2f8930d9a',
  },
  'toys-collectibles': {
    path: '/assets/categories/toys-collectibles.jpg',
    version: '18811d8fecf3',
  },
  'baby-kids': {
    path: '/assets/categories/gaming.jpg',
    version: '1ec2f8930d9a',
  },
}

const MANAGED_PARENT_CATEGORY_UPLOAD_PREFIX = '/uploads/categories/'

// Keep this version in sync with the image file hash when a same-named category asset is replaced.
function versionCategoryAsset(asset: { path: string; version: string }) {
  return `${asset.path}?v=${asset.version}`
}

function stripCategoryImageVersion(value: string) {
  return value.replace(/\?v=[a-f0-9]{8,64}$/i, '')
}

function resolvePublicFilePath(publicPath: string) {
  if (
    !publicPath.startsWith('/') ||
    /[\0?#]/.test(publicPath) ||
    publicPath.includes('..') ||
    publicPath.includes('\\')
  ) {
    return null
  }

  const publicRoot = path.resolve(process.cwd(), 'public')
  const filePath = path.resolve(publicRoot, publicPath.replace(/^\/+/, ''))

  if (filePath === publicRoot || !filePath.startsWith(`${publicRoot}${path.sep}`)) {
    return null
  }

  return filePath
}

function versionManagedCategoryUpload(publicPath: string) {
  if (!publicPath.startsWith(MANAGED_PARENT_CATEGORY_UPLOAD_PREFIX)) {
    return publicPath
  }

  const filePath = resolvePublicFilePath(publicPath)
  if (!filePath || !existsSync(filePath)) {
    return publicPath
  }

  try {
    const version = createHash('sha256').update(readFileSync(filePath)).digest('hex').slice(0, 12)
    return `${publicPath}?v=${version}`
  } catch {
    return publicPath
  }
}

export function getCategoryMediaBasePath(category: CategoryImageInput) {
  const savedImage = getSavedCategoryImage(category)
  if (savedImage) {
    return savedImage
  }

  const localAsset = CATEGORY_PHOTO_ASSETS[category.slug]
  if (localAsset) {
    return localAsset.path
  }

  return CATEGORY_PHOTO_ASSETS.electronics.path
}

type CategoryImageInput = {
  slug: string
  image?: string | null
}

function isLegacyBrokenCategoryImage(src: string) {
  const value = src.trim()

  if (!value) return true

  return (
    value.startsWith('data:image/') ||
    value.startsWith('/images/categories/') ||
    value.startsWith('/uploads/admin/categories/') ||
    value.includes('/images/categories/') ||
    value.endsWith('.svg') ||
    value.includes('unsplash.com') ||
    value.includes('pexels.com')
  )
}

function getSavedCategoryImage(category: CategoryImageInput) {
  const image = category.image ? stripCategoryImageVersion(category.image.trim()) : null
  if (!image || isLegacyBrokenCategoryImage(image)) {
    return null
  }

  return image
}

export function getCategoryMediaPath(category: CategoryImageInput) {
  const savedImage = getSavedCategoryImage(category)
  const localAsset = CATEGORY_PHOTO_ASSETS[category.slug]

  if (savedImage) {
    if (localAsset?.path === savedImage) {
      return versionCategoryAsset(localAsset)
    }

    return versionManagedCategoryUpload(savedImage)
  }

  if (localAsset) {
    return versionCategoryAsset(localAsset)
  }

  return versionCategoryAsset(CATEGORY_PHOTO_ASSETS.electronics)
}

export function getSubcategoryMediaPath(category: CategoryImageInput) {
  const image = category.image?.trim()
  if (!image) return null

  if (
    image.startsWith('/assets/categories/subcategories/') ||
    image.startsWith('/uploads/admin/categories/')
  ) {
    return image
  }

  return null
}
