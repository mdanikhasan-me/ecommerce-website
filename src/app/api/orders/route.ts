import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
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

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const body = await req.json()
    const { items, address, paymentMethod, subtotal, shippingFee, total, notes, discount = 0, couponId, isGuestOrder, guestEmail, guestPhone } = body

    if (!AVAILABLE_PAYMENT_METHODS.has(paymentMethod)) {
      return NextResponse.json(
        { error: 'This payment method is not configured yet. Please use an active checkout method.' },
        { status: 400 }
      )
    }

    // Validate stock
    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
        select: { stockQuantity: true, name: true, isActive: true },
      })
      if (!product || !product.isActive) {
        return NextResponse.json({ error: `Product "${item.productName}" is no longer available` }, { status: 400 })
      }
      if (product.stockQuantity < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for "${item.productName}"` }, { status: 400 })
      }
    }

    let userId = session?.user?.id
    let addressId: string | undefined

    // Handle guest or logged-in user
    if (!userId) {
      // Create or find guest user
      const guestUser = await db.user.upsert({
        where: { email: guestEmail ?? `guest_${Date.now()}@boilabin.guest` },
        update: {},
        create: {
          email: guestEmail ?? `guest_${Date.now()}@boilabin.guest`,
          name: address.fullName,
          role: 'CUSTOMER',
        },
      })
      userId = guestUser.id
    }

    // Create address
    const createdAddress = await db.address.create({
      data: {
        userId: userId,
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        district: address.district,
        division: address.division,
        postalCode: address.postalCode,
      },
    })
    addressId = createdAddress.id

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        addressId,
        subtotal,
        shippingFee,
        discount,
        total,
        paymentMethod: paymentMethod as any,
        couponId: couponId ?? undefined,
        notes,
        isGuestOrder: !session?.user,
        guestEmail: !session?.user ? guestEmail : undefined,
        guestPhone: !session?.user ? guestPhone : undefined,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            productSku: item.productSku,
            variantName: item.variantName,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
            imageUrl: item.imageUrl,
          })),
        },
        statusHistory: {
          create: [{ status: 'PENDING', note: 'Order placed' }],
        },
      },
    })

    // Deduct stock
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: { decrement: item.quantity },
          soldCount: { increment: item.quantity },
        },
      })
      if (item.variantId) {
        await db.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { decrement: item.quantity } },
        })
      }
    }

    // Increment coupon usage
    if (couponId) {
      await db.coupon.update({ where: { id: couponId }, data: { usageCount: { increment: 1 } } }).catch(() => {})
    }

    // Create payment record
    await db.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        method: paymentMethod as any,
        status: paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PENDING',
      },
    })

    // Create notification
    await db.notification.create({
      data: {
        userId,
        type: 'ORDER',
        title: 'Order Placed Successfully',
        message: `Your order ${order.orderNumber} has been placed and is being processed.`,
        link: `/account/orders/${order.id}`,
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, orderId: order.id, orderNumber: order.orderNumber }, { status: 201 })
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 })
  }
}
