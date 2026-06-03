const CATEGORY_PHOTO_ASSETS: Record<string, string> = {
  electronics: '/assets/categories/electronics.jpg',
  fashion: '/assets/categories/fashion.jpg',
  'home-appliances': '/assets/categories/home-appliances.jpg',
  'beauty-health': '/assets/categories/beauty-health.jpg',
  'sports-fitness': '/assets/categories/sports-fitness.jpg',
  'books-stationery': '/assets/categories/books-stationery.jpg',
  gaming: '/assets/categories/gaming.jpg',
  'toys-collectibles': '/assets/categories/toys-collectibles.jpg',
  'baby-kids': '/assets/categories/gaming.jpg',
}

type CategoryImageInput = {
  slug: string
  image?: string | null
}

function isLegacyBrokenCategoryImage(src: string) {
  const value = src.trim()

  if (!value) return true

  return (
    value.startsWith('/images/categories/') ||
    value.includes('/images/categories/') ||
    value.endsWith('.svg') ||
    value.includes('unsplash.com') ||
    value.includes('pexels.com')
  )
}

export function getCategoryMediaPath(category: CategoryImageInput) {
  const localAsset = CATEGORY_PHOTO_ASSETS[category.slug]
  if (localAsset) {
    return localAsset
  }

  if (category.image && !isLegacyBrokenCategoryImage(category.image)) {
    return category.image
  }

  return CATEGORY_PHOTO_ASSETS.electronics
}
