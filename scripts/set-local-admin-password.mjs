import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  evaluateDatabaseSafety,
  loadEnv,
  printDatabaseSafetyReport,
} from './check-db-url-safety.mjs'

export const LOCAL_ADMIN_PASSWORD_ENV = 'BOILABIN_LOCAL_ADMIN_PASSWORD'
export const LOCAL_ADMIN_EMAIL_ENV = 'BOILABIN_LOCAL_ADMIN_EMAIL'
const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN'])

export function maskAdminEmailForLog(email) {
  const [name, domain] = String(email ?? '').split('@')
  if (!name || !domain) return '[redacted-email]'

  return `${name.slice(0, 1)}***@${domain}`
}

export function sanitizeAdminPasswordOutput(value) {
  return String(value ?? '')
    .replace(/postgres(?:ql)?:\/\/[^\s"'<>]+/gi, '[redacted-database-url]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/\b(password|hash|secret|token)\s*[:=]\s*[^,\s;]+/gi, '$1=[redacted]')
}

export function validateLocalAdminPassword(password) {
  const errors = []
  const value = String(password ?? '')

  if (!value) {
    errors.push(`${LOCAL_ADMIN_PASSWORD_ENV} is required.`)
    return errors
  }

  if (value.length < 12) errors.push('Password must be at least 12 characters.')
  if (!/[a-z]/.test(value)) errors.push('Password must include a lowercase letter.')
  if (!/[A-Z]/.test(value)) errors.push('Password must include an uppercase letter.')
  if (!/[0-9]/.test(value)) errors.push('Password must include a number.')
  if (!/[^A-Za-z0-9]/.test(value)) errors.push('Password must include a symbol.')

  return errors
}

export function createLocalAdminPasswordPlan({
  cwd = process.cwd(),
  baseEnv = process.env,
} = {}) {
  const env = loadEnv({ cwd, baseEnv })
  const safety = evaluateDatabaseSafety(env)
  const targetEmail = env[LOCAL_ADMIN_EMAIL_ENV]?.trim() || null
  const password = env[LOCAL_ADMIN_PASSWORD_ENV] ?? ''
  const passwordErrors = validateLocalAdminPassword(password)

  return {
    env,
    safety,
    targetEmail,
    hasPassword: Boolean(password),
    passwordErrors,
    canRunSafety: safety.safeForLocalMigration,
    canRunInput: passwordErrors.length === 0,
    canRun: safety.safeForLocalMigration && passwordErrors.length === 0,
  }
}

async function findTargetAdmin(db, targetEmail) {
  const select = {
    id: true,
    email: true,
    role: true,
    isActive: true,
    password: true,
    updatedAt: true,
  }

  if (targetEmail) {
    const user = await db.user.findUnique({ where: { email: targetEmail }, select })
    if (!user) throw new Error('No admin account matched the provided selector.')
    if (!ADMIN_ROLES.has(user.role)) throw new Error('Selected account is not an admin account.')
    return user
  }

  const admins = await db.user.findMany({
    where: { role: { in: Array.from(ADMIN_ROLES) } },
    orderBy: { createdAt: 'asc' },
    select,
  })

  if (admins.length === 0) throw new Error('No admin account exists in the local database.')
  if (admins.length > 1) {
    throw new Error(`Multiple admin accounts exist. Set ${LOCAL_ADMIN_EMAIL_ENV} to select one.`)
  }

  return admins[0]
}

export async function runLocalAdminPasswordUpdate({
  db,
  password,
  targetEmail,
  hashPassword = (value) => bcrypt.hash(value, 12),
}) {
  const target = await findTargetAdmin(db, targetEmail)

  if (!target.isActive) throw new Error('Selected admin account is inactive.')

  const nextPasswordHash = await hashPassword(password)
  await db.user.update({
    where: { id: target.id },
    data: { password: nextPasswordHash },
    select: { id: true },
  })

  return {
    maskedEmail: maskAdminEmailForLog(target.email),
    role: target.role,
    hadPasswordHash: Boolean(target.password),
  }
}

export async function runLocalAdminPasswordCli({
  cwd = process.cwd(),
  baseEnv = process.env,
  stdout = console.log,
  stderr = console.error,
  prismaFactory = (env) => new PrismaClient({ datasources: { db: { url: env.DATABASE_URL } } }),
  hashPassword = (value) => bcrypt.hash(value, 12),
} = {}) {
  const plan = createLocalAdminPasswordPlan({ cwd, baseEnv })

  stdout('Local admin password guardrail: .env is loaded first, then .env.local overrides it when present.')
  printDatabaseSafetyReport(plan.safety, stdout)
  stdout('Local admin password guardrail: values are local-only and secrets will not be printed.')

  if (!plan.canRunSafety) {
    stderr('Refusing to update admin password: DATABASE_URL and SHADOW_DATABASE_URL must both be local and separate.')
    return 1
  }

  if (!plan.canRunInput) {
    stderr(`Refusing to update admin password: ${plan.passwordErrors.join(' ')}`)
    return 1
  }

  const db = prismaFactory(plan.env)

  try {
    const result = await runLocalAdminPasswordUpdate({
      db,
      password: plan.env[LOCAL_ADMIN_PASSWORD_ENV],
      targetEmail: plan.targetEmail,
      hashPassword,
    })

    stdout(`Updated local admin password for ${result.maskedEmail} (${result.role}).`)
    stdout(`Previous password hash existed: ${result.hadPasswordHash ? 'yes' : 'no'}.`)
    return 0
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Local admin password update failed.'
    stderr(sanitizeAdminPasswordOutput(message))
    return 1
  } finally {
    if (typeof db.$disconnect === 'function') {
      await db.$disconnect()
    }
  }
}

function isCliEntrypoint() {
  return Boolean(process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
}

if (isCliEntrypoint()) {
  runLocalAdminPasswordCli()
    .then((status) => {
      process.exit(status)
    })
    .catch((error) => {
      console.error(sanitizeAdminPasswordOutput(error instanceof Error ? error.message : 'Local admin password update failed.'))
      process.exit(1)
    })
}
