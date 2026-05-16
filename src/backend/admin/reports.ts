import { db } from '@/backend/database'

export function parseAdminReportRange(from?: string | null, to?: string | null) {
  const now = new Date()
  const fallbackFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const parsedFrom = from ? new Date(from) : fallbackFrom
  const parsedTo = to ? new Date(to) : now

  const fromDate = Number.isNaN(parsedFrom.getTime()) ? fallbackFrom : parsedFrom
  const toDate = Number.isNaN(parsedTo.getTime()) ? now : parsedTo
  toDate.setHours(23, 59, 59, 999)

  return { from: fromDate, to: toDate }
}

export async function getAdminReportData(range: { from: Date; to: Date }) {
  const orderWhere = {
    createdAt: {
      gte: range.from,
      lte: range.to,
    },
  }

  const activeOrderWhere = {
    ...orderWhere,
    status: { not: 'CANCELLED' as const },
  }

  const [revenue, orderCount, recentOrders, topProducts, customerTotals, newCustomers] = await Promise.all([
    db.order.aggregate({
      where: activeOrderWhere,
      _sum: { total: true },
      _avg: { total: true },
    }),
    db.order.count({ where: activeOrderWhere }),
    db.order.findMany({
      where: activeOrderWhere,
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    db.orderItem.groupBy({
      by: ['productId', 'productName', 'productSku'],
      where: {
        order: activeOrderWhere,
      },
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    }),
    db.order.groupBy({
      by: ['userId'],
      where: activeOrderWhere,
      _sum: { total: true },
      _count: { id: true },
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
      take: 10,
    }),
    db.user.count({
      where: {
        createdAt: {
          gte: range.from,
          lte: range.to,
        },
      },
    }),
  ])

  const customerIds = customerTotals.map((row) => row.userId)
  const customers = customerIds.length
    ? await db.user.findMany({
        where: { id: { in: customerIds } },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      })
    : []

  const customerMap = new Map(customers.map((customer) => [customer.id, customer]))
  const topCustomers = customerTotals.map((row) => ({
    userId: row.userId,
    customer: customerMap.get(row.userId) ?? null,
    revenue: row._sum.total ?? 0,
    orders: row._count.id,
  }))

  return {
    range,
    summary: {
      revenue: revenue._sum.total ?? 0,
      averageOrderValue: revenue._avg.total ?? 0,
      orders: orderCount,
      newCustomers,
    },
    recentOrders,
    topProducts: topProducts.map((product) => ({
      ...product,
      quantitySold: product._sum.quantity ?? 0,
      revenue: product._sum.total ?? 0,
    })),
    topCustomers,
  }
}

export function escapeCsvValue(value: unknown) {
  const text = String(value ?? '')
  const safeText = /^[=+\-@]/.test(text.trimStart()) ? `'${text}` : text
  if (safeText.includes(',') || safeText.includes('"') || safeText.includes('\n')) {
    return `"${safeText.replace(/"/g, '""')}"`
  }
  return safeText
}

function buildCsv(rows: Array<Record<string, unknown>>) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(',')),
  ]
  return lines.join('\n')
}

export async function buildAdminReportCsv(
  type: 'orders' | 'products' | 'customers',
  range: { from: Date; to: Date },
) {
  if (type === 'orders') {
    const orders = await db.order.findMany({
      where: {
        createdAt: { gte: range.from, lte: range.to },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    })

    return buildCsv(
      orders.map((order) => ({
        orderNumber: order.orderNumber,
        customer: order.user?.name || '',
        email: order.user?.email || '',
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total,
        createdAt: order.createdAt.toISOString(),
      })),
    )
  }

  if (type === 'products') {
    const products = await db.product.findMany({
      orderBy: { soldCount: 'desc' },
      include: {
        category: { select: { name: true } },
      },
    })

    return buildCsv(
      products.map((product) => ({
        name: product.name,
        sku: product.sku,
        category: product.category.name,
        stockQuantity: product.stockQuantity,
        soldCount: product.soldCount,
        isActive: product.isActive,
      })),
    )
  }

  const customers = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          orders: true,
          reviews: true,
        },
      },
    },
  })

  return buildCsv(
    customers.map((customer) => ({
      name: customer.name || '',
      email: customer.email,
      phone: customer.phone || '',
      role: customer.role,
      isActive: customer.isActive,
      orders: customer._count.orders,
      reviews: customer._count.reviews,
      createdAt: customer.createdAt.toISOString(),
    })),
  )
}
