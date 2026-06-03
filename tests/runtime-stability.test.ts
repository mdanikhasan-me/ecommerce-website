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
import {
  DEFAULT_SMOKE_PROBES,
  createNextSmokeCommand,
  hasUnsafeApiLeak,
  isExpectedStatus,
  parseSmokeArgs,
} from '../scripts/local-runtime-smoke.mjs'

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

  it('lets public listing pages mark only one product-card image as the LCP candidate', () => {
    const productCard = readFileSync(join(process.cwd(), 'src/frontend/components/product/ProductCard.tsx'), 'utf8')
    const categoryPage = readFileSync(join(process.cwd(), 'src/app/(store)/category/[slug]/page.tsx'), 'utf8')
    const searchPage = readFileSync(join(process.cwd(), 'src/app/(store)/search/page.tsx'), 'utf8')
    const newArrivalsPage = readFileSync(join(process.cwd(), 'src/app/(store)/new-arrivals/page.tsx'), 'utf8')

    assert.match(productCard, /priority\?: boolean/)
    assert.match(productCard, /priority=\{priority\}/)
    assert.match(productCard, /imageSizes\?: string/)
    assert.match(productCard, /sizes=\{imageSizes\}/)
    assert.match(categoryPage, /priority=\{index === 0\}/)
    assert.match(searchPage, /priority=\{index === 0\}/)
    assert.match(newArrivalsPage, /priority=\{index === 0\}/)
  })
})

describe('local runtime smoke helper', () => {
  it('parses safe local smoke modes and ports', () => {
    assert.deepEqual(
      parseSmokeArgs(['--mode', 'start', '--host', '127.0.0.1', '--port', '3111']),
      {
        mode: 'start',
        host: '127.0.0.1',
        port: 3111,
        startupTimeoutMs: 90_000,
        requestTimeoutMs: 20_000,
      },
    )
    assert.throws(() => parseSmokeArgs(['--mode', 'deploy']), /Unsupported smoke mode/)
    assert.throws(() => parseSmokeArgs(['--port', '0']), /Smoke port/)
  })

  it('creates direct Next commands for local-only dev and start smoke runs', () => {
    const command = createNextSmokeCommand({ mode: 'dev', host: '127.0.0.1', port: 3110 })

    assert.equal(command.command, process.execPath)
    assert.match(command.args[0], /node_modules[\\/]next[\\/]dist[\\/]bin[\\/]next$/)
    assert.deepEqual(command.args.slice(1), ['dev', '--hostname', '127.0.0.1', '--port', '3110'])
  })

  it('keeps explicit status contracts and JSON leak detection stable', () => {
    assert.equal(isExpectedStatus(200, [200]), true)
    assert.equal(isExpectedStatus(404, [200]), false)
    assert.equal(isExpectedStatus(503, undefined), false)
    assert.equal(isExpectedStatus(307, undefined), true)

    assert.equal(hasUnsafeApiLeak('{"error":"Invalid request"}', 'application/json'), false)
    assert.equal(hasUnsafeApiLeak('{"error":"PrismaClient failed"}', 'application/json'), true)
    assert.equal(hasUnsafeApiLeak('{"stack":"Error: failed\\n    at route (app/api/x.ts:1:1)"}', 'application/json'), true)
    assert.equal(hasUnsafeApiLeak('<html>PrismaClient text in HTML</html>', 'text/html'), false)
  })

  it('covers only safe prelaunch smoke routes and removed Flash endpoints', () => {
    const paths = DEFAULT_SMOKE_PROBES.map((probe) => probe.path)

    assert.ok(paths.includes('/deals'))
    assert.ok(paths.includes('/api/admin/flash-sales'))
    assert.ok(paths.includes('/api/products/bad%24id/view'))
    assert.ok(paths.includes('/api/returns'))
    assert.equal(paths.some((path) => path.includes('/api/orders') && path !== '/api/products?page=bad&limit=100000'), false)
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
