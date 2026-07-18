import { getBuyerVisibleProductWhere } from '@/backend/catalog/product-visibility'
import { expandCouponCategoryIds } from '@/backend/coupons/category-scope'
import { siteConfig } from '@/backend/config/site'
import { enqueueOrderPlacedEmails, type EmailEnqueueTx } from '@/backend/email/outbox'
import type { ParsedBuyerOrderAddress, ParsedBuyerOrderPayload } from '@/backend/orders/buyer-validation'
import { evaluateCouponForLines } from '@/shared/coupon-math'

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
  isActive: boolean
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
  address: {
    create: (args: unknown) => Promise<{ id: string }>
    findFirst: (args: unknown) => Promise<(ParsedBuyerOrderAddress & { id: string }) | null>
  }
  order: { create: (args: unknown) => Promise<{ id: string; orderNumber: string; createdAt: Date }> }
  coupon: { update: (args: unknown) => Promise<{ usageCount: number; usageLimit: number | null }> }
  payment: { create: (args: unknown) => Promise<unknown> }
} & EmailEnqueueTx

export type BuyerOrderDb = {
  product: { findMany: (args: unknown) => Promise<ProductRecord[]> }
  productVariant: { findMany: (args: unknown) => Promise<VariantRecord[]> }
  coupon: { findUnique: (args: unknown) => Promise<CouponRecord | null> }
  category: { findMany: (args: unknown) => Promise<Array<{ id: string; parentId: string | null }>> }
  order: { count: (args: unknown) => Promise<number> }
  user: { findUnique: (args: unknown) => Promise<{ email: string; name: string | null; isActive: boolean } | null> }
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
  return subtotal >= siteConfig.shipping.freeShippingMin ? 0 : siteConfig.shipping.baseFee
}

const MAX_ORDER_NUMBER_COLLISION_RETRIES = 10

export async function createBuyerOrder({
  database,
  userId,
  payload,
  generateOrderNumber,
  syncSoldCounts,
}: {
  database: BuyerOrderDb
  userId: string
  payload: ParsedBuyerOrderPayload
  generateOrderNumber: () => string
  syncSoldCounts: (productIds: string[]) => Promise<void>
}): Promise<BuyerOrderCreateResult> {
  const productIds = Array.from(new Set(payload.items.map((item) => item.productId)))
  const variantIds = Array.from(
    new Set(payload.items.map((item) => item.variantId).filter((id): id is string => Boolean(id))),
  )

  const customer = await database.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, isActive: true },
  })
  if (!customer?.isActive) {
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
          select: { id: true, productId: true, name: true, price: true, salePrice: true, stockQuantity: true, isActive: true },
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
      if (!variant || variant.productId !== product.id || !variant.isActive) {
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
    const expandedCategoryIds = await expandCouponCategoryIds(
      () => database.category.findMany({ select: { id: true, parentId: true } }),
      coupon.categoryIds,
    )
    const couponEvaluation = evaluateCouponForLines(
      { ...coupon, categoryIds: expandedCategoryIds },
      preparedItems,
    )

    if (!couponEvaluation.hasEligibleItems) {
      return { success: false, status: 400, error: 'This coupon does not apply to the items in your cart' }
    }

    if (!couponEvaluation.meetsMinimum) {
      const minimumLabel = couponEvaluation.hasRestrictions ? 'Minimum eligible item amount' : 'Minimum order amount'
      return {
        success: false,
        status: 400,
        error: `${minimumLabel} is Tk ${couponEvaluation.minimumOrderAmount.toLocaleString('en-BD')}`,
      }
    }

    if (coupon.perUserLimit) {
      const userUsage = await database.order.count({
        where: { userId, couponId: coupon.id, status: { not: 'CANCELLED' } },
      })
      if (userUsage >= coupon.perUserLimit) {
        return { success: false, status: 400, error: 'You have reached the usage limit for this coupon' }
      }
    }

    discount = couponEvaluation.discount
    couponId = coupon.id
  }

  const shippingFee = computeBuyerOrderShipping(subtotal)
  const total = Math.max(0, subtotal - discount + shippingFee)

  let order: { id: string; orderNumber: string }
  let orderNumber = generateOrderNumber()
  let collisionRetries = 0

  // The transaction is retried only when the random order number collides with
  // an existing one (unique-constraint violation). All other failures return
  // or rethrow immediately, so business errors are never silently retried.
  while (true) {
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

      let orderAddressId: string
      let orderAddress: ParsedBuyerOrderAddress

      if (payload.addressId) {
        const savedAddress = await tx.address.findFirst({
          where: { id: payload.addressId, userId },
          select: {
            id: true,
            fullName: true,
            phone: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            district: true,
            division: true,
            postalCode: true,
          },
        })
        if (!savedAddress) {
          throw new Error('ADDRESS_NOT_FOUND')
        }
        orderAddressId = savedAddress.id
        orderAddress = {
          fullName: savedAddress.fullName,
          phone: savedAddress.phone,
          addressLine1: savedAddress.addressLine1,
          addressLine2: savedAddress.addressLine2,
          city: savedAddress.city,
          district: savedAddress.district,
          division: savedAddress.division,
          postalCode: savedAddress.postalCode,
        }
      } else {
        if (!payload.address) {
          throw new Error('ADDRESS_NOT_FOUND')
        }
        const createdAddress = await tx.address.create({
          data: { userId, isSaved: payload.saveAddress, ...payload.address },
        })
        orderAddressId = createdAddress.id
        orderAddress = payload.address
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: orderAddressId,
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
        address: orderAddress,
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
      break
    } catch (error: unknown) {
      if (error instanceof Error && error.message.startsWith('INSUFFICIENT_STOCK:')) {
        return {
          success: false,
          status: 409,
          error: `Insufficient stock for "${error.message.split(':')[1]}"`,
          logCode: 'insufficient_stock',
        }
      }
      if (error instanceof Error && error.message === 'ADDRESS_NOT_FOUND') {
        return {
          success: false,
          status: 400,
          error: 'Select a valid delivery address',
        }
      }
      if (error instanceof Error && error.message === 'COUPON_USAGE_LIMIT_EXCEEDED') {
        return { success: false, status: 400, error: 'Coupon usage limit reached' }
      }
      // Unique-constraint violation: regenerate the order number and retry.
      const code = (error as { code?: unknown }).code
      if (code === 'P2002' && collisionRetries < MAX_ORDER_NUMBER_COLLISION_RETRIES) {
        collisionRetries += 1
        orderNumber = generateOrderNumber()
        continue
      }
      throw error
    }
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
