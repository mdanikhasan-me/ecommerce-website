import { NextRequest, NextResponse } from 'next/server'
import { OrderStatus, type Prisma } from '@prisma/client'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { syncProductSoldCounts } from '@/backend/commerce-stats'
import { getBuyerVisibleProductWhere } from '@/backend/catalog/product-visibility'
import { generateOrderNumber } from '@/backend/utils'
import { PAYMENT_GATEWAYS } from '@/backend/config/payment'
import { rateLimit } from '@/backend/security/rate-limit'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { logSecurityEvent } from '@/backend/security/security-log'
import { parseBuyerOrderPayload } from '@/backend/orders/buyer-validation'

const AVAILABLE_PAYMENT_METHODS = new Set(
  PAYMENT_GATEWAYS.filter((gateway) => gateway.isAvailable).map((gateway) => gateway.id)
)

function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && Object.values(OrderStatus).includes(value as OrderStatus)
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
  const sp = req.nextUrl.searchParams
  const page = Math.max(1, parseInt(sp.get('page') ?? '1'))
  const limit = 20
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

const SHIPPING_FEE_FLAT = 60
const FREE_SHIPPING_THRESHOLD = 2000

function computeShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE_FLAT
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

    const { items: orderItems, address: safeAddress, paymentMethod, notes, couponCode } = parsedPayload.data

    // Fetch products + variants server-side; ignore client-supplied prices
    const productIds = Array.from(new Set(orderItems.map((item) => item.productId)))
    const variantIds = Array.from(
      new Set(orderItems.map((item) => item.variantId).filter((id): id is string => Boolean(id))),
    )

    const [products, variants] = await Promise.all([
      db.product.findMany({
        where: getBuyerVisibleProductWhere({ id: { in: productIds } }),
        select: { id: true, categoryId: true, name: true, sku: true, basePrice: true, salePrice: true, isActive: true, stockQuantity: true },
      }),
      variantIds.length
        ? db.productVariant.findMany({
            where: { id: { in: variantIds } },
            select: { id: true, productId: true, name: true, price: true, salePrice: true, stockQuantity: true },
          })
        : Promise.resolve([]),
    ])

    const productMap = new Map(products.map((p) => [p.id, p]))
    const variantMap = new Map(variants.map((v) => [v.id, v]))

    type PreparedItem = {
      productId: string
      variantId: string | null
      productName: string
      productSku: string
      categoryId: string
      variantName: string | null
      price: number
      quantity: number
      total: number
      imageUrl: string | null
    }

    const preparedItems: PreparedItem[] = []
    let subtotal = 0

    for (const raw of orderItems) {
      const qty = raw.quantity

      const product = productMap.get(raw.productId)
      if (!product || !product.isActive) {
        return NextResponse.json({ error: 'One or more products are no longer available' }, { status: 400 })
      }
      if (product.stockQuantity < qty) {
        return NextResponse.json({ error: `Insufficient stock for "${product.name}"` }, { status: 400 })
      }

      let unitPrice = product.salePrice ?? product.basePrice
      let variantId: string | null = null
      let variantName: string | null = null

      if (raw.variantId) {
        const variant = variantMap.get(raw.variantId)
        if (!variant || variant.productId !== product.id) {
          return NextResponse.json({ error: 'Invalid product variant' }, { status: 400 })
        }
        if (variant.stockQuantity < qty) {
          return NextResponse.json({ error: `Insufficient stock for variant "${variant.name}"` }, { status: 400 })
        }
        variantId = variant.id
        variantName = variant.name
        unitPrice = variant.salePrice ?? variant.price ?? unitPrice
      }

      const lineTotal = unitPrice * qty
      subtotal += lineTotal
      preparedItems.push({
        productId: product.id,
        variantId,
        productName: product.name,
        productSku: product.sku,
        categoryId: product.categoryId,
        variantName,
        price: unitPrice,
        quantity: qty,
        total: lineTotal,
        imageUrl: raw.imageUrl,
      })
    }

    // Validate coupon server-side (if provided)
    let discount = 0
    let couponId: string | null = null
    const code = couponCode ?? ''
    if (code) {
      const coupon = await db.coupon.findUnique({ where: { code } })
      const now = new Date()
      if (!coupon || !coupon.isActive) {
        return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 })
      }
      if (coupon.startsAt && coupon.startsAt > now) {
        return NextResponse.json({ error: 'Coupon is not yet active' }, { status: 400 })
      }
      if (coupon.expiresAt && coupon.expiresAt < now) {
        return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 })
      }
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
      }
      if (subtotal < coupon.minOrderAmount) {
        return NextResponse.json({ error: `Minimum order amount is Tk ${coupon.minOrderAmount.toLocaleString('en-BD')}` }, { status: 400 })
      }

      const productIdSet = new Set(coupon.productIds)
      const categoryIdSet = new Set(coupon.categoryIds)
      const hasRestrictions = productIdSet.size > 0 || categoryIdSet.size > 0
      const eligibleSubtotal = hasRestrictions
        ? preparedItems.reduce((sum, item) => {
            return productIdSet.has(item.productId) || categoryIdSet.has(item.categoryId)
              ? sum + item.total
              : sum
          }, 0)
        : subtotal

      if (hasRestrictions && eligibleSubtotal <= 0) {
        return NextResponse.json({ error: 'This coupon does not apply to the items in your cart' }, { status: 400 })
      }

      if (coupon.perUserLimit) {
        const userUsage = await db.order.count({
          where: { userId: session.user.id, couponId: coupon.id, status: { not: 'CANCELLED' } },
        })
        if (userUsage >= coupon.perUserLimit) {
          return NextResponse.json({ error: 'You have reached the usage limit for this coupon' }, { status: 400 })
        }
      }

      if (coupon.type === 'PERCENTAGE') {
        discount = (eligibleSubtotal * coupon.value) / 100
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
      } else if (coupon.type === 'FIXED') {
        discount = Math.min(coupon.value, eligibleSubtotal)
      }
      couponId = coupon.id
    }

    const shippingFee = computeShipping(subtotal)
    const total = Math.max(0, subtotal - discount + shippingFee)

    const userId = session.user.id

    const orderNumber = generateOrderNumber()

    // Atomic: create order + decrement stock + increment coupon usage
    const order = await db.$transaction(async (tx) => {
      // Re-check + decrement stock using conditional update
      for (const line of preparedItems) {
        const updated = await tx.product.updateMany({
          where: getBuyerVisibleProductWhere({
            id: line.productId,
            stockQuantity: { gte: line.quantity },
          }),
          data: {
            stockQuantity: { decrement: line.quantity },
          },
        })
        if (updated.count === 0) {
          throw new Error(`INSUFFICIENT_STOCK:${line.productName}`)
        }
        if (line.variantId) {
          const vUpdated = await tx.productVariant.updateMany({
            where: { id: line.variantId, stockQuantity: { gte: line.quantity } },
            data: { stockQuantity: { decrement: line.quantity } },
          })
          if (vUpdated.count === 0) {
            throw new Error(`INSUFFICIENT_STOCK:${line.productName}`)
          }
        }
      }

      const createdAddress = await tx.address.create({
        data: { userId: userId!, ...safeAddress },
      })

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: userId!,
          addressId: createdAddress.id,
          subtotal,
          shippingFee,
          discount,
          total,
          paymentMethod,
          couponId: couponId ?? undefined,
          notes,
          isGuestOrder: false,
          items: {
            create: preparedItems.map(({ categoryId, ...line }) => line),
          },
          statusHistory: { create: [{ status: 'PENDING', note: 'Order placed' }] },
        },
      })

      if (couponId) {
        await tx.coupon.update({ where: { id: couponId }, data: { usageCount: { increment: 1 } } })
      }

      await tx.payment.create({
        data: {
          orderId: created.id,
          amount: total,
          method: paymentMethod,
          status: 'PENDING',
        },
      })

      return created
    })

    await syncProductSoldCounts(preparedItems.map((line) => line.productId))

    await db.notification.create({
      data: {
        userId,
        type: 'ORDER',
        title: 'Order Placed Successfully',
        message: `Your order ${order.orderNumber} has been placed and is being processed.`,
        link: `/account/orders/${order.id}`,
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, orderId: order.id, orderNumber: order.orderNumber, subtotal, shippingFee, discount, total }, { status: 201 })
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
