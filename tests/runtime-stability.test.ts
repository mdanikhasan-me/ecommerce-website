import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import tailwindConfig from '../tailwind.config'
import {
  KNOWN_BROKEN_IMAGE_REPLACEMENTS,
  createKnownBrokenImageRepairPlan,
  repairKnownBrokenImageUrls,
} from '../scripts/repair-known-broken-image-urls.mjs'

const require = createRequire(import.meta.url)
const nextConfig = require('../next.config.js') as {
  images?: {
    qualities?: number[]
  }
}

describe('post-Flash runtime stability config', () => {
  it('loads Tailwind config without CommonJS require', () => {
    assert.ok(tailwindConfig)
    assert.ok(Array.isArray(tailwindConfig.plugins))
    assert.ok(tailwindConfig.plugins.length > 0)
  })

  it('allows the image qualities used by active storefront components', () => {
    assert.deepEqual(nextConfig.images?.qualities, [75, 82, 84, 90, 92])
  })

  it('keeps split hero images from advertising hidden variants as full viewport', () => {
    const source = readFileSync(join(process.cwd(), 'src/frontend/components/home/HeroBanner.tsx'), 'utf8')

    assert.match(source, /sizes="\(max-width: 639px\) 100vw, 0px"/)
    assert.match(source, /sizes="\(max-width: 639px\) 0px, 100vw"/)
  })
})

describe('known broken seeded image URLs', () => {
  it('are absent from active seed data', () => {
    const seed = readFileSync(join(process.cwd(), 'prisma/seed.ts'), 'utf8')

    for (const replacement of KNOWN_BROKEN_IMAGE_REPLACEMENTS) {
      assert.equal(
        seed.includes(replacement.from),
        false,
        `${replacement.label} should not use the known broken source URL`,
      )
    }
  })

  it('are repaired with exact-match product and banner updates only', async () => {
    const updates: Array<{ model: string; where: unknown; data: unknown }> = []
    const prisma = {
      productImage: {
        updateMany(args: { where: unknown; data: unknown }) {
          updates.push({ model: 'productImage', ...args })
          return Promise.resolve({ count: 1 })
        },
      },
      banner: {
        updateMany(args: { where: unknown; data: unknown }) {
          updates.push({ model: 'banner', ...args })
          return Promise.resolve({ count: 1 })
        },
      },
    }

    const results = await repairKnownBrokenImageUrls({ prisma })

    assert.equal(results.length, KNOWN_BROKEN_IMAGE_REPLACEMENTS.length)
    assert.deepEqual(
      updates.map((update) => update.model),
      ['productImage', 'productImage', 'banner'],
    )

    for (const [index, update] of updates.entries()) {
      const replacement = KNOWN_BROKEN_IMAGE_REPLACEMENTS[index]
      assert.deepEqual(update.where, { [replacement.field]: replacement.from })
      assert.deepEqual(update.data, { [replacement.field]: replacement.to })
    }
  })

  it('refuses non-local database configuration before creating a repair plan', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'boilabin-image-repair-'))

    try {
      writeFileSync(
        join(cwd, '.env'),
        [
          'DATABASE_URL="postgresql://postgres:postgres@db.example.test:5432/remote_app"',
          'SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_shadow"',
        ].join('\n'),
      )

      const plan = createKnownBrokenImageRepairPlan({
        baseEnv: {},
        cwd,
      })

      assert.equal(plan.safety.databaseUrl, 'remote-looking')
      assert.equal(plan.canRun, false)
    } finally {
      rmSync(cwd, { recursive: true, force: true })
    }
  })
})
