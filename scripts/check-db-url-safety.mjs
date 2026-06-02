import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const ENV_FILES = ['.env', '.env.local']
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0'])

function parseEnvFile(path) {
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

function loadEnv() {
  return ENV_FILES.reduce((acc, file) => ({
    ...acc,
    ...parseEnvFile(resolve(process.cwd(), file)),
  }), { ...process.env })
}

function classifyDatabaseUrl(value) {
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

function normalizeDatabaseIdentity(value) {
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

const env = loadEnv()
const databaseUrl = classifyDatabaseUrl(env.DATABASE_URL)
const shadowDatabaseUrl = classifyDatabaseUrl(env.SHADOW_DATABASE_URL)
const databaseIdentity = normalizeDatabaseIdentity(env.DATABASE_URL)
const shadowDatabaseIdentity = normalizeDatabaseIdentity(env.SHADOW_DATABASE_URL)
const shadowDatabaseSeparate = Boolean(
  databaseIdentity &&
  shadowDatabaseIdentity &&
  databaseIdentity !== shadowDatabaseIdentity,
)
const requireLocal = process.argv.includes('--require-local')
const safeForLocalMigration = databaseUrl === 'local' && shadowDatabaseUrl === 'local' && shadowDatabaseSeparate

console.log('Database URL safety check: no database connection attempted.')
console.log(`DATABASE_URL: ${databaseUrl}`)
console.log(`SHADOW_DATABASE_URL: ${shadowDatabaseUrl}`)
console.log(`Shadow database separate: ${shadowDatabaseSeparate ? 'yes' : 'no'}`)
console.log(`Local migration ready: ${safeForLocalMigration ? 'yes' : 'no'}`)

if (requireLocal && !safeForLocalMigration) {
  console.error('Refusing to continue: DATABASE_URL and SHADOW_DATABASE_URL must both be local and separate.')
  process.exit(1)
}
