import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { SellerStatus } from '@prisma/client'

import {
  PRODUCT_LIFECYCLE_CONTRACT,
  buyerVisibleProductBaseWhere,
  getBuyerVisibleProductWhere,
  getLegacyProductLifecycleState,
  getProductAvailabilityForJsonLd,
  getPublicProductDetailWhere,
  getSitemapVisibleProductWhere,
  isProductBuyerVisible,
} from '@/backend/catalog/product-visibility'

describe('product visibility policy', () => {
  it('defines active as the only buyer-visible lifecycle state', () => {
    assert.equal(PRODUCT_LIFECYCLE_CONTRACT.ACTIVE.buyerVisible, true)
    assert.equal(PRODUCT_LIFECYCLE_CONTRACT.ACTIVE.sitemapEligible, true)
    assert.equal(PRODUCT_LIFECYCLE_CONTRACT.DRAFT.buyerVisible, false)
    assert.equal(PRODUCT_LIFECYCLE_CONTRACT.REJECTED.sitemapEligible, false)
    assert.equal(PRODUCT_LIFECYCLE_CONTRACT.DISCONTINUED.seoBehavior, 'future-410-or-redirect')
    assert.equal(PRODUCT_LIFECYCLE_CONTRACT.DELETED.merchantFeedEligible, false)
  })

  it('builds buyer-visible product filters from one shared base', () => {
    assert.deepEqual(buyerVisibleProductBaseWhere, {
      isActive: true,
      category: { isActive: true },
      seller: { status: SellerStatus.APPROVED },
    })

    assert.deepEqual(getBuyerVisibleProductWhere({ isFeatured: true }), {
      AND: [
        buyerVisibleProductBaseWhere,
        { isFeatured: true },
      ],
    })
  })

  it('uses the same policy for sitemap and product detail visibility', () => {
    assert.deepEqual(getSitemapVisibleProductWhere({ isNew: true }), {
      AND: [
        buyerVisibleProductBaseWhere,
        { isNew: true },
      ],
    })

    assert.deepEqual(getPublicProductDetailWhere('test-phone'), {
      AND: [
        buyerVisibleProductBaseWhere,
        { slug: 'test-phone' },
      ],
    })
  })

  it('evaluates loaded product records with category and seller state', () => {
    assert.equal(
      isProductBuyerVisible({
        isActive: true,
        category: { isActive: true },
        seller: { status: SellerStatus.APPROVED },
      }),
      true,
    )

    assert.equal(
      isProductBuyerVisible({
        isActive: true,
        category: { isActive: true },
        seller: { status: SellerStatus.PENDING },
      }),
      false,
    )

    assert.equal(
      isProductBuyerVisible({
        isActive: true,
        category: { isActive: false },
        seller: { status: SellerStatus.APPROVED },
      }),
      false,
    )
  })

  it('keeps out-of-stock active products visible but marks JSON-LD availability', () => {
    assert.equal(getLegacyProductLifecycleState({ isActive: true }), 'ACTIVE')
    assert.equal(getLegacyProductLifecycleState({ isActive: false }), 'INACTIVE')
    assert.equal(getProductAvailabilityForJsonLd({ stockQuantity: 5 }), 'https://schema.org/InStock')
    assert.equal(getProductAvailabilityForJsonLd({ stockQuantity: 0 }), 'https://schema.org/OutOfStock')
    assert.equal(getProductAvailabilityForJsonLd({}), 'https://schema.org/InStock')
    assert.equal(
      getProductAvailabilityForJsonLd({ lifecycleState: 'DISCONTINUED', stockQuantity: 5 }),
      'https://schema.org/Discontinued',
    )
  })
})
