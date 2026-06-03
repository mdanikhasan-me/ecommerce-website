import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const adminShellSource = readFileSync(
  join(process.cwd(), 'src/frontend/components/admin/AdminShell.tsx'),
  'utf8',
)
const adminHeaderSource = readFileSync(
  join(process.cwd(), 'src/frontend/components/admin/AdminHeader.tsx'),
  'utf8',
)
const adminSidebarSource = readFileSync(
  join(process.cwd(), 'src/frontend/components/admin/AdminSidebar.tsx'),
  'utf8',
)

describe('admin shell authenticated QA guardrails', () => {
  it('keeps removed Flash admin navigation out of the admin sidebar', () => {
    assert.doesNotMatch(adminSidebarSource, /Flash\s+(Sale|Deal)s?/i)
    assert.doesNotMatch(adminSidebarSource, /\/admin\/flash-sales/i)
  })

  it('keeps the mobile admin menu reachable by an accessible button', () => {
    assert.match(adminHeaderSource, /aria-label="Open admin menu"/)
    assert.match(adminHeaderSource, /title="Open admin menu"/)
    assert.match(adminHeaderSource, /onClick=\{onMenuClick\}/)
  })

  it('keeps Escape wired to close the mobile admin menu', () => {
    assert.match(adminShellSource, /event\.key === 'Escape'/)
    assert.match(adminShellSource, /setIsMenuOpen\(false\)/)
    assert.match(adminShellSource, /document\.addEventListener\('keydown', handleEscape\)/)
    assert.match(adminShellSource, /document\.removeEventListener\('keydown', handleEscape\)/)
  })
})
