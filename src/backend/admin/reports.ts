import { db } from '@/backend/database'

export type AdminReportExportType = 'orders' | 'products' | 'customers'
export type AdminReportExportRole = 'ADMIN' | 'SUPER_ADMIN'

export type AdminReportFieldSensitivity =
  | 'non-sensitive-operational'
  | 'customer-pii'
  | 'business-sensitive'
  | 'payment-order-sensitive'
  | 'unknown-needs-policy'

interface AdminReportExportFieldMetadata {
  name: string
  sensitivity: AdminReportFieldSensitivity
  label: string
}

interface AdminReportExportMetadata {
  type: AdminReportExportType
  label: string
  reportSensitivityLabel: string
  permissionLabel: string
  warningLabel: string
  containsCustomerPii: boolean
  containsBusinessSensitiveData: boolean
  containsPaymentOrOrderSensitiveData: boolean
  fields: readonly AdminReportExportFieldMetadata[]
}

export const ADMIN_REPORT_EXPORT_METADATA = {
  orders: {
    type: 'orders',
    label: 'Orders CSV',
    reportSensitivityLabel: 'Customer and order/payment sensitive',
    permissionLabel: 'Customer/order export permission recommended',
    warningLabel: 'Contains customer data plus order and payment-status details.',
    containsCustomerPii: true,
    containsBusinessSensitiveData: false,
    containsPaymentOrOrderSensitiveData: true,
    fields: [
      {
        name: 'orderNumber',
        sensitivity: 'payment-order-sensitive',
        label: 'Order identifier',
      },
      { name: 'customer', sensitivity: 'customer-pii', label: 'Customer name' },
      { name: 'email', sensitivity: 'customer-pii', label: 'Customer email' },
      { name: 'status', sensitivity: 'payment-order-sensitive', label: 'Order status' },
      {
        name: 'paymentStatus',
        sensitivity: 'payment-order-sensitive',
        label: 'Payment status',
      },
      { name: 'total', sensitivity: 'payment-order-sensitive', label: 'Order total' },
      {
        name: 'createdAt',
        sensitivity: 'non-sensitive-operational',
        label: 'Created timestamp',
      },
    ],
  },
  products: {
    type: 'products',
    label: 'Products CSV',
    reportSensitivityLabel: 'Business-sensitive inventory and sales data',
    permissionLabel: 'Catalog/business export permission recommended',
    warningLabel: 'Contains stock, sales, SKU, and catalog status details.',
    containsCustomerPii: false,
    containsBusinessSensitiveData: true,
    containsPaymentOrOrderSensitiveData: false,
    fields: [
      { name: 'name', sensitivity: 'non-sensitive-operational', label: 'Product name' },
      { name: 'sku', sensitivity: 'unknown-needs-policy', label: 'Product SKU' },
      { name: 'category', sensitivity: 'non-sensitive-operational', label: 'Category name' },
      { name: 'stockQuantity', sensitivity: 'business-sensitive', label: 'Stock quantity' },
      { name: 'soldCount', sensitivity: 'business-sensitive', label: 'Sold count' },
      { name: 'isActive', sensitivity: 'business-sensitive', label: 'Catalog active status' },
    ],
  },
  customers: {
    type: 'customers',
    label: 'Customers CSV',
    reportSensitivityLabel: 'Highest PII risk customer account export',
    permissionLabel: 'Customer PII export permission recommended',
    warningLabel: 'Contains customer identity, contact, account, and activity data.',
    containsCustomerPii: true,
    containsBusinessSensitiveData: false,
    containsPaymentOrOrderSensitiveData: false,
    fields: [
      { name: 'name', sensitivity: 'customer-pii', label: 'Customer name' },
      { name: 'email', sensitivity: 'customer-pii', label: 'Customer email' },
      { name: 'phone', sensitivity: 'customer-pii', label: 'Customer phone' },
      { name: 'role', sensitivity: 'unknown-needs-policy', label: 'Account role' },
      { name: 'isActive', sensitivity: 'unknown-needs-policy', label: 'Account active status' },
      { name: 'orders', sensitivity: 'customer-pii', label: 'Order activity count' },
      { name: 'reviews', sensitivity: 'customer-pii', label: 'Review activity count' },
      {
        name: 'createdAt',
        sensitivity: 'unknown-needs-policy',
        label: 'Account created timestamp',
      },
    ],
  },
} satisfies Record<AdminReportExportType, AdminReportExportMetadata>

export const ADMIN_REPORT_EXPORT_ALLOWED_ROLES = {
  orders: ['SUPER_ADMIN'],
  products: ['ADMIN', 'SUPER_ADMIN'],
  customers: ['SUPER_ADMIN'],
} as const satisfies Record<AdminReportExportType, readonly AdminReportExportRole[]>

export function canExportAdminReport(
  type: AdminReportExportType,
  role: string | null | undefined,
) {
  return ADMIN_REPORT_EXPORT_ALLOWED_ROLES[type].some((allowedRole) => allowedRole === role)
}

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
  if (safeText.includes(',') || safeText.includes('"') || safeText.includes('\n') || safeText.includes('\r')) {
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
  type: AdminReportExportType,
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
