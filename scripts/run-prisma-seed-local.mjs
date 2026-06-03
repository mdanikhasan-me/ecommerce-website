import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  evaluateDatabaseSafety,
  loadEnv,
  printDatabaseSafetyReport,
} from './check-db-url-safety.mjs'

const SEED_ARGS = ['prisma/seed.ts']

export function sanitizeSeedOutput(value) {
  if (!value) return ''

  const redactedLines = value
    .split(/\r?\n/)
    .map((line) => {
      let sanitized = line
        .replace(/postgres(?:ql)?:\/\/[^\s"'<>]+/gi, '[redacted-database-url]')
        .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')

      if (/(password|credential|login|admin:|customer:|seller:|super admin)/i.test(sanitized)) {
        sanitized = '[redacted seed credential output]'
      }

      return sanitized
    })

  const compacted = []
  for (const line of redactedLines) {
    if (line === '[redacted seed credential output]' && compacted[compacted.length - 1] === line) {
      continue
    }
    compacted.push(line)
  }

  return compacted.join('\n')
}

export function createPrismaSeedLocalPlan({
  cwd = process.cwd(),
  baseEnv = process.env,
} = {}) {
  const env = loadEnv({ cwd, baseEnv })
  const safety = evaluateDatabaseSafety(env)

  return {
    env,
    safety,
    canRun: safety.safeForLocalMigration,
  }
}

export function getSeedInvocation(cwd) {
  const localTsxCli = resolve(cwd, 'node_modules/tsx/dist/cli.mjs')

  if (existsSync(localTsxCli)) {
    return {
      command: process.execPath,
      args: [localTsxCli, ...SEED_ARGS],
    }
  }

  return {
    command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
    args: ['tsx', ...SEED_ARGS],
  }
}

export function runPrismaSeedLocalCli({
  cwd = process.cwd(),
  baseEnv = process.env,
  stdout = console.log,
  stderr = console.error,
  spawn = spawnSync,
} = {}) {
  const plan = createPrismaSeedLocalPlan({ cwd, baseEnv })

  stdout('Prisma seed local env guardrail: .env is loaded first, then .env.local overrides it when present.')
  printDatabaseSafetyReport(plan.safety, stdout)
  stdout('Prisma seed local env guardrail: URL-shape readiness does not prove PostgreSQL is running.')

  if (!plan.canRun) {
    stderr('Refusing to run seed: DATABASE_URL and SHADOW_DATABASE_URL must both be local and separate.')
    return 1
  }

  stdout('Running Prisma seed with local env guardrail: tsx prisma/seed.ts')
  const invocation = getSeedInvocation(cwd)

  const result = spawn(invocation.command, invocation.args, {
    cwd,
    env: plan.env,
    encoding: 'utf8',
    stdio: 'pipe',
  })

  if (result.error) {
    stderr('Prisma seed command failed to start.')
    return 1
  }

  const sanitizedStdout = sanitizeSeedOutput(result.stdout ?? '')
  const sanitizedStderr = sanitizeSeedOutput(result.stderr ?? '')

  if (sanitizedStdout.trim()) stdout(sanitizedStdout)
  if (sanitizedStderr.trim()) stderr(sanitizedStderr)

  return result.status ?? 1
}

function isCliEntrypoint() {
  return Boolean(process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
}

if (isCliEntrypoint()) {
  process.exit(runPrismaSeedLocalCli())
}
