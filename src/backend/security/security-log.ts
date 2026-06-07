export const MAX_SECURITY_LOG_STRING_LENGTH = 240

type SecurityLogSeverity = 'info' | 'warn' | 'error'
type SecurityEventMetadata = Record<string, unknown>

export type SecurityEventInput = {
  type: string
  severity?: SecurityLogSeverity
  route?: string | null
  method?: string | null
  origin?: string | null
  userRole?: string | null
  statusCode?: number | null
  errorCode?: string | null
  detail?: string | null
  metadata?: SecurityEventMetadata | null
  timestamp?: string
}

export type SanitizedSecurityEvent = {
  type: string
  timestamp: string
  severity: SecurityLogSeverity
  route?: string
  method?: string
  origin?: string
  userRole?: string
  statusCode?: number
  errorCode?: string
  detail?: string
  metadata?: Record<string, string | number | boolean | Array<string | number | boolean>>
}

const TRUE_METHOD_PATTERN = /^[A-Z]{2,12}$/
const SAFE_EVENT_TYPE_PATTERN = /^[a-z0-9_.:-]{1,80}$/i
const SAFE_ERROR_CODE_PATTERN = /^[a-z0-9_.:-]{1,80}$/i
const SAFE_ROLE_PATTERN = /^[A-Z_]{1,40}$/
const SAFE_TOKEN_PATTERN = /^[a-z][a-z0-9_-]{0,80}$/i
const URL_FIELD_PATTERN = /(url|uri|href|source-file|document-uri|blocked-uri)/i
const PATH_FIELD_PATTERN = /(route|path|pathname)/i
const ORIGIN_FIELD_PATTERN = /(^|[-_])origin($|[-_])/i
const EMAIL_FIELD_PATTERN = /email/i
const FORBIDDEN_FIELD_PATTERN =
  /(authorization|bearer|cookie|credential|csrf|jwt|password|passphrase|payment|card|secret|session|token|phone|address|body|payload|raw|stack|database|connection)/i

function capString(value: string, maxLength = MAX_SECURITY_LOG_STRING_LENGTH) {
  return value.length > maxLength ? value.slice(0, maxLength) : value
}

function redactSensitiveText(value: string) {
  return value
    .replace(/\bauthorization\s*[:=]\s*Bearer\s+[A-Za-z0-9._~+/=-]+/gi, '[redacted]')
    .replace(
      /\b(token|secret|password|cookie|session|csrf|jwt)\s*[:=]\s*[^,\s;]+/gi,
      '[redacted]',
    )
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [redacted]')
}

function hasUrlUserinfo(url: URL) {
  return Boolean(url.username || url.password)
}

function isOriginField(key: string) {
  return ORIGIN_FIELD_PATTERN.test(key.replace(/([a-z0-9])([A-Z])/g, '$1-$2'))
}

export function sanitizeStringForLog(value: unknown, maxLength = MAX_SECURITY_LOG_STRING_LENGTH) {
  if (typeof value !== 'string') return undefined

  const cleaned = redactSensitiveText(value.trim().replace(/\s+/g, ' '))
  if (!cleaned) return undefined

  return capString(cleaned, maxLength)
}

export function sanitizeUrlForLog(value: unknown) {
  if (typeof value !== 'string') return undefined

  const trimmed = value.trim()
  if (!trimmed) return undefined

  const lower = trimmed.toLowerCase()
  if (['inline', 'eval', 'self', 'about:blank'].includes(lower)) return lower
  if (lower.startsWith('data:')) return 'data:'
  if (lower.startsWith('blob:')) return 'blob:'

  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '[unsupported-url]'
    if (hasUrlUserinfo(url)) return '[invalid-url]'

    return capString(`${url.origin}${url.pathname}`)
  } catch {
    if (trimmed.startsWith('/')) return sanitizePathnameForLog(trimmed)
    return SAFE_TOKEN_PATTERN.test(trimmed) ? capString(trimmed) : '[invalid-url]'
  }
}

export function sanitizePathnameForLog(value: unknown) {
  if (typeof value !== 'string') return undefined

  const trimmed = value.trim()
  if (!trimmed) return undefined

  try {
    const url = trimmed.startsWith('/')
      ? new URL(trimmed, 'https://local.invalid')
      : new URL(trimmed)

    return capString(url.pathname || '/')
  } catch {
    return undefined
  }
}

export function sanitizeOriginForLog(value: unknown) {
  if (typeof value !== 'string') return undefined

  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined
    if (hasUrlUserinfo(url)) return undefined

    return url.origin.toLowerCase()
  } catch {
    return undefined
  }
}

export function maskEmailForLog(value: unknown) {
  if (typeof value !== 'string') return undefined

  const trimmed = value.trim().toLowerCase()
  const match = trimmed.match(/^([^@\s]+)@([^@\s.]+(?:\.[^@\s.]+)+)$/)
  if (!match) return undefined

  const local = match[1]
  const domain = match[2]
  const domainParts = domain.split('.')
  const tld = domainParts.pop()
  const domainRoot = domainParts.join('.') || 'domain'

  return `${local.slice(0, 1)}***@${domainRoot.slice(0, 1)}***.${tld}`
}

function sanitizeEventType(value: unknown) {
  const cleaned = sanitizeStringForLog(value, 80)?.toLowerCase()
  return cleaned && SAFE_EVENT_TYPE_PATTERN.test(cleaned) ? cleaned : 'security_event'
}

function sanitizeMethod(value: unknown) {
  const method = sanitizeStringForLog(value, 12)?.toUpperCase()
  return method && TRUE_METHOD_PATTERN.test(method) ? method : undefined
}

function sanitizeRole(value: unknown) {
  const role = sanitizeStringForLog(value, 40)?.toUpperCase()
  return role && SAFE_ROLE_PATTERN.test(role) ? role : undefined
}

function sanitizeStatusCode(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined

  const statusCode = Math.trunc(value)
  return statusCode >= 100 && statusCode <= 599 ? statusCode : undefined
}

function sanitizeErrorCode(value: unknown) {
  const cleaned = sanitizeStringForLog(value, 80)?.toLowerCase()
  return cleaned && SAFE_ERROR_CODE_PATTERN.test(cleaned) ? cleaned : undefined
}

function sanitizePrimitiveMetadataValue(key: string, value: unknown) {
  if (FORBIDDEN_FIELD_PATTERN.test(key)) return undefined
  if (EMAIL_FIELD_PATTERN.test(key)) return maskEmailForLog(value)
  if (isOriginField(key)) return sanitizeOriginForLog(value)
  if (URL_FIELD_PATTERN.test(key)) return sanitizeUrlForLog(value)
  if (PATH_FIELD_PATTERN.test(key)) return sanitizePathnameForLog(value)

  if (typeof value === 'string') return sanitizeStringForLog(value)
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value)
  if (typeof value === 'boolean') return value

  return undefined
}

function sanitizeMetadataValue(key: string, value: unknown) {
  if (Array.isArray(value)) {
    const sanitized = value
      .slice(0, 8)
      .map((item) => sanitizePrimitiveMetadataValue(key, item))
      .filter((item): item is string | number | boolean => item !== undefined)

    return sanitized.length > 0 ? sanitized : undefined
  }

  return sanitizePrimitiveMetadataValue(key, value)
}

function sanitizeMetadata(metadata: SecurityEventMetadata | null | undefined) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return undefined

  const sanitized: NonNullable<SanitizedSecurityEvent['metadata']> = {}

  for (const [key, value] of Object.entries(metadata).slice(0, 16)) {
    const cleanKey = sanitizeStringForLog(key, 80)
    if (!cleanKey || FORBIDDEN_FIELD_PATTERN.test(cleanKey)) continue

    const cleanValue = sanitizeMetadataValue(cleanKey, value)
    if (cleanValue !== undefined) sanitized[cleanKey] = cleanValue
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined
}

function normalizeTimestamp(value: string | undefined) {
  if (value) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  }

  return new Date().toISOString()
}

export function sanitizeSecurityEvent(input: SecurityEventInput): SanitizedSecurityEvent {
  const event: SanitizedSecurityEvent = {
    type: sanitizeEventType(input.type),
    timestamp: normalizeTimestamp(input.timestamp),
    severity: input.severity ?? 'warn',
  }

  const route = sanitizePathnameForLog(input.route)
  if (route) event.route = route

  const method = sanitizeMethod(input.method)
  if (method) event.method = method

  const origin = sanitizeOriginForLog(input.origin)
  if (origin) event.origin = origin

  const userRole = sanitizeRole(input.userRole)
  if (userRole) event.userRole = userRole

  const statusCode = sanitizeStatusCode(input.statusCode)
  if (statusCode) event.statusCode = statusCode

  const errorCode = sanitizeErrorCode(input.errorCode)
  if (errorCode) event.errorCode = errorCode

  const detail = sanitizeStringForLog(input.detail)
  if (detail) event.detail = detail

  const metadata = sanitizeMetadata(input.metadata)
  if (metadata) event.metadata = metadata

  return event
}

export function logSecurityEvent(input: SecurityEventInput) {
  const event = sanitizeSecurityEvent(input)

  if (event.severity === 'error') {
    console.error('Security event', event)
  } else if (event.severity === 'info') {
    console.info('Security event', event)
  } else {
    console.warn('Security event', event)
  }

  return event
}
