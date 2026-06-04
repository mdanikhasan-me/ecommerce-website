import {
  ADMIN_REPORT_EXPORT_METADATA,
  type AdminReportExportType,
} from '@/backend/admin/reports'
import type { SecurityEventInput } from '@/backend/security/security-log'

export const ADMIN_EXPORT_AUDIT_ROUTE = '/api/admin/reports/export' as const
export const ADMIN_EXPORT_AUDIT_METHOD = 'GET' as const

export const ADMIN_EXPORT_AUDIT_RESULTS = ['attempted', 'success', 'blocked', 'failed'] as const
export const ADMIN_EXPORT_AUDIT_ERROR_CODES = [
  'invalid_export_type',
  'unauthorized',
  'forbidden',
  'export_failed',
] as const
export const ADMIN_EXPORT_AUDIT_ACTOR_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

export type AdminExportAuditResult = (typeof ADMIN_EXPORT_AUDIT_RESULTS)[number]
export type AdminExportAuditErrorCode = (typeof ADMIN_EXPORT_AUDIT_ERROR_CODES)[number]
export type AdminExportAuditActorRole = (typeof ADMIN_EXPORT_AUDIT_ACTOR_ROLES)[number]
export type AdminExportAuditEventType =
  | 'admin_export_attempt'
  | 'admin_export_success'
  | 'admin_export_failure'
export type AdminExportAuditSeverity = 'info' | 'warn' | 'error'

export type AdminExportAuditEventInput = {
  result?: unknown
  reportType?: unknown
  statusCode?: number | null
  errorCode?: unknown
  actorRole?: unknown
  timestamp?: string
}

export type AdminExportAuditEvent = {
  type: AdminExportAuditEventType
  timestamp: string
  severity: AdminExportAuditSeverity
  route: typeof ADMIN_EXPORT_AUDIT_ROUTE
  method: typeof ADMIN_EXPORT_AUDIT_METHOD
  statusCode?: number
  errorCode?: AdminExportAuditErrorCode
  userRole?: AdminExportAuditActorRole
  metadata: {
    result: AdminExportAuditResult
    reportTypeValid: boolean
    reportType?: AdminReportExportType
    containsCustomerPii?: boolean
    containsBusinessSensitiveData?: boolean
    containsPaymentOrOrderSensitiveData?: boolean
  }
}

export type AdminExportSecurityEvent = SecurityEventInput

export function isAdminReportExportType(value: unknown): value is AdminReportExportType {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(ADMIN_REPORT_EXPORT_METADATA, value)
  )
}

function isAdminExportAuditErrorCode(value: unknown): value is AdminExportAuditErrorCode {
  return (
    typeof value === 'string' &&
    ADMIN_EXPORT_AUDIT_ERROR_CODES.includes(value as AdminExportAuditErrorCode)
  )
}

function isAdminExportAuditActorRole(value: unknown): value is AdminExportAuditActorRole {
  return (
    typeof value === 'string' &&
    ADMIN_EXPORT_AUDIT_ACTOR_ROLES.includes(value as AdminExportAuditActorRole)
  )
}

function normalizeResult(value: unknown): AdminExportAuditResult {
  return (
    typeof value === 'string' &&
    ADMIN_EXPORT_AUDIT_RESULTS.includes(value as AdminExportAuditResult)
  )
    ? (value as AdminExportAuditResult)
    : 'blocked'
}

function normalizeStatusCode(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined

  const statusCode = Math.trunc(value)
  return statusCode >= 100 && statusCode <= 599 ? statusCode : undefined
}

function eventTypeForResult(result: AdminExportAuditResult): AdminExportAuditEventType {
  if (result === 'attempted') return 'admin_export_attempt'
  if (result === 'success') return 'admin_export_success'
  return 'admin_export_failure'
}

function severityForResult(result: AdminExportAuditResult): AdminExportAuditSeverity {
  if (result === 'failed') return 'error'
  if (result === 'blocked') return 'warn'
  return 'info'
}

function normalizeTimestamp(value: string | undefined) {
  if (value) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  }

  return new Date().toISOString()
}

export function buildAdminExportAuditEvent(
  input: AdminExportAuditEventInput,
): AdminExportAuditEvent {
  const result = normalizeResult(input.result)
  const reportType = isAdminReportExportType(input.reportType) ? input.reportType : undefined
  const metadata = reportType ? ADMIN_REPORT_EXPORT_METADATA[reportType] : undefined
  const event: AdminExportAuditEvent = {
    type: eventTypeForResult(result),
    timestamp: normalizeTimestamp(input.timestamp),
    severity: severityForResult(result),
    route: ADMIN_EXPORT_AUDIT_ROUTE,
    method: ADMIN_EXPORT_AUDIT_METHOD,
    metadata: {
      result,
      reportTypeValid: Boolean(reportType),
    },
  }

  const statusCode = normalizeStatusCode(input.statusCode)
  if (statusCode) event.statusCode = statusCode

  if (isAdminExportAuditErrorCode(input.errorCode)) event.errorCode = input.errorCode
  if (isAdminExportAuditActorRole(input.actorRole)) event.userRole = input.actorRole

  if (metadata) {
    event.metadata.reportType = reportType
    event.metadata.containsCustomerPii = metadata.containsCustomerPii
    event.metadata.containsBusinessSensitiveData = metadata.containsBusinessSensitiveData
    event.metadata.containsPaymentOrOrderSensitiveData =
      metadata.containsPaymentOrOrderSensitiveData
  }

  return event
}

export function buildAdminExportSecurityEvent(
  input: AdminExportAuditEventInput,
): AdminExportSecurityEvent {
  const event = buildAdminExportAuditEvent(input)
  const metadata: NonNullable<SecurityEventInput['metadata']> = {
    result: event.metadata.result,
    reportTypeValid: event.metadata.reportTypeValid,
  }

  if (event.metadata.reportType) metadata.reportType = event.metadata.reportType
  if (typeof event.metadata.containsCustomerPii === 'boolean') {
    metadata.containsCustomerPii = event.metadata.containsCustomerPii
  }
  if (typeof event.metadata.containsBusinessSensitiveData === 'boolean') {
    metadata.containsBusinessSensitiveData = event.metadata.containsBusinessSensitiveData
  }

  return {
    type: event.type,
    timestamp: event.timestamp,
    severity: event.severity,
    route: event.route,
    method: event.method,
    statusCode: event.statusCode,
    errorCode: event.errorCode,
    userRole: event.userRole,
    metadata,
  }
}
