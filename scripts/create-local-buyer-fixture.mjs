import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  evaluateDatabaseSafety,
  loadEnv,
  printDatabaseSafetyReport,
} from './check-db-url-safety.mjs'

export const LOCAL_BUYER_EMAIL_ENV = 'BOILABIN_LOCAL_BUYER_EMAIL'
export const LOCAL_BUYER_PASSWORD_ENV = 'BOILABIN_LOCAL_BUYER_PASSWORD'
export const DEFAULT_LOCAL_BUYER_EMAIL = 'local-buyer@boilabin.localhost'

const LOCAL_EMAIL_DOMAINS = new Set(['boilabin.localhost', 'localhost'])

export function maskBuyerEmailForLog(email) {
  const [name, domain] = String(email ?? '').split('@')
  if (!name || !domain) return '[redacted-email]'

  return `${name.slice(0, 1)}***@${domain}`
}

export function sanitizeBuyerFixtureOutput(value) {
  return String(value ?? '')
    .replace(/postgres(?:ql)?:\/\/[^\s"'<>]+/gi, '[redacted-database-url]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/\b(password|hash|secret|token|cookie|session|authorization)\s*[:=]\s*[^,\s;]+/gi, '$1=[redacted]')
}

export function normalizeLocalBuyerEmail(value) {
  return String(value || DEFAULT_LOCAL_BUYER_EMAIL).trim().toLowerCase()
}

export function validateLocalBuyerEmail(email) {
  const errors = []
  const value = normalizeLocalBuyerEmail(email)
  const match = value.match(/^[^@\s]+@([^@\s]+)$/)

  if (!match) {
    errors.push(`${LOCAL_BUYER_EMAIL_ENV} must be a valid local-only email address.`)
    return errors
  }

  const domain = match[1]
  if (!LOCAL_EMAIL_DOMAINS.has(domain) && !domain.endsWith('.localhost')) {
    errors.push(`${LOCAL_BUYER_EMAIL_ENV} must use a local-only .localhost domain.`)
  }

  return errors
}

export function validateLocalBuyerPassword(password) {
  const errors = []
  const value = String(password ?? '')

  if (!value) {
    errors.push(`${LOCAL_BUYER_PASSWORD_ENV} is required.`)
    return errors
  }

  if (value.length < 12) errors.push('Password must be at least 12 characters.')
  if (!/[a-z]/.test(value)) errors.push('Password must include a lowercase letter.')
  if (!/[A-Z]/.test(value)) errors.push('Password must include an uppercase letter.')
  if (!/[0-9]/.test(value)) errors.push('Password must include a number.')
  if (!/[^A-Za-z0-9]/.test(value)) errors.push('Password must include a symbol.')

  return errors
}

export function createLocalBuyerFixturePlan({
  cwd = process.cwd(),
  baseEnv = process.env,
  envFiles,
} = {}) {
  const env = loadEnv({
    cwd,
    ...(envFiles ? { files: envFiles } : {}),
    baseEnv,
  })
  const safety = evaluateDatabaseSafety(env)
  const email = normalizeLocalBuyerEmail(env[LOCAL_BUYER_EMAIL_ENV])
  const password = env[LOCAL_BUYER_PASSWORD_ENV] ?? ''
  const emailErrors = validateLocalBuyerEmail(email)
  const passwordErrors = validateLocalBuyerPassword(password)

  return {
    env,
    safety,
    email,
    hasPassword: Boolean(password),
    emailErrors,
    passwordErrors,
    canRunSafety: safety.safeForLocalMigration,
    canRunInput: emailErrors.length === 0 && passwordErrors.length === 0,
    canRun: safety.safeForLocalMigration && emailErrors.length === 0 && passwordErrors.length === 0,
  }
}

export async function upsertLocalBuyerFixture({
  db,
  email,
  password,
  hashPassword = (value) => bcrypt.hash(value, 12),
}) {
  const normalizedEmail = normalizeLocalBuyerEmail(email)
  const existing = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  })

  if (existing && existing.role !== 'CUSTOMER') {
    throw new Error('Existing local fixture account is not a CUSTOMER account.')
  }

  const passwordHash = await hashPassword(password)
  const user = existing
    ? await db.user.update({
      where: { id: existing.id },
      data: {
        name: 'Local Checkout Buyer',
        password: passwordHash,
        role: 'CUSTOMER',
        isActive: true,
      },
      select: { id: true, email: true, role: true },
    })
    : await db.user.create({
      data: {
        name: 'Local Checkout Buyer',
        email: normalizedEmail,
        password: passwordHash,
        role: 'CUSTOMER',
        isActive: true,
      },
      select: { id: true, email: true, role: true },
    })

  await db.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
    select: { id: true },
  })

  await db.wishlist.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
    select: { id: true },
  })

  return {
    maskedEmail: maskBuyerEmailForLog(user.email),
    role: user.role,
    created: !existing,
    cartReady: true,
    wishlistReady: true,
  }
}

export async function runLocalBuyerFixtureCli({
  cwd = process.cwd(),
  baseEnv = process.env,
  stdout = console.log,
  stderr = console.error,
  prismaFactory = (env) => new PrismaClient({ datasources: { db: { url: env.DATABASE_URL } } }),
  hashPassword = (value) => bcrypt.hash(value, 12),
} = {}) {
  const plan = createLocalBuyerFixturePlan({ cwd, baseEnv })

  stdout('Local buyer fixture guardrail: .env is loaded first, then .env.local overrides it when present.')
  printDatabaseSafetyReport(plan.safety, stdout)
  stdout('Local buyer fixture guardrail: values are local-only and secrets will not be printed.')

  if (!plan.canRunSafety) {
    stderr('Refusing to create local buyer fixture: DATABASE_URL and SHADOW_DATABASE_URL must both be local and separate.')
    return 1
  }

  if (!plan.canRunInput) {
    stderr(`Refusing to create local buyer fixture: ${[...plan.emailErrors, ...plan.passwordErrors].join(' ')}`)
    return 1
  }

  const db = prismaFactory(plan.env)

  try {
    const result = await upsertLocalBuyerFixture({
      db,
      email: plan.email,
      password: plan.env[LOCAL_BUYER_PASSWORD_ENV],
      hashPassword,
    })

    stdout(`Local buyer fixture ready for ${result.maskedEmail} (${result.role}).`)
    stdout(`Created new buyer: ${result.created ? 'yes' : 'no'}.`)
    stdout(`Cart ready: ${result.cartReady ? 'yes' : 'no'}. Wishlist ready: ${result.wishlistReady ? 'yes' : 'no'}.`)
    stdout('Use the local login form with the local-only buyer email and the password supplied outside git.')
    return 0
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Local buyer fixture setup failed.'
    stderr(sanitizeBuyerFixtureOutput(message))
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
  runLocalBuyerFixtureCli()
    .then((status) => {
      process.exit(status)
    })
    .catch((error) => {
      console.error(sanitizeBuyerFixtureOutput(error instanceof Error ? error.message : 'Local buyer fixture setup failed.'))
      process.exit(1)
    })
}
