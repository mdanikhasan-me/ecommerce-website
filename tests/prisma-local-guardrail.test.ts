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
    const env = loadEnv({ cwd, baseEnv: {} })
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
  assert.throws(() => resolvePrismaArgs(['db', 'push']), /Unsupported Prisma local command/)
})

test('Prisma local plan refuses unsafe remote-looking DB URL classification', () => {
  withTempEnvFiles({
    '.env': [
      'DATABASE_URL="postgresql://postgres:postgres@db.example.test:5432/remote_app"',
      'SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_shadow"',
    ].join('\n'),
  }, (cwd) => {
    const plan = createPrismaLocalPlan({ argv: ['validate'], cwd, baseEnv: {} })

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
      baseEnv: {},
      stdout: () => undefined,
      stderr: () => undefined,
      spawn: (command: string, args: string[], options: { env: Record<string, string> }) => {
        spawned.push({ command, args, env: options.env })
        return { status: 0 }
      },
    })

    assert.equal(status, 0)
    assert.equal(spawned.length, 1)
    assert.deepEqual(spawned[0].args, ['prisma', 'validate'])
    assert.match(spawned[0].env.DATABASE_URL, /localhost:5432\/boilabin_local/)
    assert.match(spawned[0].env.SHADOW_DATABASE_URL, /localhost:5432\/boilabin_shadow/)
  })
})
