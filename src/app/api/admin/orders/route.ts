import { PaymentMethod } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

import { logAdminAudit, requireAdminSession } from '@/backend/admin/admin-utils'
import { parsePublicId } from '@/backend/api/public-input'
import { revalidateProductSurfacesByIds } from '@/backend/catalog/storefront-revalidation'
import { syncProductSoldCounts } from '@/backend/commerce-stats'
import { db } from '@/backend/database'
import { createBuyerOrder, type BuyerOrderDb } from '@/backend/orders/buyer-order-create'
import { parseBuyerOrderPayload } from '@/backend/orders/buyer-validation'
import { rateLimit } from '@/backend/security/rate-limit'
import { JSON_BODY_LIMITS, readBoundedJsonBody } from '@/backend/security/request-body'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { logSecurityEvent } from '@/backend/security/security-log'
import { generateOrderNumber } from '@/backend/utils'

const ADMIN_PAYMENT_METHODS = new Set<string>([PaymentMethod.CASH_ON_DELIVERY])

function json(data: unknown, status: number) {
  return NextResponse.json(data, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function POST(request: NextRequest) {
  try {
    const blocked = protectMutationRequest(request)
    if (blocked) return blocked

    const session = await requireAdminSession()
    const limited = rateLimit(request, {
      key: `admin:orders:create:${session.user.id}`,
      limit: 20,
      windowMs: 60_000,
    })
    if (limited) return limited

    const body = await readBoundedJsonBody(request, JSON_BODY_LIMITS.collection)
    if (!body.success) return body.response
    if (!isRecord(body.data)) {
      return json({ error: 'Invalid order request' }, 400)
    }

    const customerId = parsePublicId(body.data.userId)
    if (!customerId) {
      return json({ error: 'Select a valid customer' }, 400)
    }

    const parsedPayload = parseBuyerOrderPayload(body.data, ADMIN_PAYMENT_METHODS)
    if (!parsedPayload.success) {
      return json({ error: parsedPayload.error }, 400)
    }

    const customer = await db.user.findFirst({
      where: { id: customerId, role: 'CUSTOMER', isActive: true },
      select: { id: true },
    })
    if (!customer) return json({ error: 'Select an active customer account' }, 404)

    const productIds = [...new Set(parsedPayload.data.items.map((item) => item.productId))]
    const variantIds = parsedPayload.data.items
      .map((item) => item.variantId)
      .filter((id): id is string => Boolean(id))
    const [productImages, variantImages] = await Promise.all([
      db.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          images: {
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
            take: 1,
            select: { url: true },
          },
        },
      }),
      variantIds.length
        ? db.productVariant.findMany({
            where: { id: { in: variantIds } },
            select: { id: true, image: true },
          })
        : Promise.resolve([]),
    ])
    const productImageMap = new Map(productImages.map((product) => [product.id, product.images[0]?.url ?? null]))
    const variantImageMap = new Map(variantImages.map((variant) => [variant.id, variant.image]))
    const payload = {
      ...parsedPayload.data,
      items: parsedPayload.data.items.map((item) => ({
        ...item,
        imageUrl: (item.variantId ? variantImageMap.get(item.variantId) : null) ?? productImageMap.get(item.productId) ?? null,
      })),
    }

    const result = await createBuyerOrder({
      database: db as unknown as BuyerOrderDb,
      userId: customerId,
      payload,
      generateOrderNumber,
      syncSoldCounts: syncProductSoldCounts,
    })

    if (!result.success) {
      return json({ error: result.error }, result.status)
    }

    await Promise.all([
      revalidateProductSurfacesByIds(payload.items.map((item) => item.productId)).catch(() => undefined),
      logAdminAudit({
        userId: session.user.id,
        action: 'CREATE',
        entity: 'Order',
        entityId: result.payload.orderId,
        newValues: {
          orderNumber: result.payload.orderNumber,
          customerId,
          total: result.payload.total,
          itemCount: payload.items.length,
          source: 'admin_manual_order',
        },
      }),
    ])

    return json(result.payload, 201)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return json({ error: 'Administrator access required' }, 403)
    }
    const insufficientStock = error instanceof Error && error.message.startsWith('INSUFFICIENT_STOCK:')
    logSecurityEvent({
      type: 'server_error',
      severity: insufficientStock ? 'warn' : 'error',
      route: request.nextUrl.pathname,
      method: request.method,
      statusCode: insufficientStock ? 409 : 500,
      errorCode: insufficientStock ? 'insufficient_stock' : 'admin_order_creation_failed',
      metadata: { feature: 'admin_manual_order' },
    })

    if (insufficientStock) {
      return json({ error: `Insufficient stock for "${(error as Error).message.split(':').slice(1).join(':')}"` }, 409)
    }
    return json({ error: 'Could not create the order' }, 500)
  }
}
