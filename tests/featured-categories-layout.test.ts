import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const source = readFileSync(
  join(process.cwd(), 'src/frontend/components/home/FeaturedCategories.tsx'),
  'utf8',
)

describe('featured categories layout guardrails', () => {
  it('keeps the homepage category heading from being constrained on desktop', () => {
    assert.match(source, /section-title max-w-\[12ch\] sm:max-w-none/)
  })

  it('allows category cards to shrink inside responsive grids', () => {
    const minWidthMatches = source.match(/min-w-0 overflow-hidden/g) ?? []

    assert.equal(minWidthMatches.length, 2)
  })
})
