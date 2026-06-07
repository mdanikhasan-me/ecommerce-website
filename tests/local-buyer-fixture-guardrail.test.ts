import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import {
  DEFAULT_LOCAL_BUYER_EMAIL,
  LOCAL_BUYER_PASSWORD_ENV,
  createLocalBuyerFixturePlan,
  runLocalBuyerFixtureCli,
  sanitizeBuyerFixtureOutput,
  upsertLocalBuyerFixture,
  validateLocalBuyerEmail,
  validateLocalBuyerPassword,
} from '../scripts/create-local-buyer-fixture.mjs'

function withTempEnvFiles(files: Record<string, string>, callback: (cwd: string) => void | Promise<void>) {
  const cwd = mkdtempSync(join(tmpdir(), 'boilabin-buyer-local-'))

  try {
    for (const [name, content] of Object.entries(files)) {
      writeFileSync(join(cwd, name), content)
    }

    return callback(cwd)
  } finally {
    rmSync(cwd, { recursive: true, force: true })
  }
}

function testEnv(values: Record<string, string> = {}) {
  return values as NodeJS.ProcessEnv
}

function createMockDb(existingUser: null | {
  id: string
  email: string
  role: string
  isActive: boolean
}) {
  const calls = {
    createdUsers: [] as unknown[],
    updatedUsers: [] as unknown[],
    cartUpserts: [] as unknown[],
    wishlistUpserts: [] as unknown[],
    disconnects: 0,
  }

  return {
    calls,
    user: {
      findUnique: async ({ where }: { where: { email: string } }) => (
        existingUser && existingUser.email === where.email ? existingUser : null
      ),
      create: async (input: { data: { email: string; role: string }; select: unknown }) => {
        calls.createdUsers.push(input)
        return { id: 'buyer-1', email: input.data.email, role: input.data.role }
      },
      update: async (input: { data: { role: string }; select: unknown }) => {
        calls.updatedUsers.push(input)
        return { id: existingUser?.id ?? 'buyer-1', email: existingUser?.email ?? DEFAULT_LOCAL_BUYER_EMAIL, role: input.data.role }
      },
    },
    cart: {
      upsert: async (input: unknown) => {
        calls.cartUpserts.push(input)
        return { id: 'cart-1' }
      },
    },
    wishlist: {
      upsert: async (input: unknown) => {
        calls.wishlistUpserts.push(input)
        return { id: 'wishlist-1' }
      },
    },
    $disconnect: async () => {
      calls.disconnects += 1
    },
  }
}

test('local buyer fixture plan refuses a remote-looking app DB URL', () => {
  return withTempEnvFiles({
    '.env.local': [
      'DATABASE_URL="postgresql://postgres:postgres@db.example.test:5432/remote_app"',
      'SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_shadow"',
      `${LOCAL_BUYER_PASSWORD_ENV}="ValidLocal!234"`,
    ].join('\n'),
  }, (cwd) => {
    const plan = createLocalBuyerFixturePlan({ cwd, baseEnv: testEnv() })

    assert.equal(plan.safety.databaseUrl, 'remote-looking')
    assert.equal(plan.canRun, false)
  })
})

test('local buyer fixture plan refuses same app and shadow DB', () => {
  return withTempEnvFiles({
    '.env.local': [
      'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_local"',
      'SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_local"',
      `${LOCAL_BUYER_PASSWORD_ENV}="ValidLocal!234"`,
    ].join('\n'),
  }, (cwd) => {
    const plan = createLocalBuyerFixturePlan({ cwd, baseEnv: testEnv() })

    assert.equal(plan.safety.shadowDatabaseSeparate, false)
    assert.equal(plan.canRun, false)
  })
})

test('local buyer fixture validates local-only email and strong password input', () => {
  assert.match(validateLocalBuyerEmail('buyer@example.com').join(' '), /\.localhost/)
  assert.deepEqual(validateLocalBuyerEmail(DEFAULT_LOCAL_BUYER_EMAIL), [])
  assert.match(validateLocalBuyerPassword('').join(' '), new RegExp(LOCAL_BUYER_PASSWORD_ENV))
  assert.match(validateLocalBuyerPassword('short').join(' '), /at least 12/)
  assert.deepEqual(validateLocalBuyerPassword('ValidLocal!234'), [])
})

test('local buyer fixture CLI refuses missing password without touching DB', async () => {
  await withTempEnvFiles({
    '.env.local': [
      'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_local"',
      'SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_shadow"',
    ].join('\n'),
  }, async (cwd) => {
    let factoryCalls = 0
    const stderr: string[] = []
    const status = await runLocalBuyerFixtureCli({
      cwd,
      baseEnv: testEnv(),
      stdout: () => undefined,
      stderr: (message: string) => stderr.push(message),
      prismaFactory: () => {
        factoryCalls += 1
        return createMockDb(null) as any
      },
    })

    assert.equal(status, 1)
    assert.equal(factoryCalls, 0)
    assert.match(stderr.join('\n'), /Refusing to create local buyer fixture/)
  })
})

test('local buyer fixture refuses to overwrite a non-customer account', async () => {
  const db = createMockDb({
    id: 'admin-1',
    email: DEFAULT_LOCAL_BUYER_EMAIL,
    role: 'ADMIN',
    isActive: true,
  })

  await assert.rejects(
    () => upsertLocalBuyerFixture({
      db,
      email: DEFAULT_LOCAL_BUYER_EMAIL,
      password: 'ValidLocal!234',
      hashPassword: async () => 'next-hash',
    }),
    /not a CUSTOMER/,
  )
  assert.equal(db.calls.createdUsers.length, 0)
  assert.equal(db.calls.updatedUsers.length, 0)
  assert.equal(db.calls.cartUpserts.length, 0)
  assert.equal(db.calls.wishlistUpserts.length, 0)
})

test('local buyer fixture creates customer account with cart and wishlist without storing raw password', async () => {
  const db = createMockDb(null)
  const result = await upsertLocalBuyerFixture({
    db,
    email: DEFAULT_LOCAL_BUYER_EMAIL,
    password: 'ValidLocal!234',
    hashPassword: async () => 'next-hash',
  })
  const serializedCreates = JSON.stringify(db.calls.createdUsers)

  assert.equal(result.maskedEmail, 'l***@boilabin.localhost')
  assert.equal(result.role, 'CUSTOMER')
  assert.equal(result.created, true)
  assert.equal(db.calls.createdUsers.length, 1)
  assert.equal(db.calls.cartUpserts.length, 1)
  assert.equal(db.calls.wishlistUpserts.length, 1)
  assert(!serializedCreates.includes('ValidLocal!234'))
  assert(serializedCreates.includes('next-hash'))
})

test('local buyer fixture CLI output omits password, hash, full email, and DB URL values', async () => {
  await withTempEnvFiles({
    '.env.local': [
      'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_local"',
      'SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_shadow"',
      `${LOCAL_BUYER_PASSWORD_ENV}="ValidLocal!234"`,
    ].join('\n'),
  }, async (cwd) => {
    const stdout: string[] = []
    const db = createMockDb(null)
    const status = await runLocalBuyerFixtureCli({
      cwd,
      baseEnv: testEnv(),
      stdout: (message: string) => stdout.push(message),
      stderr: () => undefined,
      prismaFactory: () => db as any,
      hashPassword: async () => 'next-hash',
    })
    const serialized = stdout.join('\n')

    assert.equal(status, 0)
    assert(!serialized.includes('ValidLocal!234'))
    assert(!serialized.includes('next-hash'))
    assert(!serialized.includes(DEFAULT_LOCAL_BUYER_EMAIL))
    assert(!serialized.includes('postgresql://postgres:postgres@localhost:5432/boilabin_local'))
    assert(serialized.includes('l***@boilabin.localhost'))
  })
})

test('sanitizeBuyerFixtureOutput redacts URLs, emails, passwords, hashes, and secrets', () => {
  const sanitized = sanitizeBuyerFixtureOutput([
    'DATABASE_URL=postgresql://user:pass@example.test/db',
    DEFAULT_LOCAL_BUYER_EMAIL,
    'password: PlainSecret123',
    'hash=abcdef123',
    'token=secret-token',
  ].join('\n'))

  assert(!sanitized.includes('postgresql://user:pass@example.test/db'))
  assert(!sanitized.includes(DEFAULT_LOCAL_BUYER_EMAIL))
  assert(!sanitized.includes('PlainSecret123'))
  assert(!sanitized.includes('abcdef123'))
  assert(!sanitized.includes('secret-token'))
  assert(sanitized.includes('[redacted-database-url]'))
  assert(sanitized.includes('[redacted-email]'))
})
