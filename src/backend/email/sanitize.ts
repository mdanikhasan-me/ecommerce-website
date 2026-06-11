const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

const CONTROL_OR_CRLF_PATTERN = /[\r\n\0\x00-\x1f\x7f]/
// Practical address shape; combined with length and control-character checks.
const EMAIL_ADDRESS_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_EMAIL_ADDRESS_LENGTH = 254
const MAX_HEADER_VALUE_LENGTH = 200

/** Escapes a value for safe interpolation into email HTML. */
export function escapeEmailHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] ?? char)
}

/** True when the value is safe for an email header (subject, display name). */
export function isSafeHeaderValue(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > MAX_HEADER_VALUE_LENGTH) return false
  return !CONTROL_OR_CRLF_PATTERN.test(value)
}

/** Validates a single recipient/sender address. Rejects CRLF and header tricks. */
export function isValidEmailAddress(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > MAX_EMAIL_ADDRESS_LENGTH) return false
  if (CONTROL_OR_CRLF_PATTERN.test(value)) return false
  if (/[<>,;"\\]/.test(trimmed)) return false
  return EMAIL_ADDRESS_PATTERN.test(trimmed)
}

export function normalizeEmailAddress(value: string): string {
  return value.trim().toLowerCase()
}

/** Caps and strips control characters from free text used inside email bodies. */
export function cleanEmailText(value: unknown, maxLength = 300): string {
  return String(value ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[\0\x00-\x1f\x7f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}
