import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  createBuyerReturnRequest,
  type BuyerReturnDb,
} from '@/backend/orders/buyer-return-request'
import { parseBuyerReturnRequestPayload } from '@/backend/orders/buyer-validation'

function parseReturnPayload(overrides: Record<string, unknown> = {}) {
  const parsed = parseBuyerReturnRequestPayload({
    orderId: 'order_1',
    reason: 'Wrong item',
    description: 'The delivered item does not match the listing.',
    ...overrides,
  })

  assert.equal(parsed.success, true)
  if (!parsed.success) throw new Error(parsed.error)
  return parsed.data
}

function createReturnDb(order: Record<string, unknown> | null) {
  const calls: Record<string, unknown[]> = {
    orderFindFirst: [],
    returnCreate: [],
    orderUpdate: [],
  }

  const database: BuyerReturnDb = {
    order: {
      findFirst: async (args) => {
        calls.orderFindFirst.push(args)
        return order as any
      },
      update: async (args) => {
        calls.orderUpdate.push(args)
        return {}
      },
    },
    returnRequest: {
      create: async (args) => {
        calls.returnCreate.push(args)
        return { id: 'return_1', status: 'REQUESTED' }
      },
    },
  }

  return { database, calls }
}

describe('mocked authenticated buyer return request coverage', () => {
  it('keeps return lookup scoped to the authenticated buyer', async () => {
    const { database, calls } = createReturnDb(null)

    const result = await createBuyerReturnRequest({
      database,
      userId: 'user_1',
      payload: parseReturnPayload(),
      revalidate: () => {},
    })

    assert.deepEqual(result, { success: false, status: 404, error: 'Order not found' })
    assert.deepEqual(calls.orderFindFirst[0], {
      where: { id: 'order_1', userId: 'user_1' },
      include: {
        returnRequest: true,
        statusHistory: {
          where: { status: 'DELIVERED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })
    assert.equal(calls.returnCreate.length, 0)
  })

  it('returns safe eligibility errors without leaking order details', async () => {
    const existingReturn = createReturnDb({
      id: 'order_1',
      status: 'DELIVERED',
      deliveredAt: new Date(),
      returnRequest: { id: 'return_existing' },
      statusHistory: [],
    })

    const existingResult = await createBuyerReturnRequest({
      database: existingReturn.database,
      userId: 'user_1',
      payload: parseReturnPayload(),
      revalidate: () => {},
    })

    assert.deepEqual(existingResult, {
      success: false,
      status: 409,
      error: 'A return request already exists for this order',
    })
    assert.equal(existingReturn.calls.returnCreate.length, 0)

    const notDelivered = createReturnDb({
      id: 'order_1',
      status: 'SHIPPED',
      deliveredAt: null,
      returnRequest: null,
      statusHistory: [],
    })

    const notDeliveredResult = await createBuyerReturnRequest({
      database: notDelivered.database,
      userId: 'user_1',
      payload: parseReturnPayload(),
      revalidate: () => {},
    })

    assert.deepEqual(notDeliveredResult, {
      success: false,
      status: 403,
      error: 'Returns are available only after delivery',
    })
    assert.equal(notDelivered.calls.returnCreate.length, 0)
  })

  it('creates a mocked return request with existing success shape and revalidation paths', async () => {
    const deliveredAt = new Date()
    const { database, calls } = createReturnDb({
      id: 'order_1',
      status: 'DELIVERED',
      deliveredAt,
      returnRequest: null,
      statusHistory: [{ status: 'DELIVERED', createdAt: deliveredAt }],
    })
    const revalidated: string[] = []

    const result = await createBuyerReturnRequest({
      database,
      userId: 'user_1',
      payload: parseReturnPayload({ description: '' }),
      revalidate: (path) => {
        revalidated.push(path)
      },
    })

    assert.deepEqual(result, {
      success: true,
      payload: { request: { id: 'return_1', status: 'REQUESTED' } },
    })
    assert.deepEqual(calls.returnCreate[0], {
      data: {
        orderId: 'order_1',
        userId: 'user_1',
        reason: 'Wrong item',
        description: null,
        images: [],
      },
    })
    assert.deepEqual(calls.orderUpdate[0], {
      where: { id: 'order_1' },
      data: {
        status: 'RETURN_REQUESTED',
        statusHistory: {
          create: {
            status: 'RETURN_REQUESTED',
            note: 'Return requested by customer',
          },
        },
      },
    })
    assert.deepEqual(revalidated, [
      '/account/orders/order_1',
      '/account/orders',
      '/admin/returns',
      '/admin/orders',
    ])
  })
})
