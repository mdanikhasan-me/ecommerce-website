import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  createBuyerOrder,
  type BuyerOrderDb,
} from '@/backend/orders/buyer-order-create'
import { parseBuyerOrderPayload } from '@/backend/orders/buyer-validation'

const availablePaymentMethods = new Set(['CASH_ON_DELIVERY'])

function parseValidOrder(overrides: Record<string, unknown> = {}) {
  const parsed = parseBuyerOrderPayload({
    paymentMethod: 'CASH_ON_DELIVERY',
    items: [
      {
        productId: 'product_1',
        quantity: 2,
        imageUrl: '/assets/products/product.jpg',
      },
    ],
    address: {
      fullName: 'Test Buyer',
      phone: '01712345678',
      addressLine1: 'House 12',
      city: 'Dhaka',
      district: 'Dhaka',
      division: 'Dhaka',
    },
    ...overrides,
  }, availablePaymentMethods)

  assert.equal(parsed.success, true)
  if (!parsed.success) throw new Error(parsed.error)
  return parsed.data
}

function createOrderDb(overrides: {
  products?: Array<Record<string, unknown>>
  variants?: Array<Record<string, unknown>>
  coupon?: Record<string, unknown> | null
  productUpdateCount?: number
  variantUpdateCount?: number
  userCouponCount?: number
} = {}) {
  const calls: Record<string, unknown[]> = {
    productFindMany: [],
    variantFindMany: [],
    couponFindUnique: [],
    orderCount: [],
    productUpdateMany: [],
    variantUpdateMany: [],
    addressCreate: [],
    orderCreate: [],
    couponUpdate: [],
    paymentCreate: [],
    notificationCreate: [],
  }

  const products = overrides.products ?? [{
    id: 'product_1',
    categoryId: 'category_1',
    name: 'Test Product',
    sku: 'SKU-1',
    basePrice: 100,
    salePrice: null,
    isActive: true,
    stockQuantity: 10,
  }]

  const database: BuyerOrderDb = {
    product: {
      findMany: async (args) => {
        calls.productFindMany.push(args)
        return products as any
      },
    },
    productVariant: {
      findMany: async (args) => {
        calls.variantFindMany.push(args)
        return (overrides.variants ?? []) as any
      },
    },
    coupon: {
      findUnique: async (args) => {
        calls.couponFindUnique.push(args)
        return (overrides.coupon ?? null) as any
      },
    },
    order: {
      count: async (args) => {
        calls.orderCount.push(args)
        return overrides.userCouponCount ?? 0
      },
    },
    $transaction: async (callback) => callback({
      product: {
        updateMany: async (args) => {
          calls.productUpdateMany.push(args)
          return { count: overrides.productUpdateCount ?? 1 }
        },
      },
      productVariant: {
        updateMany: async (args) => {
          calls.variantUpdateMany.push(args)
          return { count: overrides.variantUpdateCount ?? 1 }
        },
      },
      address: {
        create: async (args) => {
          calls.addressCreate.push(args)
          return { id: 'address_1' }
        },
      },
      order: {
        create: async (args) => {
          calls.orderCreate.push(args)
          return { id: 'order_1', orderNumber: 'BLB-TEST-001' }
        },
      },
      coupon: {
        update: async (args) => {
          calls.couponUpdate.push(args)
          return {}
        },
      },
      payment: {
        create: async (args) => {
          calls.paymentCreate.push(args)
          return {}
        },
      },
    }),
    notification: {
      create: async (args) => {
        calls.notificationCreate.push(args)
        return {}
      },
    },
  }

  return { database, calls }
}

describe('mocked authenticated buyer order creation coverage', () => {
  it('returns existing success shape without trusting client totals or unsafe image URLs', async () => {
    const parsed = parseValidOrder({
      subtotal: 1,
      shippingFee: 1,
      total: 1,
      items: [{ productId: 'product_1', quantity: 2, imageUrl: 'javascript:alert(1)' }],
    })
    const { database, calls } = createOrderDb()
    const soldCountInputs: string[][] = []

    const result = await createBuyerOrder({
      database,
      userId: 'user_1',
      payload: parsed,
      orderNumber: 'BLB-TEST-001',
      syncSoldCounts: async (ids) => {
        soldCountInputs.push(ids)
      },
    })

    assert.deepEqual(result, {
      success: true,
      payload: {
        success: true,
        orderId: 'order_1',
        orderNumber: 'BLB-TEST-001',
        subtotal: 200,
        shippingFee: 60,
        discount: 0,
        total: 260,
      },
    })
    assert.deepEqual(soldCountInputs, [['product_1']])
    const orderCreate = calls.orderCreate[0] as { data: any }
    assert.equal(orderCreate.data.userId, 'user_1')
    assert.equal(orderCreate.data.total, 260)
    assert.equal(orderCreate.data.items.create[0].imageUrl, null)
  })

  it('returns safe product unavailable and stock errors without mutations', async () => {
    const productMissing = createOrderDb({ products: [] })
    const missingResult = await createBuyerOrder({
      database: productMissing.database,
      userId: 'user_1',
      payload: parseValidOrder(),
      orderNumber: 'BLB-TEST-002',
      syncSoldCounts: async () => {},
    })

    assert.deepEqual(missingResult, {
      success: false,
      status: 400,
      error: 'One or more products are no longer available',
    })
    assert.equal(productMissing.calls.orderCreate.length, 0)

    const lowStock = createOrderDb({
      products: [{
        id: 'product_1',
        categoryId: 'category_1',
        name: 'Low Stock Product',
        sku: 'SKU-LOW',
        basePrice: 100,
        salePrice: null,
        isActive: true,
        stockQuantity: 1,
      }],
    })
    const lowStockResult = await createBuyerOrder({
      database: lowStock.database,
      userId: 'user_1',
      payload: parseValidOrder(),
      orderNumber: 'BLB-TEST-003',
      syncSoldCounts: async () => {},
    })

    assert.deepEqual(lowStockResult, {
      success: false,
      status: 400,
      error: 'Insufficient stock for "Low Stock Product"',
    })
    assert.equal(lowStock.calls.orderCreate.length, 0)
  })

  it('returns safe coupon and transaction-race errors with existing response text', async () => {
    const invalidCoupon = createOrderDb({ coupon: null })
    const invalidCouponResult = await createBuyerOrder({
      database: invalidCoupon.database,
      userId: 'user_1',
      payload: parseValidOrder({ couponCode: 'SAVE500' }),
      orderNumber: 'BLB-TEST-004',
      syncSoldCounts: async () => {},
    })

    assert.deepEqual(invalidCouponResult, {
      success: false,
      status: 400,
      error: 'Invalid coupon code',
    })
    assert.equal(invalidCoupon.calls.orderCreate.length, 0)

    const race = createOrderDb({ productUpdateCount: 0 })
    const raceResult = await createBuyerOrder({
      database: race.database,
      userId: 'user_1',
      payload: parseValidOrder(),
      orderNumber: 'BLB-TEST-005',
      syncSoldCounts: async () => {},
    })

    assert.deepEqual(raceResult, {
      success: false,
      status: 409,
      error: 'Insufficient stock for "Test Product"',
      logCode: 'insufficient_stock',
    })
    assert.equal(race.calls.orderCreate.length, 0)
  })

  it('applies a mocked coupon while preserving user-scoped usage checks', async () => {
    const { database, calls } = createOrderDb({
      coupon: {
        id: 'coupon_1',
        isActive: true,
        startsAt: null,
        expiresAt: null,
        usageLimit: null,
        usageCount: 0,
        minOrderAmount: 100,
        productIds: ['product_1'],
        categoryIds: [],
        perUserLimit: 2,
        type: 'FIXED',
        value: 25,
        maxDiscount: null,
      },
    })

    const result = await createBuyerOrder({
      database,
      userId: 'user_1',
      payload: parseValidOrder({ couponCode: 'SAVE25' }),
      orderNumber: 'BLB-TEST-006',
      syncSoldCounts: async () => {},
    })

    assert.equal(result.success, true)
    if (result.success) {
      assert.equal(result.payload.discount, 25)
      assert.equal(result.payload.total, 235)
    }
    assert.deepEqual(calls.orderCount[0], {
      where: { userId: 'user_1', couponId: 'coupon_1', status: { not: 'CANCELLED' } },
    })
    assert.equal(calls.couponUpdate.length, 1)
  })
})
