import { getBuyerVisibleProductWhere } from '@/backend/catalog/product-visibility'
import { enqueueOrderPlacedEmails, type EmailEnqueueTx } from '@/backend/email/outbox'
import type { ParsedBuyerOrderPayload } from '@/backend/orders/buyer-validation'

const SHIPPING_FEE_FLAT = 60
const FREE_SHIPPING_THRESHOLD = 2000

type ProductRecord = {
  id: string
  categoryId: string
  name: string
  sku: string
  basePrice: number
  salePrice: number | null
  isActive: boolean
  stockQuantity: number
}

type VariantRecord = {
  id: string
  productId: string
  name: string
  price: number
  salePrice: number | null
  stockQuantity: number
}

type CouponRecord = {
  id: string
  isActive: boolean
  startsAt: Date | null
  expiresAt: Date | null
  usageLimit: number | null
  usageCount: number
  minOrderAmount: number
  productIds: string[]
  categoryIds: string[]
  perUserLimit: number | null
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  maxDiscount: number | null
}

type BuyerOrderTx = {
  product: { updateMany: (args: unknown) => Promise<{ count: number }> }
  productVariant: { updateMany: (args: unknown) => Promise<{ count: number }> }
  address: { create: (args: unknown) => Promise<{ id: string }> }
  order: { create: (args: unknown) => Promise<{ id: string; orderNumber: string; createdAt: Date }> }
  coupon: { update: (args: unknown) => Promise<{ usageCount: number; usageLimit: number | null }> }
  payment: { create: (args: unknown) => Promise<unknown> }
} & EmailEnqueueTx

export type BuyerOrderDb = {
  product: { findMany: (args: unknown) => Promise<ProductRecord[]> }
  productVariant: { findMany: (args: unknown) => Promise<VariantRecord[]> }
  coupon: { findUnique: (args: unknown) => Promise<CouponRecord | null> }
  order: { count: (args: unknown) => Promise<number> }
  user: { findUnique: (args: unknown) => Promise<{ email: string; name: string | null } | null> }
  $transaction: <T>(callback: (tx: BuyerOrderTx) => Promise<T>) => Promise<T>
  notification: { create: (args: unknown) => Promise<unknown> }
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
}

export type BuyerOrderCreateResult =
  | {
      success: true
      payload: {
        success: true
        orderId: string
        orderNumber: string
        subtotal: number
        shippingFee: number
        discount: number
        total: number
      }
    }
  | {
      success: false
      status: number
      error: string
      logCode?: 'insufficient_stock'
    }

export function computeBuyerOrderShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE_FLAT
}

export async function createBuyerOrder({
  database,
  userId,
  payload,
  orderNumber,
  syncSoldCounts,
}: {
  database: BuyerOrderDb
  userId: string
  payload: ParsedBuyerOrderPayload
  orderNumber: string
  syncSoldCounts: (productIds: string[]) => Promise<void>
}): Promise<BuyerOrderCreateResult> {
  const productIds = Array.from(new Set(payload.items.map((item) => item.productId)))
  const variantIds = Array.from(
    new Set(payload.items.map((item) => item.variantId).filter((id): id is string => Boolean(id))),
  )

  const customer = await database.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  })
  if (!customer) {
    return {
      success: false,
      status: 401,
      error: 'Please sign in or create an account before placing an order',
    }
  }

  const [products, variants] = await Promise.all([
    database.product.findMany({
      where: getBuyerVisibleProductWhere({ id: { in: productIds } }),
      select: { id: true, categoryId: true, name: true, sku: true, basePrice: true, salePrice: true, isActive: true, stockQuantity: true },
    }),
    variantIds.length
      ? database.productVariant.findMany({
          where: { id: { in: variantIds } },
          select: { id: true, productId: true, name: true, price: true, salePrice: true, stockQuantity: true },
        })
      : Promise.resolve([]),
  ])

  const productMap = new Map(products.map((product) => [product.id, product]))
  const variantMap = new Map(variants.map((variant) => [variant.id, variant]))
  const preparedItems: PreparedItem[] = []
  let subtotal = 0

  for (const raw of payload.items) {
    const qty = raw.quantity
    const product = productMap.get(raw.productId)
    if (!product || !product.isActive) {
      return { success: false, status: 400, error: 'One or more products are no longer available' }
    }
    if (product.stockQuantity < qty) {
      return { success: false, status: 400, error: `Insufficient stock for "${product.name}"` }
    }

    let unitPrice = product.salePrice ?? product.basePrice
    let variantId: string | null = null
    let variantName: string | null = null

    if (raw.variantId) {
      const variant = variantMap.get(raw.variantId)
      if (!variant || variant.productId !== product.id) {
        return { success: false, status: 400, error: 'Invalid product variant' }
      }
      if (variant.stockQuantity < qty) {
        return { success: false, status: 400, error: `Insufficient stock for variant "${variant.name}"` }
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

  let discount = 0
  let couponId: string | null = null
  const code = payload.couponCode ?? ''
  if (code) {
    const coupon = await database.coupon.findUnique({ where: { code } })
    const now = new Date()
    if (!coupon || !coupon.isActive) {
      return { success: false, status: 400, error: 'Invalid coupon code' }
    }
    if (coupon.startsAt && coupon.startsAt > now) {
      return { success: false, status: 400, error: 'Coupon is not yet active' }
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      return { success: false, status: 400, error: 'Coupon has expired' }
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { success: false, status: 400, error: 'Coupon usage limit reached' }
    }
    if (subtotal < coupon.minOrderAmount) {
      return { success: false, status: 400, error: `Minimum order amount is Tk ${coupon.minOrderAmount.toLocaleString('en-BD')}` }
    }

    const productIdSet = new Set(coupon.productIds)
    const categoryIdSet = new Set(coupon.categoryIds)
    const hasRestrictions = productIdSet.size > 0 || categoryIdSet.size > 0
    const eligibleSubtotal = hasRestrictions
      ? preparedItems.reduce((sum, item) => (
          productIdSet.has(item.productId) || categoryIdSet.has(item.categoryId) ? sum + item.total : sum
        ), 0)
      : subtotal

    if (hasRestrictions && eligibleSubtotal <= 0) {
      return { success: false, status: 400, error: 'This coupon does not apply to the items in your cart' }
    }

    if (coupon.perUserLimit) {
      const userUsage = await database.order.count({
        where: { userId, couponId: coupon.id, status: { not: 'CANCELLED' } },
      })
      if (userUsage >= coupon.perUserLimit) {
        return { success: false, status: 400, error: 'You have reached the usage limit for this coupon' }
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

  const shippingFee = computeBuyerOrderShipping(subtotal)
  const total = Math.max(0, subtotal - discount + shippingFee)

  let order: { id: string; orderNumber: string }
  try {
    order = await database.$transaction(async (tx) => {
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
        data: { userId, ...payload.address },
      })

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: createdAddress.id,
          subtotal,
          shippingFee,
          discount,
          total,
          paymentMethod: payload.paymentMethod,
          couponId: couponId ?? undefined,
          notes: payload.notes,
          isGuestOrder: false,
          items: {
            create: preparedItems.map(({ categoryId, ...line }) => line),
          },
          statusHistory: { create: [{ status: 'PENDING', note: 'Order placed' }] },
        },
      })

      if (couponId) {
        // Increment-then-check inside the transaction so concurrent orders
        // cannot both pass the pre-transaction usage-limit read.
        const updatedCoupon = await tx.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } },
          select: { usageCount: true, usageLimit: true },
        })

        if (updatedCoupon.usageLimit && updatedCoupon.usageCount > updatedCoupon.usageLimit) {
          throw new Error('COUPON_USAGE_LIMIT_EXCEEDED')
        }
      }

      await tx.payment.create({
        data: {
          orderId: created.id,
          amount: total,
          method: payload.paymentMethod,
          status: 'PENDING',
        },
      })

      // Same-transaction outbox insert: the order and its email events
      // either both commit or both roll back. Delivery happens later via
      // the protected processor, so provider downtime cannot fail checkout.
      await enqueueOrderPlacedEmails(tx, {
        orderId: created.id,
        orderNumber: created.orderNumber,
        createdAt: created.createdAt,
        subtotal,
        discount,
        shippingFee,
        total,
        paymentMethod: payload.paymentMethod,
        paymentStatus: 'PENDING',
        customerEmail: customer.email,
        customerName: customer.name,
        address: payload.address,
        items: preparedItems.map((line) => ({
          productName: line.productName,
          variantName: line.variantName,
          quantity: line.quantity,
          price: line.price,
          total: line.total,
        })),
      })

      return created
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.startsWith('INSUFFICIENT_STOCK:')) {
      return {
        success: false,
        status: 409,
        error: `Insufficient stock for "${error.message.split(':')[1]}"`,
        logCode: 'insufficient_stock',
      }
    }
    if (error instanceof Error && error.message === 'COUPON_USAGE_LIMIT_EXCEEDED') {
      return { success: false, status: 400, error: 'Coupon usage limit reached' }
    }
    throw error
  }

  // The order is committed at this point; stat aggregation must not turn a
  // successfully placed order into an error response.
  await syncSoldCounts(preparedItems.map((line) => line.productId)).catch(() => {})

  await database.notification.create({
    data: {
      userId,
      type: 'ORDER',
      title: 'Order Placed Successfully',
      message: `Your order ${order.orderNumber} has been placed and is being processed.`,
      link: `/account/orders/${order.id}`,
    },
  }).catch(() => {})

  return {
    success: true,
    payload: {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      subtotal,
      shippingFee,
      discount,
      total,
    },
  }
}
