import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { syncProductSoldCounts } from '@/backend/commerce-stats'
import { generateOrderNumber } from '@/backend/utils'
import { PAYMENT_GATEWAYS } from '@/backend/config/payment'

const AVAILABLE_PAYMENT_METHODS = new Set(
  PAYMENT_GATEWAYS.filter((gateway) => gateway.isAvailable).map((gateway) => gateway.id)
)

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
  const sp = req.nextUrl.searchParams
  const page = Math.max(1, parseInt(sp.get('page') ?? '1'))
  const limit = 20
  const skip = (page - 1) * limit

  const where: any = isAdmin ? {} : { userId: session.user.id }
  if (sp.get('status')) where.status = sp.get('status')

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

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254
}

function sanitizeString(value: unknown, max: number) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const body = await req.json()
    const { items, address, paymentMethod, notes, couponCode, isGuestOrder, guestEmail, guestPhone } = body

    if (!AVAILABLE_PAYMENT_METHODS.has(paymentMethod)) {
      return NextResponse.json(
        { error: 'This payment method is not configured yet. Please use an active checkout method.' },
        { status: 400 }
      )
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (!address || !address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.district || !address.division) {
      return NextResponse.json({ error: 'Delivery address is incomplete' }, { status: 400 })
    }

    if (!session?.user) {
      if (!isValidEmail(guestEmail)) {
        return NextResponse.json({ error: 'A valid email is required for guest checkout' }, { status: 400 })
      }
    }

    // Fetch products + variants server-side; ignore client-supplied prices
    const productIds: string[] = Array.from(new Set(items.map((i: any) => String(i.productId)).filter(Boolean)))
    const variantIds: string[] = Array.from(new Set(items.map((i: any) => i.variantId).filter(Boolean).map(String)))

    const [products, variants] = await Promise.all([
      db.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true, basePrice: true, salePrice: true, isActive: true, stockQuantity: true },
      }),
      variantIds.length
        ? db.productVariant.findMany({
            where: { id: { in: variantIds } },
            select: { id: true, productId: true, name: true, price: true, salePrice: true, stockQuantity: true },
          })
        : Promise.resolve([] as any[]),
    ])

    const productMap = new Map(products.map((p) => [p.id, p]))
    const variantMap = new Map(variants.map((v) => [v.id, v]))

    type PreparedItem = {
      productId: string
      variantId: string | null
      productName: string
      productSku: string
      variantName: string | null
      price: number
      quantity: number
      total: number
      imageUrl: string | null
    }

    const preparedItems: PreparedItem[] = []
    let subtotal = 0

    for (const raw of items) {
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

      const lineTotal = unitPrice * qty
      subtotal += lineTotal
      preparedItems.push({
        productId: product.id,
        variantId,
        productName: product.name,
        productSku: product.sku,
        variantName,
        price: unitPrice,
        quantity: qty,
        total: lineTotal,
        imageUrl: typeof raw.imageUrl === 'string' ? raw.imageUrl : null,
      })
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
        return NextResponse.json({ error: `Minimum order amount is ৳${coupon.minOrderAmount}` }, { status: 400 })
      }

      // Enforce per-user limit (authenticated only)
      if (coupon.perUserLimit && session?.user?.id) {
        const userUsage = await db.order.count({
          where: { userId: session.user.id, couponId: coupon.id, status: { not: 'CANCELLED' } },
        })
        if (userUsage >= coupon.perUserLimit) {
          return NextResponse.json({ error: 'You have reached the usage limit for this coupon' }, { status: 400 })
        }
      }

      if (coupon.type === 'PERCENTAGE') {
        discount = (subtotal * coupon.value) / 100
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
      } else if (coupon.type === 'FIXED') {
        discount = Math.min(coupon.value, subtotal)
      }
      couponId = coupon.id
    }

    const shippingFee = computeShipping(subtotal)
    const total = Math.max(0, subtotal - discount + shippingFee)

    const safeAddress = {
      fullName: sanitizeString(address.fullName, 120),
      phone: sanitizeString(address.phone, 20),
      addressLine1: sanitizeString(address.addressLine1, 200),
      addressLine2: address.addressLine2 ? sanitizeString(address.addressLine2, 200) : null,
      city: sanitizeString(address.city, 80),
      district: sanitizeString(address.district, 80),
      division: sanitizeString(address.division, 80),
      postalCode: address.postalCode ? sanitizeString(address.postalCode, 20) : null,
    }

    let userId = session?.user?.id

    if (!userId) {
      const email = (guestEmail as string).toLowerCase().trim()
      const guestUser = await db.user.upsert({
        where: { email },
        update: {},
        create: { email, name: safeAddress.fullName, role: 'CUSTOMER' },
      })
      userId = guestUser.id
    }

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
          paymentMethod: paymentMethod as any,
          couponId: couponId ?? undefined,
          notes: notes ? sanitizeString(notes, 500) : undefined,
          isGuestOrder: !session?.user,
          guestEmail: !session?.user ? (guestEmail as string).toLowerCase().trim() : undefined,
          guestPhone: !session?.user && typeof guestPhone === 'string' ? sanitizeString(guestPhone, 20) : undefined,
          items: { create: preparedItems },
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
          method: paymentMethod as any,
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
  } catch (error: any) {
    console.error('Order creation error:', error)
    if (typeof error?.message === 'string' && error.message.startsWith('INSUFFICIENT_STOCK:')) {
      return NextResponse.json({ error: `Insufficient stock for "${error.message.split(':')[1]}"` }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
