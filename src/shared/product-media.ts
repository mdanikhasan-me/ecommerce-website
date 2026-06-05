export const CATALOG_PRODUCT_MEDIA_ROOT = '/assets/products/catalog' as const

export type CatalogProductMediaSource =
  | 'existing-local-source-copied'
  | 'committed-managed-demo-upload-copied'
  | 'existing-repo-seed-remote-localized'

export type CatalogProductMediaEntry = {
  slug: string
  categorySlug: string
  subcategorySlug: string
  path: `${typeof CATALOG_PRODUCT_MEDIA_ROOT}/${string}`
  sourceType: CatalogProductMediaSource
  sourceControlled: true
  ownerReviewNeeded: boolean
  note: string
}

export const CATALOG_PRODUCT_MEDIA = [
  {
    slug: 'iphone-15-pro-128gb',
    categorySlug: 'electronics',
    subcategorySlug: 'mobile-phones',
    path: '/assets/products/catalog/electronics/mobile-phones/iphone-15-pro-128gb/main.jpg',
    sourceType: 'existing-local-source-copied',
    sourceControlled: true,
    ownerReviewNeeded: false,
    note: 'Copied from the existing local iPhone storefront asset into the product catalog source folder.',
  },
  {
    slug: 'samsung-galaxy-s24-ultra-256gb',
    categorySlug: 'electronics',
    subcategorySlug: 'mobile-phones',
    path: '/assets/products/catalog/electronics/mobile-phones/samsung-galaxy-s24-ultra-256gb/main.jpg',
    sourceType: 'committed-managed-demo-upload-copied',
    sourceControlled: true,
    ownerReviewNeeded: false,
    note: 'Copied from the committed same-slug demo product upload into the product catalog source folder.',
  },
  {
    slug: 'xiaomi-buds-4-pro',
    categorySlug: 'electronics',
    subcategorySlug: 'audio',
    path: '/assets/products/catalog/electronics/audio/xiaomi-buds-4-pro/main.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'sony-wh-1000xm5',
    categorySlug: 'electronics',
    subcategorySlug: 'audio',
    path: '/assets/products/catalog/electronics/audio/sony-wh-1000xm5/main.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'dell-xps-15-9520-i7-oled',
    categorySlug: 'electronics',
    subcategorySlug: 'laptops',
    path: '/assets/products/catalog/electronics/laptops/dell-xps-15-9520-i7-oled/main.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'hp-spectre-x360-14',
    categorySlug: 'electronics',
    subcategorySlug: 'laptops',
    path: '/assets/products/catalog/electronics/laptops/hp-spectre-x360-14/main.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'apple-watch-series-9-41mm',
    categorySlug: 'electronics',
    subcategorySlug: 'wearables',
    path: '/assets/products/catalog/electronics/wearables/apple-watch-series-9-41mm/main.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'samsung-galaxy-watch-6-classic-44mm',
    categorySlug: 'electronics',
    subcategorySlug: 'wearables',
    path: '/assets/products/catalog/electronics/wearables/samsung-galaxy-watch-6-classic-44mm/main.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'anker-737-power-bank-24000mah',
    categorySlug: 'electronics',
    subcategorySlug: 'general',
    path: '/assets/products/catalog/electronics/general/anker-737-power-bank-24000mah/main.webp',
    sourceType: 'committed-managed-demo-upload-copied',
    sourceControlled: true,
    ownerReviewNeeded: false,
    note: 'Copied from the committed same-slug demo product upload into the product catalog source folder.',
  },
  {
    slug: 'sony-playstation-5-slim',
    categorySlug: 'gaming',
    subcategorySlug: 'general',
    path: '/assets/products/catalog/gaming/general/sony-playstation-5-slim/main.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'xiaomi-pad-6-128gb-wifi',
    categorySlug: 'electronics',
    subcategorySlug: 'general',
    path: '/assets/products/catalog/electronics/general/xiaomi-pad-6-128gb-wifi/main.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'nike-air-max-270-running-shoes',
    categorySlug: 'sports-fitness',
    subcategorySlug: 'general',
    path: '/assets/products/catalog/sports-fitness/general/nike-air-max-270-running-shoes/main.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'bose-quietcomfort-45-headphones',
    categorySlug: 'electronics',
    subcategorySlug: 'audio',
    path: '/assets/products/catalog/electronics/audio/bose-quietcomfort-45-headphones/main.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'samsung-55-neo-qled-qn90c',
    categorySlug: 'home-appliances',
    subcategorySlug: 'general',
    path: '/assets/products/catalog/home-appliances/general/samsung-55-neo-qled-qn90c/main.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'sony-alpha-a7-iv-mirrorless-body',
    categorySlug: 'electronics',
    subcategorySlug: 'general',
    path: '/assets/products/catalog/electronics/general/sony-alpha-a7-iv-mirrorless-body/main.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'xiaomi-mi-smart-band-8',
    categorySlug: 'electronics',
    subcategorySlug: 'wearables',
    path: '/assets/products/catalog/electronics/wearables/xiaomi-mi-smart-band-8/main.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'anker-511-nano-pro-65w-charger',
    categorySlug: 'electronics',
    subcategorySlug: 'general',
    path: '/assets/products/catalog/electronics/general/anker-511-nano-pro-65w-charger/main.jpg',
    sourceType: 'committed-managed-demo-upload-copied',
    sourceControlled: true,
    ownerReviewNeeded: false,
    note: 'Copied from the committed same-slug demo product upload into the product catalog source folder.',
  },
  {
    slug: 'apple-airpods-pro-2nd-gen',
    categorySlug: 'electronics',
    subcategorySlug: 'audio',
    path: '/assets/products/catalog/electronics/audio/apple-airpods-pro-2nd-gen/main.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'dell-ultrasharp-27-4k-usb-c-u2723de',
    categorySlug: 'electronics',
    subcategorySlug: 'laptops',
    path: '/assets/products/catalog/electronics/laptops/dell-ultrasharp-27-4k-usb-c-u2723de/main.jpg',
    sourceType: 'committed-managed-demo-upload-copied',
    sourceControlled: true,
    ownerReviewNeeded: false,
    note: 'Copied from the committed same-slug demo product upload into the product catalog source folder.',
  },
  {
    slug: 'samsung-galaxy-tab-s9-128gb',
    categorySlug: 'electronics',
    subcategorySlug: 'general',
    path: '/assets/products/catalog/electronics/general/samsung-galaxy-tab-s9-128gb/main.jpg',
    sourceType: 'committed-managed-demo-upload-copied',
    sourceControlled: true,
    ownerReviewNeeded: false,
    note: 'Copied from the committed same-slug demo product upload into the product catalog source folder.',
  },
  {
    slug: 'xiaomi-redmi-note-13-pro-256gb',
    categorySlug: 'electronics',
    subcategorySlug: 'mobile-phones',
    path: '/assets/products/catalog/electronics/mobile-phones/xiaomi-redmi-note-13-pro-256gb/main.webp',
    sourceType: 'committed-managed-demo-upload-copied',
    sourceControlled: true,
    ownerReviewNeeded: false,
    note: 'Copied from the committed same-slug demo product upload into the product catalog source folder.',
  },
] as const satisfies readonly CatalogProductMediaEntry[]

export const CATALOG_PRODUCT_MEDIA_BY_SLUG = Object.fromEntries(
  CATALOG_PRODUCT_MEDIA.map((entry) => [entry.slug, entry]),
) as Record<(typeof CATALOG_PRODUCT_MEDIA)[number]['slug'], (typeof CATALOG_PRODUCT_MEDIA)[number]>

export const OWNER_REVIEW_NEEDED_PRODUCT_MEDIA = CATALOG_PRODUCT_MEDIA.filter(
  (entry) => entry.ownerReviewNeeded,
)
