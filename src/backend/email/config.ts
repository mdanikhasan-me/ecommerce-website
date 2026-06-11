import { isSafeHeaderValue, isValidEmailAddress, normalizeEmailAddress } from '@/backend/email/sanitize'

type EmailEnv = Record<string, string | undefined>

const DEFAULT_PRODUCTION_APP_URL = 'https://boilabin.com'
const DEFAULT_ORDER_NOTIFICATION_EMAIL = 'admin@boilabin.com'
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])
const MIN_PROCESSOR_SECRET_LENGTH = 32
const TRUE_VALUES = new Set(['1', 'true', 'yes'])

export type DisabledEmailConfig = {
  enabled: false
  /** Safe, non-secret explanation for logs and the processor response. */
  reason: string
  orderNotificationEmail: string
}

export type EnabledEmailConfig = {
  enabled: true
  provider: 'brevo'
  brevoApiKey: string
  fromName: string
  fromAddress: string
  replyTo: string | null
  orderNotificationEmail: string
}

export type EmailConfig = DisabledEmailConfig | EnabledEmailConfig

function parseBoolean(value: string | undefined): boolean {
  return TRUE_VALUES.has((value ?? '').trim().toLowerCase())
}

export function getOrderNotificationEmail(env: EmailEnv = process.env): string {
  const configured = env.ORDER_NOTIFICATION_EMAIL?.trim().toLowerCase()
  return configured && isValidEmailAddress(configured) ? configured : DEFAULT_ORDER_NOTIFICATION_EMAIL
}

/**
 * Server-only email configuration. When sending is enabled every required
 * value is strictly validated; otherwise a safe disabled state is returned
 * and the application keeps working without email.
 */
export function getEmailConfig(env: EmailEnv = process.env): EmailConfig {
  const orderNotificationEmail = getOrderNotificationEmail(env)

  if (!parseBoolean(env.EMAIL_ENABLED)) {
    return { enabled: false, reason: 'email_disabled_by_configuration', orderNotificationEmail }
  }

  const provider = (env.EMAIL_PROVIDER ?? '').trim().toLowerCase()
  if (provider !== 'brevo') {
    return { enabled: false, reason: 'email_provider_not_configured', orderNotificationEmail }
  }

  const brevoApiKey = env.BREVO_API_KEY?.trim() ?? ''
  const fromName = env.EMAIL_FROM_NAME?.trim() ?? ''
  const fromAddress = env.EMAIL_FROM_ADDRESS?.trim().toLowerCase() ?? ''
  const replyToRaw = env.EMAIL_REPLY_TO?.trim().toLowerCase() ?? ''

  if (!brevoApiKey) {
    return { enabled: false, reason: 'email_api_key_missing', orderNotificationEmail }
  }
  if (!isSafeHeaderValue(fromName)) {
    return { enabled: false, reason: 'email_from_name_invalid', orderNotificationEmail }
  }
  if (!isValidEmailAddress(fromAddress)) {
    return { enabled: false, reason: 'email_from_address_invalid', orderNotificationEmail }
  }
  if (replyToRaw && !isValidEmailAddress(replyToRaw)) {
    return { enabled: false, reason: 'email_reply_to_invalid', orderNotificationEmail }
  }

  return {
    enabled: true,
    provider: 'brevo',
    brevoApiKey,
    fromName,
    fromAddress: normalizeEmailAddress(fromAddress),
    replyTo: replyToRaw ? normalizeEmailAddress(replyToRaw) : null,
    orderNotificationEmail,
  }
}

export function getEmailProcessorSecret(env: EmailEnv = process.env): string | null {
  const secret = env.EMAIL_PROCESSOR_SECRET?.trim() ?? ''
  return secret.length >= MIN_PROCESSOR_SECRET_LENGTH ? secret : null
}

export type EmailWebhookCredentials = {
  username: string
  password: string
}

export function getEmailWebhookCredentials(env: EmailEnv = process.env): EmailWebhookCredentials | null {
  const username = env.EMAIL_WEBHOOK_USERNAME?.trim() ?? ''
  const password = env.EMAIL_WEBHOOK_PASSWORD?.trim() ?? ''
  if (username.length < 8 || password.length < 16) return null
  return { username, password }
}

/**
 * Canonical absolute origin for links inside emails. Never derived from
 * request headers. Localhost is allowed only outside production.
 */
export function getEmailAppUrl(env: EmailEnv = process.env): string {
  const candidates = [env.APP_URL, env.NEXT_PUBLIC_SITE_URL]

  for (const candidate of candidates) {
    const trimmed = candidate?.trim()
    if (!trimmed) continue

    try {
      const url = new URL(trimmed)
      if (url.protocol !== 'http:' && url.protocol !== 'https:') continue
      if (url.username || url.password) continue
      if (LOCAL_HOSTNAMES.has(url.hostname)) {
        if (env.NODE_ENV === 'production') continue
        return url.origin
      }
      if (url.protocol !== 'https:' && env.NODE_ENV === 'production') continue
      return url.origin
    } catch {
      continue
    }
  }

  return DEFAULT_PRODUCTION_APP_URL
}
