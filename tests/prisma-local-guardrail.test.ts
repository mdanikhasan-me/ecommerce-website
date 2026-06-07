import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import {
  evaluateDatabaseSafety,
  loadEnv,
} from '../scripts/check-db-url-safety.mjs'
import {
  createPrismaLocalPlan,
  resolvePrismaArgs,
  runPrismaLocalCli,
} from '../scripts/run-prisma-local.mjs'
import {
  createPrismaSeedLocalPlan,
  runPrismaSeedLocalCli,
  sanitizeSeedOutput,
} from '../scripts/run-prisma-seed-local.mjs'

function testEnv(values: Record<string, string> = {}) {
  return values as NodeJS.ProcessEnv
}

function withTempEnvFiles(files: Record<string, string>, callback: (cwd: string) => void) {
  const cwd = mkdtempSync(join(tmpdir(), 'boilabin-prisma-local-'))

  try {
    for (const [name, content] of Object.entries(files)) {
      writeFileSync(join(cwd, name), content)
    }

    callback(cwd)
  } finally {
    rmSync(cwd, { recursive: true, force: true })
  }
}

test('DB URL safety loads .env first and .env.local as the local override', () => {
  withTempEnvFiles({
    '.env': [
      'DATABASE_URL="postgresql://postgres:postgres@db.example.test:5432/remote_app"',
      'SHADOW_DATABASE_URL="postgresql://postgres:postgres@db.example.test:5432/remote_shadow"',
    ].join('\n'),
    '.env.local': [
      'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_local"',
      'SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_shadow"',
    ].join('\n'),
  }, (cwd) => {
    const env = loadEnv({ cwd, baseEnv: testEnv() })
    const safety = evaluateDatabaseSafety(env)

    assert.equal(safety.databaseUrl, 'local')
    assert.equal(safety.shadowDatabaseUrl, 'local')
    assert.equal(safety.shadowDatabaseSeparate, true)
    assert.equal(safety.safeForLocalMigration, true)
  })
})

test('DB URL safety rejects app and shadow database URLs that target the same database', () => {
  const safety = evaluateDatabaseSafety({
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/boilabin_local',
    SHADOW_DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/boilabin_local',
  })

  assert.equal(safety.databaseUrl, 'local')
  assert.equal(safety.shadowDatabaseUrl, 'local')
  assert.equal(safety.shadowDatabaseSeparate, false)
  assert.equal(safety.safeForLocalMigration, false)
})

test('Prisma local command resolver allows only explicit local Prisma commands', () => {
  assert.deepEqual(resolvePrismaArgs(['validate']), ['validate'])
  assert.deepEqual(resolvePrismaArgs(['generate']), ['generate'])
  assert.deepEqual(resolvePrismaArgs(['migrate', 'dev', '--name', 'local_change']), [
    'migrate',
    'dev',
    '--name',
    'local_change',
  ])
  assert.deepEqual(resolvePrismaArgs(['migrate', 'deploy']), ['migrate', 'deploy'])
  assert.throws(() => resolvePrismaArgs(['db', 'push']), /Unsupported Prisma local command/)
})

test('Prisma local plan refuses unsafe remote-looking DB URL classification', () => {
  withTempEnvFiles({
    '.env': [
      'DATABASE_URL="postgresql://postgres:postgres@db.example.test:5432/remote_app"',
      'SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_shadow"',
    ].join('\n'),
  }, (cwd) => {
    const plan = createPrismaLocalPlan({ argv: ['validate'], cwd, baseEnv: testEnv() })

    assert.equal(plan.safety.databaseUrl, 'remote-looking')
    assert.equal(plan.canRun, false)
  })
})

test('Prisma local runner passes merged local env values to the spawned Prisma command', () => {
  withTempEnvFiles({
    '.env': [
      'DATABASE_URL="postgresql://postgres:postgres@db.example.test:5432/remote_app"',
      'SHADOW_DATABASE_URL="postgresql://postgres:postgres@db.example.test:5432/remote_shadow"',
    ].join('\n'),
    '.env.local': [
      'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_local"',
      'SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_shadow"',
    ].join('\n'),
  }, (cwd) => {
    const spawned: Array<{ command: string; args: string[]; env: Record<string, string> }> = []
    const status = runPrismaLocalCli({
      argv: ['validate'],
      cwd,
      baseEnv: testEnv(),
      stdout: () => undefined,
      stderr: () => undefined,
      spawn: ((command: string, args: string[], options: { env: Record<string, string> }) => {
        spawned.push({ command, args, env: options.env })
        return { status: 0 }
      }) as any,
    })

    assert.equal(status, 0)
    assert.equal(spawned.length, 1)
    assert.deepEqual(spawned[0].args, ['prisma', 'validate'])
    assert.match(spawned[0].env.DATABASE_URL, /localhost:5432\/boilabin_local/)
    assert.match(spawned[0].env.SHADOW_DATABASE_URL, /localhost:5432\/boilabin_shadow/)
  })
})

test('Prisma seed local plan uses .env.local to override a remote-looking .env', () => {
  withTempEnvFiles({
    '.env': [
      'DATABASE_URL="postgresql://postgres:postgres@db.example.test:5432/remote_app"',
      'SHADOW_DATABASE_URL="postgresql://postgres:postgres@db.example.test:5432/remote_shadow"',
    ].join('\n'),
    '.env.local': [
      'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_local"',
      'SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_shadow"',
    ].join('\n'),
  }, (cwd) => {
    const plan = createPrismaSeedLocalPlan({ cwd, baseEnv: testEnv() })

    assert.equal(plan.safety.databaseUrl, 'local')
    assert.equal(plan.safety.shadowDatabaseUrl, 'local')
    assert.equal(plan.safety.shadowDatabaseSeparate, true)
    assert.equal(plan.canRun, true)
  })
})

test('Prisma seed local plan refuses a remote-looking app database URL', () => {
  withTempEnvFiles({
    '.env': [
      'DATABASE_URL="postgresql://postgres:postgres@db.example.test:5432/remote_app"',
      'SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_shadow"',
    ].join('\n'),
  }, (cwd) => {
    const plan = createPrismaSeedLocalPlan({ cwd, baseEnv: testEnv() })

    assert.equal(plan.safety.databaseUrl, 'remote-looking')
    assert.equal(plan.canRun, false)
  })
})

test('Prisma seed local runner refuses missing shadow DB and does not spawn seed', () => {
  withTempEnvFiles({
    '.env.local': 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_local"',
  }, (cwd) => {
    let spawnCount = 0
    const stderr: string[] = []
    const status = runPrismaSeedLocalCli({
      cwd,
      baseEnv: testEnv(),
      stdout: () => undefined,
      stderr: (message: string) => stderr.push(message),
      spawn: (() => {
        spawnCount += 1
        return { status: 0 }
      }) as any,
    })

    assert.equal(status, 1)
    assert.equal(spawnCount, 0)
    assert.match(stderr.join('\n'), /Refusing to run seed/)
  })
})

test('Prisma seed local runner refuses same app and shadow database', () => {
  withTempEnvFiles({
    '.env.local': [
      'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_local"',
      'SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_local"',
    ].join('\n'),
  }, (cwd) => {
    let spawnCount = 0
    const status = runPrismaSeedLocalCli({
      cwd,
      baseEnv: testEnv(),
      stdout: () => undefined,
      stderr: () => undefined,
      spawn: (() => {
        spawnCount += 1
        return { status: 0 }
      }) as any,
    })

    assert.equal(status, 1)
    assert.equal(spawnCount, 0)
  })
})

test('Prisma seed local runner redacts seed credential and URL output', () => {
  withTempEnvFiles({
    '.env.local': [
      'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_local"',
      'SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_shadow"',
    ].join('\n'),
  }, (cwd) => {
    const stdout: string[] = []
    const status = runPrismaSeedLocalCli({
      cwd,
      baseEnv: testEnv(),
      stdout: (message: string) => stdout.push(message),
      stderr: () => undefined,
      spawn: (() => ({
        status: 0,
        stdout: [
          'DATABASE_URL=postgresql://user:pass@example.test/db',
          'Admin login: admin@example.test',
          'Password: ExampleSecret123',
          'Admin: admin@example.test / ExampleSecret123',
          'Customer: customer@example.test / ExampleSecret123',
          'Seed completed',
        ].join('\n'),
        stderr: '',
      })) as any,
    })

    const serialized = stdout.join('\n')

    assert.equal(status, 0)
    assert(!serialized.includes('postgresql://user:pass@example.test/db'))
    assert(!serialized.includes('admin@example.test'))
    assert(!serialized.includes('ExampleSecret123'))
    assert(serialized.includes('[redacted-database-url]'))
    assert(serialized.includes('[redacted seed credential output]'))
    assert(serialized.includes('Seed completed'))
  })
})

test('sanitizeSeedOutput redacts database URLs, emails, and credential lines', () => {
  const output = sanitizeSeedOutput([
    'postgresql://user:pass@example.test/db',
    'customer@example.test',
    'password: secret',
    'regular status line',
  ].join('\n'))

  assert(!output.includes('postgresql://user:pass@example.test/db'))
  assert(!output.includes('customer@example.test'))
  assert(!output.includes('secret'))
  assert(output.includes('[redacted-database-url]'))
  assert(output.includes('[redacted-email]'))
  assert(output.includes('[redacted seed credential output]'))
  assert(output.includes('regular status line'))
})
