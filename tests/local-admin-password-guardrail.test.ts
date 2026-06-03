import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import {
  LOCAL_ADMIN_PASSWORD_ENV,
  createLocalAdminPasswordPlan,
  runLocalAdminPasswordCli,
  runLocalAdminPasswordUpdate,
  sanitizeAdminPasswordOutput,
  validateLocalAdminPassword,
} from '../scripts/set-local-admin-password.mjs'

function withTempEnvFiles(files: Record<string, string>, callback: (cwd: string) => void | Promise<void>) {
  const cwd = mkdtempSync(join(tmpdir(), 'boilabin-admin-local-'))

  try {
    for (const [name, content] of Object.entries(files)) {
      writeFileSync(join(cwd, name), content)
    }

    return callback(cwd)
  } finally {
    rmSync(cwd, { recursive: true, force: true })
  }
}

function createMockDb(admins: Array<{
  id: string
  email: string
  role: string
  isActive: boolean
  password: string | null
  updatedAt?: Date
}>) {
  const updates: unknown[] = []

  return {
    updates,
    user: {
      findUnique: async ({ where }: { where: { email: string } }) => (
        admins.find((admin) => admin.email === where.email) ?? null
      ),
      findMany: async () => admins,
      update: async (input: unknown) => {
        updates.push(input)
        return { id: 'updated' }
      },
    },
    $disconnect: async () => undefined,
  }
}

test('local admin password plan refuses a remote-looking app DB URL', () => {
  return withTempEnvFiles({
    '.env': [
      'DATABASE_URL="postgresql://postgres:postgres@db.example.test:5432/remote_app"',
      'SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_shadow"',
      `${LOCAL_ADMIN_PASSWORD_ENV}="ValidLocal!234"`,
    ].join('\n'),
  }, (cwd) => {
    const plan = createLocalAdminPasswordPlan({ cwd, baseEnv: {} })

    assert.equal(plan.safety.databaseUrl, 'remote-looking')
    assert.equal(plan.canRun, false)
  })
})

test('local admin password plan refuses same app and shadow DB', () => {
  return withTempEnvFiles({
    '.env.local': [
      'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_local"',
      'SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_local"',
      `${LOCAL_ADMIN_PASSWORD_ENV}="ValidLocal!234"`,
    ].join('\n'),
  }, (cwd) => {
    const plan = createLocalAdminPasswordPlan({ cwd, baseEnv: {} })

    assert.equal(plan.safety.shadowDatabaseSeparate, false)
    assert.equal(plan.canRun, false)
  })
})

test('local admin password validation requires strong local-only input', () => {
  assert.match(validateLocalAdminPassword('').join(' '), new RegExp(LOCAL_ADMIN_PASSWORD_ENV))
  assert.match(validateLocalAdminPassword('short').join(' '), /at least 12/)
  assert.deepEqual(validateLocalAdminPassword('ValidLocal!234'), [])
})

test('local admin password runner refuses missing password without touching DB', async () => {
  await withTempEnvFiles({
    '.env.local': [
      'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_local"',
      'SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_shadow"',
    ].join('\n'),
  }, async (cwd) => {
    let factoryCalls = 0
    const stderr: string[] = []
    const status = await runLocalAdminPasswordCli({
      cwd,
      baseEnv: {},
      stdout: () => undefined,
      stderr: (message: string) => stderr.push(message),
      prismaFactory: () => {
        factoryCalls += 1
        return createMockDb([])
      },
    })

    assert.equal(status, 1)
    assert.equal(factoryCalls, 0)
    assert.match(stderr.join('\n'), /Refusing to update admin password/)
  })
})

test('local admin password update refuses ambiguous multiple admins without selector', async () => {
  const db = createMockDb([
    { id: '1', email: 'admin-one@example.test', role: 'SUPER_ADMIN', isActive: true, password: 'old' },
    { id: '2', email: 'admin-two@example.test', role: 'ADMIN', isActive: true, password: 'old' },
  ])

  await assert.rejects(
    () => runLocalAdminPasswordUpdate({
      db,
      password: 'ValidLocal!234',
      targetEmail: null,
      hashPassword: async () => 'next-hash',
    }),
    /Multiple admin accounts/,
  )
  assert.equal(db.updates.length, 0)
})

test('local admin password update does not log or store raw password in update payload', async () => {
  const db = createMockDb([
    { id: '1', email: 'admin@example.test', role: 'SUPER_ADMIN', isActive: true, password: 'old' },
  ])

  const result = await runLocalAdminPasswordUpdate({
    db,
    password: 'ValidLocal!234',
    targetEmail: null,
    hashPassword: async () => 'next-hash',
  })

  const serializedUpdates = JSON.stringify(db.updates)

  assert.equal(result.maskedEmail, 'a***@example.test')
  assert.equal(db.updates.length, 1)
  assert(!serializedUpdates.includes('ValidLocal!234'))
  assert(serializedUpdates.includes('next-hash'))
})

test('local admin password CLI output omits password and hash values', async () => {
  await withTempEnvFiles({
    '.env.local': [
      'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_local"',
      'SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_shadow"',
      `${LOCAL_ADMIN_PASSWORD_ENV}="ValidLocal!234"`,
    ].join('\n'),
  }, async (cwd) => {
    const stdout: string[] = []
    const db = createMockDb([
      { id: '1', email: 'admin@example.test', role: 'SUPER_ADMIN', isActive: true, password: 'old' },
    ])
    const status = await runLocalAdminPasswordCli({
      cwd,
      baseEnv: {},
      stdout: (message: string) => stdout.push(message),
      stderr: () => undefined,
      prismaFactory: () => db,
      hashPassword: async () => 'next-hash',
    })
    const serialized = stdout.join('\n')

    assert.equal(status, 0)
    assert(!serialized.includes('ValidLocal!234'))
    assert(!serialized.includes('next-hash'))
    assert(!serialized.includes('admin@example.test'))
    assert(serialized.includes('a***@example.test'))
  })
})

test('sanitizeAdminPasswordOutput redacts URLs, emails, passwords, hashes, and secrets', () => {
  const sanitized = sanitizeAdminPasswordOutput([
    'DATABASE_URL=postgresql://user:pass@example.test/db',
    'admin@example.test',
    'password: PlainSecret123',
    'hash=abcdef123',
    'token=secret-token',
  ].join('\n'))

  assert(!sanitized.includes('postgresql://user:pass@example.test/db'))
  assert(!sanitized.includes('admin@example.test'))
  assert(!sanitized.includes('PlainSecret123'))
  assert(!sanitized.includes('abcdef123'))
  assert(!sanitized.includes('secret-token'))
  assert(sanitized.includes('[redacted-database-url]'))
  assert(sanitized.includes('[redacted-email]'))
})
