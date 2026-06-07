import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  evaluateDatabaseSafety,
  loadEnv,
  printDatabaseSafetyReport,
} from './check-db-url-safety.mjs'

const SAFE_COMMANDS = new Set(['validate', 'generate'])

export function resolvePrismaArgs(argv) {
  if (!Array.isArray(argv) || argv.length === 0) {
    throw new Error('Usage: node scripts/run-prisma-local.mjs <validate|generate|migrate dev> [...args]')
  }

  const [command, subcommand, ...rest] = argv

  if (SAFE_COMMANDS.has(command)) {
    return [command, ...(subcommand ? [subcommand, ...rest] : [])]
  }

  if (command === 'migrate' && (subcommand === 'dev' || subcommand === 'deploy')) {
    return [command, subcommand, ...rest]
  }

  throw new Error('Unsupported Prisma local command. Allowed commands: validate, generate, migrate dev, migrate deploy.')
}

/**
 * @param {{ argv?: string[], cwd?: string, baseEnv?: Record<string, string | undefined> }} [options]
 */
export function createPrismaLocalPlan({
  argv,
  cwd = process.cwd(),
  baseEnv = process.env,
} = {}) {
  const prismaArgs = resolvePrismaArgs(argv)
  const env = loadEnv({ cwd, baseEnv })
  const safety = evaluateDatabaseSafety(env)

  return {
    env,
    prismaArgs,
    safety,
    canRun: safety.safeForLocalMigration,
  }
}

export function getPrismaCliInvocation(cwd, prismaArgs) {
  const localPrismaCli = resolve(cwd, 'node_modules/prisma/build/index.js')

  if (existsSync(localPrismaCli)) {
    return {
      command: process.execPath,
      args: [localPrismaCli, ...prismaArgs],
    }
  }

  return {
    command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
    args: ['prisma', ...prismaArgs],
  }
}

export function runPrismaLocalCli({
  argv = process.argv.slice(2),
  cwd = process.cwd(),
  baseEnv = process.env,
  stdout = console.log,
  stderr = console.error,
  spawn = spawnSync,
} = {}) {
  let plan

  try {
    plan = createPrismaLocalPlan({ argv, cwd, baseEnv })
  } catch (error) {
    stderr(error instanceof Error ? error.message : 'Invalid Prisma local command.')
    return 1
  }

  stdout('Prisma local env guardrail: .env is loaded first, then .env.local overrides it when present.')
  printDatabaseSafetyReport(plan.safety, stdout)
  stdout('Prisma local env guardrail: URL-shape readiness does not prove PostgreSQL is running.')

  if (!plan.canRun) {
    stderr('Refusing to run Prisma: DATABASE_URL and SHADOW_DATABASE_URL must both be local and separate.')
    return 1
  }

  stdout(`Running Prisma with local env guardrail: prisma ${plan.prismaArgs.join(' ')}`)
  const invocation = getPrismaCliInvocation(cwd, plan.prismaArgs)

  const result = spawn(invocation.command, invocation.args, {
    cwd,
    env: plan.env,
    stdio: 'inherit',
  })

  if (result.error) {
    stderr('Prisma command failed to start.')
    return 1
  }

  return result.status ?? 1
}

function isCliEntrypoint() {
  return Boolean(process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
}

if (isCliEntrypoint()) {
  process.exit(runPrismaLocalCli())
}
