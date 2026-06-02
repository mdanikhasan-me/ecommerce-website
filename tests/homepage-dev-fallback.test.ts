import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  createHomepageDevFallbackData,
  getLocalDatabaseEndpoint,
  isPrismaConnectionUnavailableError,
  resetHomepageDevFallbackWarningForTests,
  shouldUseHomepageDevFallbackBeforeDb,
  shouldUseHomepageDevFallback,
  warnHomepageDevFallback,
} from '@/backend/storefront/homepage-dev-fallback'
import { getCategoryMediaPath } from '@/shared/category-media'

function createPrismaInitError(message: string) {
  const error = new Error(message)
  error.name = 'PrismaClientInitializationError'
  return error
}

describe('homepage development DB fallback', () => {
  it('uses fallback only for Prisma connectivity errors in development', () => {
    const error = createPrismaInitError("Can't reach database server at localhost:5432")

    assert.equal(isPrismaConnectionUnavailableError(error), true)
    assert.equal(shouldUseHomepageDevFallback(error, { NODE_ENV: 'development' }), true)
  })

  it('does not swallow the same Prisma connectivity error outside development', () => {
    const error = createPrismaInitError("Can't reach database server at localhost:5432")

    assert.equal(shouldUseHomepageDevFallback(error, { NODE_ENV: 'production' }), false)
    assert.equal(shouldUseHomepageDevFallback(error, { NODE_ENV: 'test' }), false)
  })

  it('does not treat non-connectivity errors as fallback-safe', () => {
    const validationError = new Error('Cannot read properties of undefined')
    validationError.name = 'TypeError'

    assert.equal(isPrismaConnectionUnavailableError(validationError), false)
    assert.equal(shouldUseHomepageDevFallback(validationError, { NODE_ENV: 'development' }), false)
  })

  it('preflights only local development database endpoints before DB reads', async () => {
    const env = {
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/boilabin_local',
    }
    const endpoint = getLocalDatabaseEndpoint(env)

    assert.deepEqual(endpoint, { host: 'localhost', port: 5432 })
    assert.equal(
      await shouldUseHomepageDevFallbackBeforeDb(env, async (value) => {
        assert.deepEqual(value, endpoint)
        return false
      }),
      true
    )
  })

  it('does not preflight fallback for production or remote-looking database endpoints', async () => {
    assert.equal(
      await shouldUseHomepageDevFallbackBeforeDb(
        {
          NODE_ENV: 'production',
          DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/boilabin_local',
        },
        async () => false
      ),
      false
    )

    assert.equal(
      getLocalDatabaseEndpoint({
        DATABASE_URL: 'postgresql://postgres:postgres@db.example.invalid:5432/boilabin',
      }),
      null
    )

    assert.equal(
      await shouldUseHomepageDevFallbackBeforeDb(
        {
          NODE_ENV: 'development',
          DATABASE_URL: 'postgresql://postgres:postgres@db.example.invalid:5432/boilabin',
        },
        async () => false
      ),
      false
    )
  })

  it('keeps fallback categories free of the deleted baby-kids image path', () => {
    const data = createHomepageDevFallbackData()
    const slugs = data.categories.map((category) => category.slug)
    const imagePaths = data.categories.map((category) => getCategoryMediaPath(category))

    assert.ok(slugs.includes('toys-collectibles'))
    assert.equal(slugs.includes('baby-kids'), false)
    assert.equal(imagePaths.includes('/assets/categories/baby-kids.jpg'), false)
    assert.equal(getCategoryMediaPath(data.categories.find((category) => category.slug === 'toys-collectibles')!), '/assets/categories/gaming.jpg')
  })

  it('logs one sanitized development warning without raw errors or URLs', () => {
    resetHomepageDevFallbackWarningForTests()
    const warnings: string[] = []

    warnHomepageDevFallback({ warn: (message) => warnings.push(String(message)) })
    warnHomepageDevFallback({ warn: (message) => warnings.push(String(message)) })

    assert.equal(warnings.length, 1)
    assert.match(warnings[0], /Development storefront fallback active/)
    assert.doesNotMatch(warnings[0], /localhost:5432/)
    assert.doesNotMatch(warnings[0], /DATABASE_URL/)
  })
})
