import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { escapeCsvValue } from '@/backend/admin/reports'

describe('admin report CSV escaping', () => {
  it('quotes commas and double quotes', () => {
    assert.equal(escapeCsvValue('Boilabin, Dhaka'), '"Boilabin, Dhaka"')
    assert.equal(escapeCsvValue('He said "yes"'), '"He said ""yes"""')
  })

  it('escapes spreadsheet formula prefixes', () => {
    assert.equal(escapeCsvValue('=IMPORTXML("https://evil.test")'), `"'=IMPORTXML(""https://evil.test"")"`)
    assert.equal(escapeCsvValue('+8801711222333'), "'+8801711222333")
    assert.equal(escapeCsvValue('  @cmd'), "'  @cmd")
  })
})
