import {
  MAX_SECURITY_LOG_STRING_LENGTH,
  sanitizeStringForLog,
  sanitizeUrlForLog,
} from '@/backend/security/security-log'

export const MAX_CSP_REPORT_BODY_BYTES = 16 * 1024
export const MAX_CSP_REPORT_STRING_LENGTH = MAX_SECURITY_LOG_STRING_LENGTH

type JsonObject = Record<string, unknown>

const URL_FIELDS = new Set(['document-uri', 'blocked-uri', 'source-file'])
const STRING_FIELDS = new Set([
  'violated-directive',
  'effective-directive',
  'original-policy',
  'disposition',
])
const NUMBER_FIELDS = new Set(['status-code', 'line-number', 'column-number'])

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function sanitizeCspReportUrl(value: unknown) {
  return sanitizeUrlForLog(value)
}

function sanitizeNumber(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  if (value < 0 || value > 1_000_000) return undefined
  return Math.trunc(value)
}

function getReportObject(input: unknown) {
  if (!isObject(input)) return null

  const report = input['csp-report']
  return isObject(report) ? report : null
}

export function sanitizeCspReportPayload(input: unknown) {
  const report = getReportObject(input)
  if (!report) return null

  const sanitized: Record<string, string | number> = {}

  for (const field of URL_FIELDS) {
    const value = sanitizeCspReportUrl(report[field])
    if (value) sanitized[field] = value
  }

  for (const field of STRING_FIELDS) {
    const value = sanitizeStringForLog(report[field], MAX_CSP_REPORT_STRING_LENGTH)
    if (value) sanitized[field] = value
  }

  for (const field of NUMBER_FIELDS) {
    const value = sanitizeNumber(report[field])
    if (value !== undefined) sanitized[field] = value
  }

  return Object.keys(sanitized).length > 0 ? sanitized : null
}
