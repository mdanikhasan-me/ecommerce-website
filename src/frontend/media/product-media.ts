// Product illustration overrides are intentionally disabled.
// Storefront product media should stay on real photography.
export const LOCAL_PRODUCT_IMAGE_MAP: Record<string, string[]> = {}

type ImageLike = {
  url: string
  isPrimary?: boolean
}

export function getLocalProductImages(slug: string) {
  return LOCAL_PRODUCT_IMAGE_MAP[slug]
}

export function resolveProductImages<T extends ImageLike>(slug: string, images: T[]) {
  const localImages = getLocalProductImages(slug)

  if (!localImages?.length) {
    return images
  }

  return localImages.map((url, index) => ({
    ...(images[index] ?? {}),
    url,
    isPrimary: index === 0,
  })) as T[]
}

export function resolvePrimaryProductImage(slug: string, images: ImageLike[]) {
  const localImages = getLocalProductImages(slug)

  if (localImages?.length) {
    return localImages[0]
  }

  return images.find((image) => image.isPrimary)?.url ?? images[0]?.url ?? ''
}
