import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const ENV_FILES = ['.env', '.env.local']
export const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0'])

export function parseEnvFile(path) {
  if (!existsSync(path)) return {}

  const values = {}
  const content = readFileSync(path, 'utf8')

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!match) continue

    let value = match[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    values[match[1]] = value
  }

  return values
}

export function loadEnv({
  cwd = process.cwd(),
  files = ENV_FILES,
  baseEnv = process.env,
} = {}) {
  return files.reduce((acc, file) => ({
    ...acc,
    ...parseEnvFile(resolve(cwd, file)),
  }), { ...baseEnv })
}

export function classifyDatabaseUrl(value) {
  if (!value?.trim()) return 'missing'

  try {
    const parsed = new URL(value)
    if (!parsed.protocol.startsWith('postgres')) return 'unknown'
    return LOCAL_HOSTNAMES.has(parsed.hostname) || parsed.hostname.endsWith('.localhost')
      ? 'local'
      : 'remote-looking'
  } catch {
    return 'unknown'
  }
}

export function normalizeDatabaseIdentity(value) {
  if (!value?.trim()) return null

  try {
    const parsed = new URL(value)
    if (!parsed.protocol.startsWith('postgres')) return null

    const hostname = parsed.hostname.toLowerCase()
    const port = parsed.port || '5432'
    const databaseName = decodeURIComponent(parsed.pathname.replace(/^\/+/, '').split('/')[0] ?? '')
    if (!databaseName) return null

    return `${hostname}:${port}/${databaseName}`
  } catch {
    return null
  }
}

export function evaluateDatabaseSafety(env) {
  const databaseUrl = classifyDatabaseUrl(env.DATABASE_URL)
  const shadowDatabaseUrl = classifyDatabaseUrl(env.SHADOW_DATABASE_URL)
  const databaseIdentity = normalizeDatabaseIdentity(env.DATABASE_URL)
  const shadowDatabaseIdentity = normalizeDatabaseIdentity(env.SHADOW_DATABASE_URL)
  const shadowDatabaseSeparate = Boolean(
    databaseIdentity &&
    shadowDatabaseIdentity &&
    databaseIdentity !== shadowDatabaseIdentity,
  )
  const safeForLocalMigration = databaseUrl === 'local' && shadowDatabaseUrl === 'local' && shadowDatabaseSeparate

  return {
    databaseUrl,
    shadowDatabaseUrl,
    shadowDatabaseSeparate,
    safeForLocalMigration,
  }
}

export function printDatabaseSafetyReport(result, log = console.log) {
  log('Database URL safety check: no database connection attempted.')
  log(`DATABASE_URL: ${result.databaseUrl}`)
  log(`SHADOW_DATABASE_URL: ${result.shadowDatabaseUrl}`)
  log(`Shadow database separate: ${result.shadowDatabaseSeparate ? 'yes' : 'no'}`)
  log(`Local migration ready: ${result.safeForLocalMigration ? 'yes' : 'no'}`)
}

export function runDbUrlSafetyCli({
  argv = process.argv.slice(2),
  cwd = process.cwd(),
  baseEnv = process.env,
  stdout = console.log,
  stderr = console.error,
} = {}) {
  const env = loadEnv({ cwd, baseEnv })
  const result = evaluateDatabaseSafety(env)
  const requireLocal = argv.includes('--require-local')

  printDatabaseSafetyReport(result, stdout)

  if (requireLocal && !result.safeForLocalMigration) {
    stderr('Refusing to continue: DATABASE_URL and SHADOW_DATABASE_URL must both be local and separate.')
    return 1
  }

  return 0
}

function isCliEntrypoint() {
  return Boolean(process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
}

if (isCliEntrypoint()) {
  process.exit(runDbUrlSafetyCli())
}
