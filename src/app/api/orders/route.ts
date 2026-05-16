import { NextRequest, NextResponse } from 'next/server'
import { OrderStatus, PaymentMethod, type Prisma } from '@prisma/client'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { syncProductSoldCounts } from '@/backend/commerce-stats'
import { generateOrderNumber } from '@/backend/utils'
import { PAYMENT_GATEWAYS } from '@/backend/config/payment'
import { rateLimit } from '@/backend/security/rate-limit'

const AVAILABLE_PAYMENT_METHODS = new Set(
  PAYMENT_GATEWAYS.filter((gateway) => gateway.isAvailable).map((gateway) => gateway.id)
)

type OrderRequestItem = {
  productId?: unknown
  variantId?: unknown
  quantity?: unknown
  imageUrl?: unknown
}

type OrderRequestAddress = {
  fullName?: unknown
  phone?: unknown
  addressLine1?: unknown
  addressLine2?: unknown
  city?: unknown
  district?: unknown
  division?: unknown
  postalCode?: unknown
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === 'string' && Object.values(PaymentMethod).includes(value as PaymentMethod)
}

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

type ActiveFlashSaleItem = {
  id: string
  productId: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  maxQuantity: number | null
  soldQuantity: number
}

function applyFlashSaleDiscount(unitPrice: number, item: ActiveFlashSaleItem) {
  if (item.discountType === 'PERCENTAGE') {
    return Math.max(0, unitPrice - (unitPrice * item.discountValue) / 100)
  }

  return Math.max(0, unitPrice - item.discountValue)
}

function sanitizeString(value: unknown, max: number) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, { key: 'orders:create', limit: 10, windowMs: 60_000 })
    if (limited) return limited

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Please sign in or create an account before placing an order' }, { status: 401 })
    }

    const body = await req.json()
    const { items, address, paymentMethod, notes, couponCode } = body

    if (!isPaymentMethod(paymentMethod) || !AVAILABLE_PAYMENT_METHODS.has(paymentMethod)) {
      return NextResponse.json(
        { error: 'This payment method is not configured yet. Please use an active checkout method.' },
        { status: 400 }
      )
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const orderItems = items as OrderRequestItem[]
    const orderAddress = address as OrderRequestAddress | null | undefined

    if (!orderAddress || !orderAddress.fullName || !orderAddress.phone || !orderAddress.addressLine1 || !orderAddress.city || !orderAddress.district || !orderAddress.division) {
      return NextResponse.json({ error: 'Delivery address is incomplete' }, { status: 400 })
    }

    // Fetch products + variants server-side; ignore client-supplied prices
    const productIds = Array.from(new Set(orderItems.map((item) => String(item.productId ?? '')).filter(Boolean)))
    const variantIds = Array.from(new Set(orderItems.map((item) => item.variantId).filter(Boolean).map(String)))

    const now = new Date()
    const [products, variants, flashSaleItems] = await Promise.all([
      db.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, categoryId: true, name: true, sku: true, basePrice: true, salePrice: true, isActive: true, stockQuantity: true },
      }),
      variantIds.length
        ? db.productVariant.findMany({
            where: { id: { in: variantIds } },
            select: { id: true, productId: true, name: true, price: true, salePrice: true, stockQuantity: true },
          })
        : Promise.resolve([]),
      db.flashSaleItem.findMany({
        where: {
          productId: { in: productIds },
          flashSale: { isActive: true, startsAt: { lte: now }, endsAt: { gt: now } },
        },
        select: {
          id: true,
          productId: true,
          discountType: true,
          discountValue: true,
          maxQuantity: true,
          soldQuantity: true,
        },
      }),
    ])

    const productMap = new Map(products.map((p) => [p.id, p]))
    const variantMap = new Map(variants.map((v) => [v.id, v]))
    const flashSaleMap = new Map<string, ActiveFlashSaleItem>()
    for (const item of flashSaleItems) {
      const existing = flashSaleMap.get(item.productId)
      if (!existing || applyFlashSaleDiscount(productMap.get(item.productId)?.salePrice ?? productMap.get(item.productId)?.basePrice ?? 0, item) < applyFlashSaleDiscount(productMap.get(item.productId)?.salePrice ?? productMap.get(item.productId)?.basePrice ?? 0, existing)) {
        flashSaleMap.set(item.productId, item)
      }
    }

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
      flashSaleItemId: string | null
    }

    const preparedItems: PreparedItem[] = []
    const flashSaleQuantities = new Map<string, number>()
    let subtotal = 0

    for (const raw of orderItems) {
      const qty = Math.max(1, Math.floor(Number(raw.quantity) || 0))
      if (qty <= 0) {
        return NextResponse.json({ error: 'Invalid item quantity' }, { status: 400 })
      }

      const product = productMap.get(String(raw.productId))
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
        const variant = variantMap.get(String(raw.variantId))
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

      const flashSaleItem = flashSaleMap.get(product.id) ?? null
      if (flashSaleItem) {
        unitPrice = applyFlashSaleDiscount(unitPrice, flashSaleItem)
        flashSaleQuantities.set(
          flashSaleItem.id,
          (flashSaleQuantities.get(flashSaleItem.id) ?? 0) + qty
        )
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
        imageUrl: typeof raw.imageUrl === 'string' ? raw.imageUrl : null,
        flashSaleItemId: flashSaleItem?.id ?? null,
      })
    }

    for (const [flashSaleItemId, quantity] of flashSaleQuantities) {
      const item = flashSaleItems.find((entry) => entry.id === flashSaleItemId)
      if (item?.maxQuantity && item.soldQuantity + quantity > item.maxQuantity) {
        return NextResponse.json({ error: 'One or more flash sale items are sold out' }, { status: 409 })
      }
    }

    // Validate coupon server-side (if provided)
    let discount = 0
    let couponId: string | null = null
    const code = typeof couponCode === 'string' ? couponCode.trim().toUpperCase() : ''
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

    const safeAddress = {
      fullName: sanitizeString(orderAddress.fullName, 120),
      phone: sanitizeString(orderAddress.phone, 20),
      addressLine1: sanitizeString(orderAddress.addressLine1, 200),
      addressLine2: orderAddress.addressLine2 ? sanitizeString(orderAddress.addressLine2, 200) : null,
      city: sanitizeString(orderAddress.city, 80),
      district: sanitizeString(orderAddress.district, 80),
      division: sanitizeString(orderAddress.division, 80),
      postalCode: orderAddress.postalCode ? sanitizeString(orderAddress.postalCode, 20) : null,
    }

    const userId = session.user.id

    const orderNumber = generateOrderNumber()

    // Atomic: create order + decrement stock + increment coupon usage
    const order = await db.$transaction(async (tx) => {
      // Re-check + decrement stock using conditional update
      for (const line of preparedItems) {
        const updated = await tx.product.updateMany({
          where: { id: line.productId, isActive: true, stockQuantity: { gte: line.quantity } },
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
          notes: notes ? sanitizeString(notes, 500) : undefined,
          isGuestOrder: false,
          items: {
            create: preparedItems.map(({ categoryId, flashSaleItemId, ...line }) => line),
          },
          statusHistory: { create: [{ status: 'PENDING', note: 'Order placed' }] },
        },
      })

      for (const [flashSaleItemId, quantity] of flashSaleQuantities) {
        const item = flashSaleItems.find((entry) => entry.id === flashSaleItemId)
        const updated = await tx.flashSaleItem.updateMany({
          where: {
            id: flashSaleItemId,
            ...(item?.maxQuantity ? { soldQuantity: { lte: item.maxQuantity - quantity } } : {}),
          },
          data: { soldQuantity: { increment: quantity } },
        })

        if (updated.count === 0) {
          throw new Error('FLASH_SALE_SOLD_OUT')
        }
      }

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
    console.error('Order creation error:', error)
    if (error instanceof Error && error.message.startsWith('INSUFFICIENT_STOCK:')) {
      return NextResponse.json({ error: `Insufficient stock for "${error.message.split(':')[1]}"` }, { status: 409 })
    }
    if (error instanceof Error && error.message === 'FLASH_SALE_SOLD_OUT') {
      return NextResponse.json({ error: 'One or more flash sale items are sold out' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
