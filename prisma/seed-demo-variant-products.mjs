import { PrismaClient } from '@prisma/client'
import nextEnv from '@next/env'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())

const db = new PrismaClient()

const DEMO_PRODUCTS = [
  {
    categorySlug: 'mens-fashion',
    sku: 'DEMO-AJ1-HIGH',
    name: 'Air Jordan 1 Retro High Demo',
    slug: 'air-jordan-1-retro-high-og-demo',
    description:
      'A demo high-top basketball sneaker product built to test size selection, cart behavior, checkout, and product detail layout. The product uses a red, white, and black high-top silhouette with a padded collar, stitched paneling, and a rubber cupsole so the storefront can show a realistic footwear buying flow.',
    shortDescription: 'High-top basketball sneaker demo with selectable US shoe sizes.',
    basePrice: 18900,
    salePrice: 17490,
    effectivePrice: 17490,
    stockQuantity: 72,
    tags: ['sneaker', 'basketball shoes', 'high top shoes', 'air jordan', 'mens footwear'],
    metaTitle: 'Air Jordan 1 Retro High Demo with Size Variants',
    metaDescription:
      'Demo sneaker product with US size variants for testing Boilabin product selection, cart, and checkout UX.',
    rating: 4.8,
    reviewCount: 38,
    soldCount: 124,
    isFeatured: true,
    isBestSeller: true,
    images: [
      {
        url: '/assets/products/catalog/demo-air-jordan-1-retro-high/main.webp',
        alt: 'Red white and black high-top basketball sneaker',
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: '/assets/products/catalog/demo-air-jordan-1-retro-high/toe-detail.webp',
        alt: 'Close up of the red perforated toe box and black shoe overlay',
        isPrimary: false,
        sortOrder: 1,
      },
      {
        url: '/assets/products/catalog/demo-air-jordan-1-retro-high/lace-detail.webp',
        alt: 'Close up of the black laces and stitched high-top shoe panels',
        isPrimary: false,
        sortOrder: 2,
      },
      {
        url: '/assets/products/catalog/demo-air-jordan-1-retro-high/collar-detail.webp',
        alt: 'Close up of the padded collar and red ankle panel',
        isPrimary: false,
        sortOrder: 3,
      },
    ],
    variants: ['US 7', 'US 7.5', 'US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 10.5', 'US 11', 'US 12'].map(
      (size, index) => ({
        name: size,
        sku: `DEMO-AJ1-${size.replace(/\s|\./g, '').toUpperCase()}`,
        price: 18900,
        salePrice: 17490,
        stockQuantity: [5, 6, 9, 10, 12, 10, 8, 5, 4, 3][index],
        image: '/assets/products/catalog/demo-air-jordan-1-retro-high/main.webp',
        isActive: true,
        sortOrder: index,
        options: [{ name: 'Size', value: size }],
      }),
    ),
    attributes: [
      { name: 'Color', value: 'Red / Black / White' },
      { name: 'Fit', value: 'High-top' },
      { name: 'Closure', value: 'Lace-up' },
      { name: 'Use Case', value: 'Lifestyle / Basketball-inspired' },
    ],
    specifications: [
      { group: 'Upper', name: 'Material', value: 'Synthetic leather panels' },
      { group: 'Upper', name: 'Collar', value: 'Padded high-top collar' },
      { group: 'Sole', name: 'Outsole', value: 'Rubber cupsole traction pattern' },
      { group: 'Fit', name: 'Available sizes', value: 'US 7 to US 12' },
      { group: 'Care', name: 'Cleaning', value: 'Wipe with soft damp cloth' },
    ],
  },
  {
    categorySlug: 'mobile-phones',
    sku: 'DEMO-GS24U-BASE',
    name: 'Galaxy S24 Ultra 5G Demo',
    slug: 'galaxy-s24-ultra-variant-demo',
    description:
      'A premium Android phone demo product created to test memory variants, detailed specifications, product descriptions, cart behavior, and checkout UX. It includes a large AMOLED display, flagship-class processor, multi-camera system, S Pen support, and multiple RAM and storage configurations.',
    shortDescription: 'Flagship 5G phone demo with selectable RAM and storage variants.',
    basePrice: 109900,
    salePrice: 99900,
    effectivePrice: 99900,
    stockQuantity: 35,
    tags: ['smartphone', 'android phone', '5g phone', 'galaxy s24 ultra', 'mobile phone'],
    metaTitle: 'Galaxy S24 Ultra 5G Demo with RAM and Storage Variants',
    metaDescription:
      'Demo smartphone product with RAM and storage variants, descriptions, and specifications for testing Boilabin product UX.',
    rating: 4.9,
    reviewCount: 52,
    soldCount: 210,
    isFeatured: true,
    isBestSeller: true,
    images: [
      {
        url: '/assets/products/catalog/demo-galaxy-s24-ultra-variant/main.webp',
        alt: 'Galaxy S24 Ultra 5G demo phone front and back',
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: '/assets/products/catalog/demo-galaxy-s24-ultra-variant/camera-detail.webp',
        alt: 'Close up of the Galaxy S24 Ultra rear camera system',
        isPrimary: false,
        sortOrder: 1,
      },
      {
        url: '/assets/products/catalog/demo-galaxy-s24-ultra-variant/display-detail.webp',
        alt: 'Close up of the Galaxy S24 Ultra display and slim frame',
        isPrimary: false,
        sortOrder: 2,
      },
      {
        url: '/assets/products/catalog/demo-galaxy-s24-ultra-variant/stylus-detail.webp',
        alt: 'Close up of the Galaxy S24 Ultra S Pen stylus',
        isPrimary: false,
        sortOrder: 3,
      },
    ],
    variants: [
      { label: '8GB RAM / 128GB Storage', sku: '8-128', price: 109900, salePrice: 99900, stock: 10 },
      { label: '12GB RAM / 256GB Storage', sku: '12-256', price: 129900, salePrice: 119900, stock: 12 },
      { label: '12GB RAM / 512GB Storage', sku: '12-512', price: 149900, salePrice: 137900, stock: 8 },
      { label: '16GB RAM / 1TB Storage', sku: '16-1TB', price: 179900, salePrice: 164900, stock: 5 },
    ].map((variant, index) => ({
      name: variant.label,
      sku: `DEMO-GS24U-${variant.sku}`,
      price: variant.price,
      salePrice: variant.salePrice,
      stockQuantity: variant.stock,
      image: '/assets/products/catalog/demo-galaxy-s24-ultra-variant/main.webp',
      isActive: true,
      sortOrder: index,
      options: [{ name: 'Memory', value: variant.label }],
    })),
    attributes: [
      { name: 'Color', value: 'Titanium Black' },
      { name: 'Network', value: '5G' },
      { name: 'SIM', value: 'Dual SIM / eSIM support' },
      { name: 'Stylus', value: 'Built-in S Pen support' },
    ],
    specifications: [
      { group: 'Display', name: 'Panel', value: '6.8-inch Dynamic AMOLED 2X' },
      { group: 'Display', name: 'Refresh rate', value: '1-120Hz adaptive refresh rate' },
      { group: 'Performance', name: 'Processor', value: 'Flagship octa-core mobile platform' },
      { group: 'Performance', name: 'RAM and storage', value: '8GB/128GB, 12GB/256GB, 12GB/512GB, 16GB/1TB' },
      { group: 'Camera', name: 'Rear camera', value: '200MP wide + ultra-wide + telephoto camera system' },
      { group: 'Camera', name: 'Video', value: 'Up to 8K video recording support' },
      { group: 'Battery', name: 'Capacity', value: '5000mAh typical battery' },
      { group: 'Battery', name: 'Charging', value: 'Fast wired charging and wireless charging support' },
      { group: 'Connectivity', name: 'Wireless', value: '5G, Wi-Fi 7, Bluetooth, NFC' },
      { group: 'Software', name: 'OS', value: 'Android with long-term security updates' },
      { group: 'Warranty', name: 'Service', value: 'Demo warranty data for storefront testing' },
    ],
  },
]

function toCreateManyRows(rows) {
  return rows.map((row, sortOrder) => ({ ...row, sortOrder }))
}

async function replaceProduct(product, categoryId, sellerId) {
  const scalarData = {
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    categoryId,
    sellerId,
    basePrice: product.basePrice,
    salePrice: product.salePrice,
    effectivePrice: product.effectivePrice,
    stockQuantity: product.stockQuantity,
    lowStockThreshold: 5,
    currency: 'BDT',
    isActive: true,
    isFeatured: product.isFeatured,
    isNew: true,
    isBestSeller: product.isBestSeller,
    isPreOrder: false,
    tags: product.tags,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    rating: product.rating,
    reviewCount: product.reviewCount,
    soldCount: product.soldCount,
  }

  const existing = await db.product.findUnique({
    where: { slug: product.slug },
    select: { id: true },
  })

  if (existing) {
    await db.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: existing.id } })
      await tx.productVariant.deleteMany({ where: { productId: existing.id } })
      await tx.productAttribute.deleteMany({ where: { productId: existing.id } })
      await tx.productSpec.deleteMany({ where: { productId: existing.id } })
      await tx.product.update({ where: { id: existing.id }, data: scalarData })
      await tx.productImage.createMany({
        data: product.images.map((image) => ({ ...image, productId: existing.id })),
      })
      await tx.productAttribute.createMany({
        data: toCreateManyRows(product.attributes).map((attribute) => ({ ...attribute, productId: existing.id })),
      })
      await tx.productSpec.createMany({
        data: toCreateManyRows(product.specifications).map((spec) => ({ ...spec, productId: existing.id })),
      })
      for (const variant of product.variants) {
        await tx.productVariant.create({
          data: {
            productId: existing.id,
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            salePrice: variant.salePrice,
            stockQuantity: variant.stockQuantity,
            image: variant.image,
            isActive: variant.isActive,
            sortOrder: variant.sortOrder,
            options: { create: variant.options },
          },
        })
      }
    })
    return
  }

  await db.product.create({
    data: {
      ...scalarData,
      images: { create: product.images },
      attributes: { create: toCreateManyRows(product.attributes) },
      specifications: { create: toCreateManyRows(product.specifications) },
      variants: {
        create: product.variants.map((variant) => ({
          name: variant.name,
          sku: variant.sku,
          price: variant.price,
          salePrice: variant.salePrice,
          stockQuantity: variant.stockQuantity,
          image: variant.image,
          isActive: variant.isActive,
          sortOrder: variant.sortOrder,
          options: { create: variant.options },
        })),
      },
    },
  })
}

async function main() {
  const seller = await db.seller.findFirst({
    where: { isFirstParty: true, status: 'APPROVED' },
    select: { id: true },
  })

  if (!seller) throw new Error('No approved first-party seller found.')

  for (const product of DEMO_PRODUCTS) {
    const category = await db.category.findUnique({
      where: { slug: product.categorySlug },
      select: { id: true },
    })

    if (!category) throw new Error(`Missing category: ${product.categorySlug}`)
    await replaceProduct(product, category.id, seller.id)
    console.log(`Seeded ${product.slug}`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await db.$disconnect()
  })
