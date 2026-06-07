import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const sourceExtensions = new Set(['.ts', '.tsx'])

function read(relativePath: string) {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

function collectSourceFiles(directory: string): string[] {
  const absoluteDirectory = join(repoRoot, directory)
  if (!existsSync(absoluteDirectory)) return []

  return readdirSync(absoluteDirectory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = `${directory}/${entry.name}`

    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git'].includes(entry.name)) return []
      return collectSourceFiles(relativePath)
    }

    return sourceExtensions.has(extname(entry.name)) ? [relativePath] : []
  })
}

function findPatternMatches(pattern: RegExp) {
  return collectSourceFiles('src').flatMap((relativePath) => {
    const lines = read(relativePath).split(/\r?\n/)

    return lines.flatMap((line, index) => {
      pattern.lastIndex = 0
      return pattern.test(line) ? [`${relativePath}:${index + 1}:${line.trim()}`] : []
    })
  })
}

describe('accessibility ARIA source guardrails', () => {
  it('rejects quoted literal JSX expression values on ARIA and role attributes', () => {
    const matches = findPatternMatches(/\b(?:aria-[a-zA-Z-]+|role)="\{[^"]+\}"/g)

    assert.deepEqual(matches, [])
  })

  it('keeps Edge Tools problem-prone ARIA state and role expressions behind typed helpers', () => {
    const matches = findPatternMatches(/\b(?:aria-(?:expanded|checked|hidden|pressed|selected|current|invalid)|role)=\{/g)

    assert.deepEqual(matches, [])
  })

  it('keeps source TSX free of inline style props reported by Edge Tools', () => {
    const matches = findPatternMatches(/\sstyle=\{/g)

    assert.deepEqual(matches, [])
  })

  it('keeps Header disclosure state attributes semantic without direct TSX state expressions', () => {
    const header = read('src/frontend/components/layout/Header.tsx')

    for (const helperCall of [
      'ariaExpanded(isCategoriesOpen)',
      'ariaPressed(isSelected)',
      'ariaExpanded(isSearchOpen)',
      'ariaExpanded(isAccountOpen)',
    ]) {
      assert.match(header, new RegExp(helperCall.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    }

    assert.match(header, /aria-controls="desktop-categories-menu"/)
    assert.match(header, /aria-haspopup="menu"/)
    assert.doesNotMatch(header, /aria-expanded=\{/)
    assert.doesNotMatch(header, /aria-pressed=\{/)
  })

  it('keeps product filter controls and mobile filter dialog on valid ARIA state helpers', () => {
    const filters = read('src/frontend/components/product/SearchFiltersPanel.tsx')
    const mobileFilters = read('src/frontend/components/product/MobileSearchFilters.tsx')

    assert.match(filters, /role="group" aria-label="Minimum rating"/)
    assert.match(filters, /ariaPressed\(selected\)/)
    assert.doesNotMatch(filters, /aria-checked=\{/)

    assert.match(mobileFilters, /ariaExpanded\(open\)/)
    assert.match(mobileFilters, /aria-haspopup="dialog"/)
    assert.match(mobileFilters, /role="dialog"/)
    assert.match(mobileFilters, /aria-modal="true"/)
    assert.doesNotMatch(mobileFilters, /aria-expanded=\{/)
  })

  it('keeps LocalIcon decorative by default and explicit when meaningful', () => {
    const localIcon = read('src/frontend/components/ui/LocalIcon.tsx')

    assert.match(localIcon, /decorative = true/)
    assert.match(localIcon, /aria-hidden="true"/)
    assert.match(localIcon, /role="img"/)
    assert.match(localIcon, /aria-label=\{title \?\? name\.replace/)
    assert.doesNotMatch(localIcon, /aria-hidden=\{decorative/)
    assert.doesNotMatch(localIcon, /role=\{decorative/)
  })
})
