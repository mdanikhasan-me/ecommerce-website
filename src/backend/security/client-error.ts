const MAX_CLIENT_ERROR_MESSAGE_LENGTH = 180

const SAFE_EXACT_MESSAGES = new Set([
  'Unauthorized',
])

const UNSAFE_CLIENT_MESSAGE_PATTERNS = [
  /\bprisma\b/i,
  /\bP\d{4}\b/,
  /\bdatabase\b/i,
  /\bpostgres(?:ql)?\b/i,
  /\bsql\b/i,
  /\bconstraint\b/i,
  /\bforeign key\b/i,
  /\bunique constraint\b/i,
  /\btransaction\b/i,
  /\bconnect\s+econn/i,
  /\bDATABASE_URL\b/i,
  /\b[A-Z]:[\\/]/,
  /(?:^|[\s("'`])\/(?:app|var|tmp|home|users|workspace|projects)\//i,
  /\bnode_modules\b/i,
  /\bat\s+\S+\s+\(/,
  /\bstack\b/i,
  /\b(token|secret|authorization|cookie|session|csrf|jwt|bearer)\b/i,
  /https?:\/\/\S+[?#]\S+/i,
  /postgres(?:ql)?:\/\/\S+/i,
  /[\r\n]/,
]

function normalizeClientMessage(value: unknown) {
  if (typeof value !== 'string') return null

  const normalized = value.trim().replace(/\s+/g, ' ')
  if (!normalized) return null

  return normalized.slice(0, MAX_CLIENT_ERROR_MESSAGE_LENGTH)
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return null
}

export function isSafeClientErrorMessage(value: unknown) {
  const message = normalizeClientMessage(value)
  if (!message) return false
  if (SAFE_EXACT_MESSAGES.has(message)) return true
  if (UNSAFE_CLIENT_MESSAGE_PATTERNS.some((pattern) => pattern.test(message))) return false

  return true
}

export function toSafeClientErrorMessage(error: unknown, fallback: string) {
  const fallbackMessage = normalizeClientMessage(fallback) ?? 'Request could not be completed.'
  const message = normalizeClientMessage(getErrorMessage(error))

  if (!message) return fallbackMessage
  if (SAFE_EXACT_MESSAGES.has(message)) return message

  return isSafeClientErrorMessage(message) ? message : fallbackMessage
}

export function toSafeClientError(error: unknown, fallback: string, defaultStatus = 400) {
  const message = toSafeClientErrorMessage(error, fallback)

  return {
    message,
    status: message === 'Unauthorized' ? 401 : defaultStatus,
  }
}
