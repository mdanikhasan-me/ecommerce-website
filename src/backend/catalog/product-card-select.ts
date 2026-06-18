import { Prisma } from '@prisma/client'

export const productCardSelect = {
  id: true,
  sku: true,
  name: true,
  slug: true,
  basePrice: true,
  salePrice: true,
  rating: true,
  reviewCount: true,
  soldCount: true,
  stockQuantity: true,
  isFeatured: true,
  isNew: true,
  isBestSeller: true,
  isPreOrder: true,
  images: {
    where: { isPrimary: true },
    take: 1,
    select: { url: true, isPrimary: true },
  },
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ProductSelect
