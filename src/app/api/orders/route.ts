import { NextRequest, NextResponse } from 'next/server'
import { OrderStatus, type Prisma } from '@prisma/client'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { syncProductSoldCounts } from '@/backend/commerce-stats'
import { generateOrderNumber } from '@/backend/utils'
import { PAYMENT_GATEWAYS } from '@/backend/config/payment'
import { rateLimit } from '@/backend/security/rate-limit'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { logSecurityEvent } from '@/backend/security/security-log'
import { parseBuyerOrderPayload } from '@/backend/orders/buyer-validation'
import { createBuyerOrder, type BuyerOrderDb } from '@/backend/orders/buyer-order-create'
import { ORDER_LIST_PAGE_SIZE, parseOrderListPage } from '@/backend/orders/buyer-order-list'

const AVAILABLE_PAYMENT_METHODS = new Set(
  PAYMENT_GATEWAYS.filter((gateway) => gateway.isAvailable).map((gateway) => gateway.id)
)

function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && Object.values(OrderStatus).includes(value as OrderStatus)
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true },
  })
  const isAdmin = Boolean(currentUser?.isActive && ['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role))
  const sp = req.nextUrl.searchParams
  const page = parseOrderListPage(sp.get('page'))
  const limit = ORDER_LIST_PAGE_SIZE
  const skip = (page - 1) * limit

  const where: Prisma.OrderWhereInput = isAdmin ? {} : { userId: session.user.id }
  const status = sp.get('status')
  if (isOrderStatus(status)) where.status = status

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { take: 2, select: { productName: true, imageUrl: true, quantity: true, total: true } },
        address: { select: { city: true, division: true } },
      },
    }),
    db.order.count({ where }),
  ])

  return NextResponse.json({ items: orders, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    const limited = rateLimit(req, { key: 'orders:create', limit: 10, windowMs: 60_000 })
    if (limited) return limited

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Please sign in or create an account before placing an order' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid order request' }, { status: 400 })
    }

    const parsedPayload = parseBuyerOrderPayload(body, AVAILABLE_PAYMENT_METHODS)
    if (!parsedPayload.success) {
      return NextResponse.json({ error: parsedPayload.error }, { status: 400 })
    }

    const orderResult = await createBuyerOrder({
      database: db as unknown as BuyerOrderDb,
      userId: session.user.id,
      payload: parsedPayload.data,
      generateOrderNumber,
      syncSoldCounts: syncProductSoldCounts,
    })

    if (!orderResult.success) {
      if (orderResult.logCode === 'insufficient_stock') {
        logSecurityEvent({
          type: 'server_error',
          severity: 'warn',
          route: req.nextUrl.pathname,
          method: req.method,
          statusCode: orderResult.status,
          errorCode: 'insufficient_stock',
          metadata: {
            feature: 'order_creation',
          },
        })
      }
      return NextResponse.json({ error: orderResult.error }, { status: orderResult.status })
    }

    return NextResponse.json(orderResult.payload, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.startsWith('INSUFFICIENT_STOCK:')) {
      logSecurityEvent({
        type: 'server_error',
        severity: 'warn',
        route: req.nextUrl.pathname,
        method: req.method,
        statusCode: 409,
        errorCode: 'insufficient_stock',
        metadata: {
          feature: 'order_creation',
        },
      })
      return NextResponse.json({ error: `Insufficient stock for "${error.message.split(':')[1]}"` }, { status: 409 })
    }
    logSecurityEvent({
      type: 'server_error',
      severity: 'error',
      route: req.nextUrl.pathname,
      method: req.method,
      statusCode: 500,
      errorCode: 'order_creation_failed',
      metadata: {
        feature: 'order_creation',
      },
    })
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
