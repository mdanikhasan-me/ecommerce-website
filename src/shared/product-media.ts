export const CATALOG_PRODUCT_MEDIA_ROOT = '/assets/products/catalog' as const

export type CatalogProductMediaSource =
  | 'existing-local-source-copied'
  | 'committed-managed-demo-upload-copied'
  | 'existing-repo-seed-remote-localized'

export type CatalogProductMediaEntry = {
  slug: string
  path: `${typeof CATALOG_PRODUCT_MEDIA_ROOT}/${string}`
  sourceType: CatalogProductMediaSource
  sourceControlled: true
  ownerReviewNeeded: boolean
  note: string
}

export const CATALOG_PRODUCT_MEDIA = [
  {
    slug: 'iphone-15-pro-128gb',
    path: '/assets/products/catalog/iphone-15-pro-128gb.jpg',
    sourceType: 'existing-local-source-copied',
    sourceControlled: true,
    ownerReviewNeeded: false,
    note: 'Copied from the existing local iPhone storefront asset into the product catalog source folder.',
  },
  {
    slug: 'samsung-galaxy-s24-ultra-256gb',
    path: '/assets/products/catalog/samsung-galaxy-s24-ultra-256gb.jpg',
    sourceType: 'committed-managed-demo-upload-copied',
    sourceControlled: true,
    ownerReviewNeeded: false,
    note: 'Copied from the committed same-slug demo product upload into the product catalog source folder.',
  },
  {
    slug: 'xiaomi-buds-4-pro',
    path: '/assets/products/catalog/xiaomi-buds-4-pro.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'sony-wh-1000xm5',
    path: '/assets/products/catalog/sony-wh-1000xm5.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'dell-xps-15-9520-i7-oled',
    path: '/assets/products/catalog/dell-xps-15-9520-i7-oled.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'hp-spectre-x360-14',
    path: '/assets/products/catalog/hp-spectre-x360-14.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'apple-watch-series-9-41mm',
    path: '/assets/products/catalog/apple-watch-series-9-41mm.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'samsung-galaxy-watch-6-classic-44mm',
    path: '/assets/products/catalog/samsung-galaxy-watch-6-classic-44mm.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'anker-737-power-bank-24000mah',
    path: '/assets/products/catalog/anker-737-power-bank-24000mah.webp',
    sourceType: 'committed-managed-demo-upload-copied',
    sourceControlled: true,
    ownerReviewNeeded: false,
    note: 'Copied from the committed same-slug demo product upload into the product catalog source folder.',
  },
  {
    slug: 'sony-playstation-5-slim',
    path: '/assets/products/catalog/sony-playstation-5-slim.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'xiaomi-pad-6-128gb-wifi',
    path: '/assets/products/catalog/xiaomi-pad-6-128gb-wifi.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'nike-air-max-270-running-shoes',
    path: '/assets/products/catalog/nike-air-max-270-running-shoes.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'bose-quietcomfort-45-headphones',
    path: '/assets/products/catalog/bose-quietcomfort-45-headphones.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'samsung-55-neo-qled-qn90c',
    path: '/assets/products/catalog/samsung-55-neo-qled-qn90c.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'sony-alpha-a7-iv-mirrorless-body',
    path: '/assets/products/catalog/sony-alpha-a7-iv-mirrorless-body.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'xiaomi-mi-smart-band-8',
    path: '/assets/products/catalog/xiaomi-mi-smart-band-8.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'anker-511-nano-pro-65w-charger',
    path: '/assets/products/catalog/anker-511-nano-pro-65w-charger.jpg',
    sourceType: 'committed-managed-demo-upload-copied',
    sourceControlled: true,
    ownerReviewNeeded: false,
    note: 'Copied from the committed same-slug demo product upload into the product catalog source folder.',
  },
  {
    slug: 'apple-airpods-pro-2nd-gen',
    path: '/assets/products/catalog/apple-airpods-pro-2nd-gen.avif',
    sourceType: 'existing-repo-seed-remote-localized',
    sourceControlled: true,
    ownerReviewNeeded: true,
    note: 'Localized from the existing seed/demo catalog reference; replace later if owner supplies final product art.',
  },
  {
    slug: 'dell-ultrasharp-27-4k-usb-c-u2723de',
    path: '/assets/products/catalog/dell-ultrasharp-27-4k-usb-c-u2723de.jpg',
    sourceType: 'committed-managed-demo-upload-copied',
    sourceControlled: true,
    ownerReviewNeeded: false,
    note: 'Copied from the committed same-slug demo product upload into the product catalog source folder.',
  },
  {
    slug: 'samsung-galaxy-tab-s9-128gb',
    path: '/assets/products/catalog/samsung-galaxy-tab-s9-128gb.jpg',
    sourceType: 'committed-managed-demo-upload-copied',
    sourceControlled: true,
    ownerReviewNeeded: false,
    note: 'Copied from the committed same-slug demo product upload into the product catalog source folder.',
  },
  {
    slug: 'xiaomi-redmi-note-13-pro-256gb',
    path: '/assets/products/catalog/xiaomi-redmi-note-13-pro-256gb.webp',
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
