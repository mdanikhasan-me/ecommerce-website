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
    const minWidthMatches = source.match(/min-w-0 flex-col overflow-hidden/g) ?? []

    assert.equal(minWidthMatches.length, 2)
  })

  it('keeps homepage category cards image-first without dark text overlays', () => {
    assert.match(source, /border-t border-border\/65 bg-card/)
    assert.match(source, /text-foreground/)
    assert.match(source, /text-muted-foreground/)
    assert.doesNotMatch(source, /text-white/)
    assert.doesNotMatch(source, /rgba\(15,23,42,[^)]+\)_100%/)
    assert.doesNotMatch(source, /drop-shadow/)
  })

  it('keeps 7 to 8 categories balanced across desktop breakpoints', () => {
    assert.match(source, /lg:grid-cols-4/)
    assert.match(source, /min-\[1120px\]:grid-cols-6/)
    assert.match(source, /2xl:grid-cols-8/)
    assert.doesNotMatch(source, /justify-center gap-3\.5 \[grid-template-columns:repeat\(auto-fit/)
  })
})
