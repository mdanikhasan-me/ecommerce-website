import { revalidatePath, revalidateTag } from 'next/cache'
import { db } from '@/backend/database'

type RevalidateProductSurfacesInput = {
  productSlugs?: Array<string | null | undefined>
  categorySlugs?: Array<string | null | undefined>
}

function uniqueDefined(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean))) as string[]
}

export const STOREFRONT_CACHE_TAGS = {
  banners: 'storefront-banners',
  categories: 'storefront-categories',
  products: 'storefront-products',
} as const

export function revalidateHomeSurface() {
  revalidatePath('/')
  revalidatePath('/sitemap.xml')
  revalidatePath('/product-feed.xml')
  revalidateTag(STOREFRONT_CACHE_TAGS.banners)
  revalidateTag(STOREFRONT_CACHE_TAGS.categories)
  revalidateTag(STOREFRONT_CACHE_TAGS.products)
}

export function revalidateCategorySurfaces({
  categorySlugs = [],
}: {
  categorySlugs?: Array<string | null | undefined>
} = {}) {
  revalidatePath('/')
  revalidatePath('/category')
  revalidatePath('/sitemap.xml')
  revalidatePath('/product-feed.xml')
  revalidateTag(STOREFRONT_CACHE_TAGS.categories)
  revalidateTag(STOREFRONT_CACHE_TAGS.products)

  for (const slug of uniqueDefined(categorySlugs)) {
    revalidatePath(`/category/${slug}`)
  }
}

export function revalidateProductSurfaces({
  productSlugs = [],
  categorySlugs = [],
}: RevalidateProductSurfacesInput = {}) {
  revalidatePath('/')
  revalidatePath('/category')
  revalidatePath('/new-arrivals')
  revalidatePath('/search')
  revalidatePath('/sitemap.xml')
  revalidatePath('/product-feed.xml')
  revalidateTag(STOREFRONT_CACHE_TAGS.products)

  for (const slug of uniqueDefined(productSlugs)) {
    revalidatePath(`/products/${slug}`)
  }

  for (const slug of uniqueDefined(categorySlugs)) {
    revalidatePath(`/category/${slug}`)
  }
}

export async function revalidateProductSurfacesByIds(
  productIds: Array<string | null | undefined>,
) {
  const ids = uniqueDefined(productIds)
  if (ids.length === 0) return

  const products = await db.product.findMany({
    where: { id: { in: ids } },
    select: {
      slug: true,
      category: {
        select: {
          slug: true,
          parent: { select: { slug: true } },
        },
      },
    },
  })

  revalidateProductSurfaces({
    productSlugs: products.map((product) => product.slug),
    categorySlugs: products.flatMap((product) => [
      product.category.slug,
      product.category.parent?.slug,
    ]),
  })
}
